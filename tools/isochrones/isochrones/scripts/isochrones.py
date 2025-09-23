#!/usr/bin/env python3
"""
Script pour générer des isochrones à partir des établissements sur CQLP.
"""

import ssl
import asyncio
import aiohttp
import aiofiles
import argparse
import subprocess
import sys
import signal
from pathlib import Path
from typing import List, Dict, Any
from tinydb import TinyDB, Query
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
import requests


# Constantes
BASE_PATH = "/home/onyxia/work"
PROGRESS_DB = 'progress.json'
TIMES = [5400, 3600, 2700, 1800, 900]

shutdown_requested = asyncio.Event()

def signal_handler(signum, frame):
    """Gestionnaire de signal pour arrêt propre."""
    shutdown_requested.set()
    
def parse_comma_separated(value):
    return [item.strip() for item in value.split(',') if item.strip()]

def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Génère des isochrones à partir des établissements sur CQLP.",
        add_help=True
    )
    
    parser.add_argument('-o', '--output-path', required=True, 
                       help='Répetoire de sortie (required)')
    parser.add_argument('-c', '--cqlp-api', required=True, 
                       help='URL de l\'API CQLP (required)')
    parser.add_argument('-g', '--graphhopper-url', required=True,
                       help='URL du service GraphHopper (required)')
    parser.add_argument('-d', '--isochrone-dates', type=parse_comma_separated, required=True,
                       help='Dates pour les calculs des isochrones (séparées par des virgules, required)')
    parser.add_argument('-p', '--isochrone-parallel', type=int, required=True,
                       help='Nombre de requêtes en parallèle (required)')
    parser.add_argument('profiles', nargs='+', choices=['pt', 'bike'], metavar='PROFILE',
                       help='Profiles GraphHopper (e.g., pt, bike)')
    parser.add_argument('--resume', action='store_true',
                       help='Reprend la création des isochrones à partir du fichier {PROGRESS_DB}')
    
    args = parser.parse_args()
    
    return args


def setup_directories(output_path: str):
    """Crée les répertoires nécessaires"""
    # Créer le répertoire de base
    Path(output_path).mkdir(parents=True, exist_ok=True)


def fetch_etablissements(cqlp_api_url: str) -> List[Dict[str, Any]]:
    """Récupère les données des établissements depuis l'API CQLP."""
    try:
        response = requests.get(f"{cqlp_api_url}/api/etablissements", timeout=30)
        response.raise_for_status()
        
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching establishments: {e}", file=sys.stderr)
        sys.exit(1)


def filter_establishments(etablissements: List[Dict[str, Any]]) -> List[tuple]:
    """Filtre les établissements avec latitude non nulle et retourne UAI, lat, lon."""
    filtered = []
    
    for etab in etablissements:
        if etab.get('latitude') is not None:
            uai = etab.get('uai', '')
            latitude = etab.get('latitude')
            longitude = etab.get('longitude')
            filtered.append((uai, latitude, longitude))
    
    return filtered


def create_isochrone_lists(db,
                          filtered_establishments: List[tuple], 
                          output_path: str,
                          graphhopper_profiles: List[str], 
                          isochrone_dates: str,
                          resume: bool):
    """Crée les listes d'isochrones à faire pour chaque profil, dates et temps."""
    print("Création de la liste des isochrones à faire pour chaque profil, dates et temps.")
    
    base_path = Path(output_path) / Path("isochrones")
    # Créer le répertoire isochrones
    base_path.mkdir(exist_ok=True)
    
    first_run = False
    task_exist = db.all()
    if not task_exist or not resume:
        first_run = True
        db.truncate()
    
    id = 0
    for date in isochrone_dates:
        for profile in graphhopper_profiles:
            for time in TIMES:
                # Créer les répertoires pour chaque date/profil/temps
                Path(f"{base_path}/{profile}/{date}/{time}").mkdir(parents=True, exist_ok=True)

                to_insert = []
                for uai, lat, lon in filtered_establishments:
                    to_insert.append({
                        'id': id,
                        'status': 'pending',
                        'date': date,
                        'profile': profile,
                        'time': time,
                        'uai': uai,
                        'lat': lat,
                        'lon': lon
                    })
                    id += 1
                if first_run:
                    db.insert_multiple(to_insert)


async def fetch_isochrone(graphhopper_url, profile, date, time, uai, latitude, longitude, 
                         base_path=".", session=None):

    isochrones_dir = Path(base_path) / "isochrones" / profile / date / str(time)
    isochrones_dir.mkdir(parents=True, exist_ok=True)
    output_file = isochrones_dir / f"{uai}.json"
    
    api_url = (f"{graphhopper_url}/isochrone"
               f"?point={latitude},{longitude}"
               f"&profile={profile}"
               f"&pt.earliest_departure_time={date}"
               f"&time_limit={time}"
               f"&buckets=1"
               f"&result=multipolygon"
               f"&reverse_flow=true")
    
    # Retry jusqu'à 5 fois comme curl --retry 5
    for attempt in range(5):
        try:
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=1800)) as response:
                if response.status == 200:
                    content = await response.text()
                    
                    async with aiofiles.open(output_file, 'w') as f:
                        await f.write(content)
                    return True
                else:
                    if attempt < 4: 
                        await asyncio.sleep(1)
                        continue
                    else:
                        return False
                        
        except Exception as e:
            print(e)
            if attempt < 4:
                await asyncio.sleep(1)
                continue
            else:
                return False
    return False


async def worker(worker_id: int, task_queue: asyncio.Queue, db: TinyDB, stats: dict, graphhopper_url: str, output_path: str):
    """Worker qui traite les tâches de la queue en continu."""
    Task = Query()
    
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connector = aiohttp.TCPConnector(ssl=ssl_context)
    session = aiohttp.ClientSession(connector=connector)

    try:
        while not shutdown_requested.is_set():
            try:
                task = await asyncio.wait_for(task_queue.get(), timeout=1.0)
                if task is None:
                    task_queue.task_done() 
                    break    
            except asyncio.TimeoutError:
                continue
                
            try:
                # Marquer comme running
                db.update({'status': 'running', 'attempts': task.get('attempts', 0) + 1}, 
                        Task.id == task['id'])
                
                success = await fetch_isochrone(
                    graphhopper_url=graphhopper_url,
                    profile=task['profile'], 
                    date=task['date'],
                    time=task['time'],
                    uai=task['uai'],
                    latitude=task['lat'],
                    longitude=task['lon'],
                    base_path=output_path,
                    session=session
                )
                
                if not shutdown_requested.is_set():
                    if success:
                        db.update({'status': 'completed', 'error': None}, Task.id == task['id'])
                        stats['completed'] += 1
                        print(f"{task['id']} : {task['date']} {task['time']} {task['uai']} done.")
                    else:
                        db.update({'status': 'failed', 'error': 'API request failed'}, Task.id == task['id'])
                        stats['failed'] += 1
                        print(f"{task['id']} : {task['date']} {task['time']} {task['uai']} failed.")
                        
            except Exception as e:
                if not shutdown_requested.is_set():
                    print(f"Worker {worker_id} error: {e}")
                    db.update({'status': 'failed', 'error': str(e)[:200]}, Task.id == task['id'])
                    stats['failed'] += 1
            finally:
                task_queue.task_done()
    except asyncio.CancelledError:
        raise
    except Exception as e:
        print(f"Worker {worker_id} error: {e}")
        stats['failed'] += 1
    finally:
        await session.close()
        print(f"Worker {worker_id} terminé.")


async def process_isochrones(db, graphhopper_url: str, output_path: str, parallel_count: int):
    """Requête les isochrones en parallèle."""
    print("Création des isochrones")
    
    Task = Query()
    task_queue = asyncio.Queue()
    stats = {'completed': 0, 'failed': 0}
    
    print(f"Création de {parallel_count} workers...")
    workers = [
        asyncio.create_task(worker(i, task_queue, db, stats, graphhopper_url, output_path))
        for i in range(parallel_count)
    ]
    last_stats_time = asyncio.get_event_loop().time()
    
    print(f"Récupération des isochrones")
    
    try:
        while not shutdown_requested.is_set():
            pending = db.search(Task.status == 'pending')
            if not pending:
                print("Plus de tâches à effectuer")
                break
            
            batch_size = min(len(pending), parallel_count * 2)
            for task in pending[:batch_size]:
                if shutdown_requested.is_set():
                    break
                updated_docs = db.update({'status': 'queued'}, (Task.id == task['id']) & (Task.status == 'pending'))
                if updated_docs:
                    await task_queue.put(task)

            while task_queue.qsize() > parallel_count and not shutdown_requested.is_set():
                await asyncio.sleep(1)
            current_time = asyncio.get_event_loop().time()
            if current_time - last_stats_time > 10:  # Toutes les 10 secondes
                remaining = len(db.search(Task.status == 'pending'))
                print(f"Progress: ✅{stats['completed']} ❌{stats['failed']} | Queue: {task_queue.qsize()} | Remaining: {remaining}")
                last_stats_time = current_time
            
            await asyncio.sleep(0.5)
    
        while task_queue.qsize() > 0 and not shutdown_requested.is_set():
            await asyncio.sleep(1)
    finally:
        for _ in workers:
            await task_queue.put(None)
        
        for worker_r in workers:
            if not worker_r.done():
                worker_r.cancel()
                
        await asyncio.gather(*workers, return_exceptions=True)
    
    return stats

def show_stats(db: TinyDB):
    """Affiche les statistiques."""
    Task = Query()
    all_tasks = db.all()
    
    if not all_tasks:
        print("No tasks in database")
        return
    
    total = len(all_tasks)
    completed = len(db.search(Task.status == 'completed'))
    failed = len(db.search(Task.status == 'failed'))
    pending = len(db.search(Task.status == 'pending'))
    
    print(f"\n=== Statistics ===")
    print(f"Total: {total}")
    print(f"✅ Completed: {completed} ({completed/total*100:.1f}%)")
    print(f"❌ Failed: {failed}")
    print(f"⏳ Pending: {pending}")
    
    if failed > 0:
        print(f"\nRecent errors:")
        failed_tasks = db.search(Task.status == 'failed')
        for task in failed_tasks[-3:]:
            print(f"  - {task['id']}: {task.get('error', 'Unknown')}")
            
async def main():
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    db = None

    try:
        args = parse_arguments()
        
        setup_directories(args.output_path)
        
        db = TinyDB(Path(args.output_path) / PROGRESS_DB, 
            storage=CachingMiddleware(JSONStorage),
            indent=None)
        
        
        etablissements = fetch_etablissements(args.cqlp_api)
        
        filtered_establishments = filter_establishments(etablissements)
        print(f"{len(filtered_establishments)} établissements à traiter")
        
        # Créer les listes d'isochrones
        create_isochrone_lists(
            db,
            filtered_establishments,
            args.output_path,
            args.profiles,
            args.isochrone_dates,
            args.resume
        )
        db.storage.flush()
        
        # Traiter les isochrones
        await process_isochrones(db, args.graphhopper_url, args.output_path, args.isochrone_parallel)
        
        show_stats(db)
        
        print("Création des isochrones terminées")
        
    except KeyboardInterrupt:
        print("\nScript interrupted by user", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        if db is not None:
            try:
                if hasattr(db.storage, 'flush'):
                    db.storage.flush()
                db.close()
            except Exception as e:
                print(f"Erreur lors de la fermeture de la base: {e}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)