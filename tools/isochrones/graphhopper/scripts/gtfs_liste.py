#!/usr/bin/env python3
"""
Télécharge et traite les fichiers GTFS à partir d'un CSV en passant par l'API de transport.data.gouv.fr
Créer le fichier de config pour Graphhopper à partir de la liste des GTFS
"""
import yaml
import sys
import argparse
import subprocess
import csv
import requests
import os
from string import Template
from pathlib import Path
from datetime import datetime


def edit_yaml_template(template_path, output_path, **kwargs):
    # Lire le template
    with open(template_path, 'r') as file:
        template_content = file.read()
    
    # Remplacer les variables
    template = Template(template_content)
    filled_content = template.substitute(**kwargs)
    
    # Charger et sauvegarder le YAML
    config = yaml.safe_load(filled_content)
    
    with open(output_path, 'w') as file:
        yaml.dump(config, file, default_flow_style=False, indent=2)
    
    return config

def generate_graphhopper_config(gtfs_list, config_path):
    current_dir = Path(__file__).parent
    config_template_path = current_dir / "config_template.yml"
                
    config = edit_yaml_template(
        config_template_path,
        config_path,
         host='localhost',
        gtfs=','.join(["gtfs/" + element for element in gtfs_list])
    )
    
def get_processor_path():
    """
    Trouve le chemin vers gtfs.py
    
    Returns:
        Path: Chemin vers le script gtfs.py
    """
    # Chercher dans le même répertoire que ce script
    current_dir = Path(__file__).parent
    processor_path = current_dir / "gtfs.py"
    
    if processor_path.exists():
        return processor_path
    
    # Chercher dans le répertoire courant
    processor_path = Path("gtfs.py")
    if processor_path.exists():
        return processor_path
    
    raise FileNotFoundError("gtfs.py non trouvé. Assurez-vous qu'il soit dans le même répertoire.")


def run_gtfs_processor(url, filename, output_dir, only_sco_in_mixte, processor_args=None):
    """
    Execute gtfs.py
    
    Args:
        url: URL du fichier GTFS
        filename: Nom du fichier de sortie
        output_dir: Répertoire de sortie
        only_sco_in_mixte: indique que l'on ne veut garder que le scolaire d'un fichier mixte
        processor_args: Arguments supplémentaires pour le processeur
    
    Returns:
        bool: True si le traitement a réussi
    """
    try:
        # Obtenir le chemin du processeur
        processor_path = get_processor_path()
        
        # Construire la commande
        cmd = [
            sys.executable,
            str(processor_path),
            "--url", url,
            "--output", filename,
            "--output-dir", str(output_dir)
        ]
        
        if only_sco_in_mixte:
            cmd.append('--keep-only-sco-and-transform')
        
        # Ajouter les arguments supplémentaires
        if processor_args:
            cmd.extend(processor_args)
        
        print(f"  → Lancement: {' '.join(cmd[2:])}")  # Afficher sans python et le chemin
        
        # Exécuter le processeur
        result = subprocess.run(cmd, check=True, capture_output=False, text=True)
        return result.returncode == 0
        
    except subprocess.CalledProcessError as e:
        print(f"    ❌ Erreur lors de l'exécution de gtfs_processor: code {e.returncode}")
        return False
    except FileNotFoundError as e:
        print(f"    ❌ {e}")
        return False
    except Exception as e:
        print(f"    ❌ Erreur inattendue: {e}")
        return False




def check_processor_availability():
    """
    Vérifie que gtfs.py est disponible
    
    Returns:
        bool: True si le processeur est disponible
    """
    try:
        processor_path = get_processor_path()
        print(f"✅ Processeur GTFS trouvé: {processor_path}")
        
        # Tester l'exécution du processeur
        cmd = [sys.executable, str(processor_path), "--help"]
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True
        
    except FileNotFoundError as e:
        print(f"❌ {e}")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du test du processeur: {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False


def call_api_transport_data_gouv(data_id, gtfs_id):
    """
    Appel l'API de transport.data.gouv et renvoi l'url d'un GTFS
    
    Args:
        data_id: ID du dataset
        gtfs_id: ID du gtfs
    
    Returns:
        Tuple[string, List[Tuple[string, string]]]: (l'url du GTFS, List[date de début d'un réseau, date de fin d'un réseau])
    """

    url = "https://transport.data.gouv.fr/api/datasets/" + data_id
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()
        gtfs = None
        for resource in data['resources']:
            if resource['id'] == int(gtfs_id):
                gtfs = resource
                break
    
        if not gtfs:
            print(f"    ✗ GTFS {gtfs_id} pour le dataset {data_id} introuvable")
            return (None, [])
        
        dates_range = []
        if gtfs['metadata']['networks_start_end_dates']:
            for network in gtfs['metadata']['networks']:
                try:
                    date_range = gtfs['metadata']['networks_start_end_dates'][network]
                    dates_range.append((date_range['start_date'], date_range['end_date']))
                except Exception as e:
                    print(f"    ✗ Impossible de récupérer le range de date : {e}")
        elif gtfs['metadata']['start_date'] and gtfs['metadata']['end_date']:
            dates_range.append((gtfs['metadata']['start_date'], gtfs['metadata']['end_date']))
        else:
            print(f"    ✗ Impossible de récupérer le range de date : {e}")
        return (gtfs['original_url'], dates_range)
    except Exception as e:
        print(f"    ✗ Une erreur est survenue : {e}")
        return (None, [])
    
def get_gtfs_list(csv_file, modalite, only_display_range):
    """
    Créer la liste de téléchargements des GTFS à partir d'un CSV
    
    Returns:
        List[Tuple[int, str, str, List[Tuple[str, str], bool]]: Liste de tuples (Numéro de ligne dans le CSV, URL, nom_fichier, Liste de tuples (Date de début, date de fin), flag pour garder uniquement les transports scolaires)
    """
    
    success = 0
    failed = []
    warning = []

    # Lire le fichier CSV
    lines = []
    with open(csv_file, 'r', encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            lines.append(row) 
    
    download_list = []
    for i, line in enumerate(lines, 1):
        url = None
        dates_range = None
        if modalite == 'transport' and (line['Type'] == 'Transport' or line['Type'] == 'Mixte'):
            (url, dates_range) = call_api_transport_data_gouv(line['ID Transport Data'], line['ID GTFS'])
        elif modalite == 'scolaire' and (line['Type'] == 'Scolaire' ):  # or line['Type'] == 'Mixte'
            (url, dates_range) = call_api_transport_data_gouv(line['ID Transport Data'], line['ID GTFS'])
        else:
            continue
        
        if not url:
            print(f"    ✗ Impossible de récupérer une url pour le GTFS {i}/{line['Nom']}/{line['ID Transport Data']}/{line['ID GTFS']}")
            failed.append((i, line['Nom'], line['ID Transport Data'], line['ID GTFS'], 'Pas d\'url de GTFS'))
            continue

        if not dates_range:
            warning.append((i, line['Nom'], line['ID Transport Data'], line['ID GTFS'], 'Pas de range de date'))
        else:
            success += 1

        download_list.append(
            (i, url, str(i) + ".zip", dates_range, modalite == 'scolaire' and line['Type'] == 'Mixte')
        )       
        print(f"    Date de disponibilités des données pour: {i}/{line['Nom']}/{line['ID Transport Data']}/{line['ID GTFS']} : ")
        if not dates_range:
            print(f"        - Aucune données disponibles")
        for date_range in dates_range:
            print(f"        - du {date_range[0]} au {date_range[1]}")

    return (download_list, success, failed, warning)


def process_downloads(downloads, output_dir, processor_args=None):
    """
    Traite une liste de téléchargements Gde TFS
    
    Args:
        downloads: Liste des téléchargements à traiter
        output_dir: Répertoire de sortie
        processor_args: Arguments à passer au processeur
        show_summary: Afficher le résumé final
    
    Returns:
        Tuple[int, int, List[str]]: (succès, total, échecs)
    """
    success_count = 0
    total_count = len(downloads)
    failed_downloads = []
    gtfs_list = []
    
    print(f"\n📋 {total_count} fichiers GTFS à traiter")
    
    # Traiter chaque téléchargement
    for i, (id, url, filename, dates_range, only_sco_in_mixte) in enumerate(downloads, 1):
        print(f"\n🔄 [{i}/{total_count}] Traitement: {filename}")
        
        if run_gtfs_processor(url, filename, output_dir, only_sco_in_mixte, processor_args):
            success_count += 1
            gtfs_list.append(filename)
            print(f"    ✅ SUCCÈS: {id}/{filename}")
        else:
            failed_downloads.append(filename)
            print(f"    ❌ ÉCHEC: {id}/{filename}")
    
    return success_count, total_count, gtfs_list, failed_downloads



def merge_overlapping_intervals(intervals):
    """
    Fusionne les intervalles qui se chevauchent ou sont adjacents.
    
    Args:
        intervals: Liste d'intervalles (datetime, datetime)
    
    Returns:
        List[Tuple[datetime, datetime]]: Intervalles fusionnés et triés
    """
    if not intervals:
        return []
    
    # Trier les intervalles par date de début
    sorted_intervals = sorted(intervals, key=lambda x: x[0])
    merged = [sorted_intervals[0]]
    
    for current_start, current_end in sorted_intervals[1:]:
        last_start, last_end = merged[-1]
        
        # Si l'intervalle courant chevauche avec le dernier ou est adjacent
        if current_start <= last_end:
            # Fusionner en étendant la date de fin si nécessaire
            merged[-1] = (last_start, max(last_end, current_end))
        else:
            # Ajouter comme nouvel intervalle
            merged.append((current_start, current_end))
    
    return merged

def find_common_date_intervals(all_date_ranges):
    """
    Trouve les intervalles de dates en commun à partir de toutes les plages de dates des GTFS.
    
    Args:
        all_date_ranges: Liste de listes de tuples (date_debut, date_fin) pour chaque GTFS
                        Format des dates: 'YYYY-MM-DD'
    Returns:
        List[Tuple[str, str]]: Liste des intervalles communs (date_debut, date_fin)
                              Liste vide si aucun intervalle commun
    
    Example:
        >>> ranges = [
        ...     [('2024-01-01', '2024-06-30'), ('2024-07-01', '2024-12-31')],
        ...     [('2024-03-01', '2024-09-30')],
        ...     [('2024-02-01', '2024-08-31')]
        ... ]
        >>> find_common_date_intervals(ranges)
        [('2024-03-01', '2024-06-30'), ('2024-07-01', '2024-08-31')]
    """
    if not all_date_ranges or not any(all_date_ranges):
        return []
    
    # Convertir toutes les dates en objets datetime et aplatir la liste
    all_intervals = []
    for gtfs_ranges in all_date_ranges:
        if gtfs_ranges:  # Ignorer les listes vides
            intervals = []
            for start_str, end_str in gtfs_ranges:
                try:
                    start_date = datetime.strptime(start_str, '%Y-%m-%d')
                    end_date = datetime.strptime(end_str, '%Y-%m-%d')
                    intervals.append((start_date, end_date))
                except ValueError as e:
                    print(f"⚠️ Format de date invalide: {start_str} - {end_str} ({e})")
                    continue
            if intervals:
                all_intervals.append(intervals)
    
    if not all_intervals:
        return []
    
    # Si on n'a qu'un seul GTFS, retourner ses intervalles
    if len(all_intervals) == 1:
        return [(start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d')) 
                for start, end in all_intervals[0]]
    
    # Calculer l'intersection de tous les intervalles
    common_intervals = []
    
    # Prendre le premier ensemble d'intervalles comme base
    base_intervals = all_intervals[0]
    
    for base_start, base_end in base_intervals:
        # Pour chaque intervalle de base, trouver les intersections avec tous les autres GTFS
        current_intervals = [(base_start, base_end)]
        
        # Itérer sur chaque autre GTFS
        for other_gtfs_intervals in all_intervals[1:]:
            new_intervals = []
            
            # Pour chaque intervalle courant, trouver les intersections avec ce GTFS
            for curr_start, curr_end in current_intervals:
                for other_start, other_end in other_gtfs_intervals:
                    # Calculer l'intersection
                    intersection_start = max(curr_start, other_start)
                    intersection_end = min(curr_end, other_end)
                    
                    # Si l'intersection est valide, l'ajouter
                    if intersection_start <= intersection_end:
                        new_intervals.append((intersection_start, intersection_end))
            
            current_intervals = new_intervals
            
            # Si plus d'intervalles communs, arrêter
            if not current_intervals:
                break
        
        # Ajouter les intervalles trouvés aux résultats
        common_intervals.extend(current_intervals)
    
    # Fusionner les intervalles qui se chevauchent ou sont adjacents
    if common_intervals:
        common_intervals = merge_overlapping_intervals(common_intervals)
    
    # Convertir en format string
    return [(start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d')) 
            for start, end in common_intervals]


def show_date_ranges(downloads):
    print(f"{'='*40}")
    print(f"\n📅 DATES DE COUVERTURES")
    print(f"{'='*40}")
    
    print(f"GTFS,Date de début,Date de fin")
    
    all_date_ranges = []
    for download in downloads:
        dates_range = download[3]
        if dates_range:
            all_date_ranges.append(dates_range)
            for date_range in dates_range:
                print(f"{download[0]},{date_range[0]},{date_range[1]}")
    common_intervals = find_common_date_intervals(all_date_ranges)
    
    print(f"{'='*40}")
    print(f"\n📅 INTERVALLES COMMUNS")
    print(f"{'='*40}")
    if common_intervals:
        print(f"✅ {len(common_intervals)} intervalle(s) en commun trouvé(s):")
        for i, (start, end) in enumerate(common_intervals, 1):
            print(f"  {i}. Du {start} au {end}")
    else:
        print("❌ Aucun intervalle commun trouvé entre tous les GTFS")

def main():
    parser = argparse.ArgumentParser(description='Télécharge et nettoie une liste de GTFS')
    parser.add_argument('--csv', '-c', required=True,
                       help='Fichier CSV contenant la liste des GTFS')
    parser.add_argument('--config-path', '-g', type=str, default='config.yml',
                       help='Fichier de sortie de configuration de graphhopper')
    
    parser.add_argument('--output-dir', '-o', type=str, default='.',
                       help='Répertoire de sortie pour les fichiers GTFS (défaut: répertoire courant)')
    parser.add_argument('--temp-base', '-t', type=str, default=None,
                       help='Répertoire de base pour les dossiers temporaires (défaut: système)')
    
    parser.add_argument('--modalite', '-m', type=str, default=None, required=True, choices=['scolaire', 'transport'], help='Modalité de transport (scolaire ou transport)')
    
    # TODO: affiche uniquement le range
    parser.add_argument('--only-display-range', action='store_true',
                       help='Afficher uniquement la date de début et de fin de chaque GTFS (à partir de l\'API transport.data.gouv)')
    
    args = parser.parse_args()
    
    print("🚀 Téléchargement et nettoyage des GTFS")

    # Vérifier que le processeur est disponible
    if not check_processor_availability():
        print("\n❌ Impossible de continuer sans gtfs.py")
        sys.exit(1)
    
    # Obtenir la liste des GTFS à partir du CSV
    (all_downloads, list_sucess, list_failed, list_warning) = get_gtfs_list(args.csv, args.modalite, args.only_display_range)
    total_list = list_sucess + len(list_failed) + len(list_warning)
    
    downloads = all_downloads
    
    # Définir le répertoire de sortie
    output_dir = Path(args.output_dir).resolve()
    print(f"📁 Répertoire de sortie: {output_dir}")
    
    # Construire les arguments pour le processeur
    processor_args = []
    
    if args.temp_base:
        processor_args.extend(["--temp-base", args.temp_base])
        print(f"🗂️  Répertoire temporaire de base: {args.temp_base}")
    
    success_count = 0
    total_count = 0
    gtfs_list = []
    failed_downloads = []
    if not args.only_display_range:
        # Traiter les téléchargements
        success_count, total_count, gtfs_list, failed_downloads = process_downloads(
            downloads, output_dir, processor_args
        )
    
    # Résumé final
    print(f"\n{'='*80}")
    print(f"📊 RÉSUMÉ FINAL")
    print(f"{'='*80}")
    
    print(f"\n{'='*40}")
    print(f"📊 Création de la liste")
    print(f"{'='*40}")
    print(f"✅ Succès: {list_sucess}/{total_list} GTFS")
    print(f"❌ Échecs: {len(list_failed)}/{total_list} GTFS")
    print(f"⚠️ Attention: {len(list_warning)}/{total_list} GTFS")
    if list_failed:
        print(f"\n📋 GTFS en échec:")
        for (id, name, dataset_id, gtfs_id, list_err) in list_failed:
            print(f"  - {id}/{name}/{dataset_id}/{gtfs_id} : {list_err}")
    if list_warning:
        print(f"\n📋 GTFS à vérifier")
        for (id, name, dataset_id, gtfs_id, list_err) in list_warning:
            print(f"  - {id}/{name}/{dataset_id}/{gtfs_id} : {list_err}")
    
    # Range des GTFS
    show_date_ranges(downloads)
    
    print(f"\n{'='*40}")
    print(f"📊 Téléchargement")
    print(f"{'='*40}")
    print(f"✅ Succès: {success_count}/{total_count} fichiers")
    print(f"❌ Échecs: {len(failed_downloads)}/{total_count} fichiers")
    
    if failed_downloads:
        print(f"\n📋 Fichiers en échec:")
        for filename in failed_downloads:
            print(f"  - {filename}")
    
    print(f"\n📁 Fichiers disponibles dans: {output_dir}")
    
    if not args.only_display_range:
        generate_graphhopper_config(gtfs_list, args.config_path)
        print(f"\n📁 Fichier de configuration de graphhopper : {args.config_path}")
        
    
    if success_count == total_count:
        print(f"\n🎉 Tous les téléchargements terminés avec succès!")
        
    
    # Code de sortie
    if success_count < total_count:
        sys.exit(1)



if __name__ == "__main__":
    main()
