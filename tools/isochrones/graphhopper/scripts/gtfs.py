#!/usr/bin/env python3
"""
Script de téléchargement et de nettoyage des fichiers GTFS
"""

import os
import requests
import zipfile
import tempfile
import shutil
import subprocess
import re
from pathlib import Path
from typing import Optional
import csv
import time


def fix_empty_transfer_type(working_dir: Path):
    """
    Corrige les valeurs vides dans transfers.txt en les remplaçant par "0"
    
    Args:
        working_dir: Répertoire de travail où se trouve transfers.txt
    """
    transfers_file = working_dir / "transfers.txt"
    if not transfers_file.exists():
        return
    
    print("  → Correction des transfer_type vides dans transfers.txt")
    
    try:
        # Lire le fichier CSV
        with open(transfers_file, 'r', encoding='utf-8', newline='') as f:
            reader = csv.reader(f)
            rows = list(reader)
        
        if not rows:
            return
            
        # Trouver la colonne transfer_type
        header = rows[0]
        transfer_type_col = None
        for i, col in enumerate(header):
            if col.strip() == "transfer_type":
                transfer_type_col = i
                break
        
        if transfer_type_col is None:
            return
        
        # Corriger les valeurs vides
        for row in rows[1:]:  # Ignorer l'en-tête
            if len(row) > transfer_type_col and row[transfer_type_col].strip() == "":
                row[transfer_type_col] = "0"
        
        # Réécrire le fichier
        with open(transfers_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(rows)
            
    except Exception as e:
        print(f"    ✗ Erreur lors de la correction de transfers.txt: {e}")


def download_file_with_retry(url: str, filepath: Path, max_retries: int = 5, wait_time: int = 5) -> bool:
    """
    Télécharge un fichier avec des tentatives multiples
    
    Args:
        url: URL du fichier à télécharger
        filepath: Chemin complet où sauvegarder le fichier
        max_retries: Nombre maximum de tentatives
        wait_time: Temps d'attente entre les tentatives
    """
    for attempt in range(max_retries):
        try:
            print(f"  → Téléchargement (tentative {attempt + 1}/{max_retries})")
            
            response = requests.get(url, stream=True, headers= {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },timeout=30)
            response.raise_for_status()
            
            # Créer le répertoire parent si nécessaire
            filepath.parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'wb') as f:
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
                
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        
                        # Afficher le progrès pour les gros fichiers
                        if total_size > 1024 * 1024:  # > 1MB
                            progress = (downloaded / total_size) * 100 if total_size else 0
                            print(f"    {progress:.1f}% ({downloaded // 1024} KB)", end='\r')
            
            if total_size > 1024 * 1024:
                print()  # Nouvelle ligne après le progrès
            
            print(f"    ✓ Téléchargement réussi ({filepath.stat().st_size // 1024} KB)")
            return True
            
        except (requests.RequestException, Exception) as e:
            print(f"    ✗ Échec tentative {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                print(f"    ⏳ Attente de {wait_time} secondes...")
                time.sleep(wait_time)
            else:
                print(f"    ✗ Échec définitif du téléchargement")
                return False
    
    return False


def extract_zip_with_subfolder(zip_path: Path, temp_dir: Path) -> bool:
    """
    Extrait un zip qui contient un sous-dossier et recrée le zip au niveau racine
    
    Args:
        zip_path: Chemin vers le fichier zip
        temp_dir: Répertoire temporaire pour les extractions
    """
    extract_dir = temp_dir / "extract"
    extract_dir.mkdir(exist_ok=True)
    
    try:
        print(f"  → Extraction avec correction de sous-dossier")
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Trouver le premier sous-dossier
        subdirs = [d for d in extract_dir.iterdir() if d.is_dir()]
        
        if not subdirs:
            print("    ✓ Aucun sous-dossier trouvé dans le zip, tâche ignorée.")
            return True
        
        subdir_path = subdirs[0]  # Premier sous-dossier
        print(f"    → Sous-dossier trouvé: {subdir_path.name}")
        
        # Recréer le zip avec les fichiers du sous-dossier
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_STORED) as new_zip:
            for file_path in subdir_path.rglob('*'):
                if file_path.is_file():
                    arcname = file_path.relative_to(subdir_path)
                    new_zip.write(file_path, arcname)
        
        print(f"    ✓ Zip repackagé sans sous-dossier")
        return True
        
    except Exception as e:
        print(f"    ✗ Erreur lors de l'extraction avec sous-dossier: {e}")
        return False


def fix_coordinates_in_zip(zip_path: Path, temp_dir: Path) -> bool:
    """
    Corrige les coordonnées avec un signe "+" dans shapes.txt et stops.txt
    
    Args:
        zip_path: Chemin vers le fichier zip
        temp_dir: Répertoire temporaire pour les extractions
    """
    extract_dir = temp_dir / "coord_fix"
    extract_dir.mkdir(exist_ok=True)
    
    try:
        print(f"  → Correction des coordonnées")
        
        # Extraire le zip
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Corriger les fichiers shapes.txt et stops.txt
        files_corrected = 0
        for filename in ['shapes.txt', 'stops.txt']:
            file_path = extract_dir / filename
            if file_path.exists():
                print(f"    → Correction de {filename}")
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Compter les corrections
                matches = re.findall(r'\+([0-9.]+)', content)
                if matches:
                    print(f"    → {len(matches)} coordonnées à corriger dans {filename}")
                    
                    # Remplacer +nombre par nombre (regex équivalente à sed)
                    corrected_content = re.sub(r'\+([0-9.]+)', r'\1', content)
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(corrected_content)
                    
                    files_corrected += 1
        
        # Recréer le zip seulement si des corrections ont été faites
        if files_corrected > 0:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_STORED) as new_zip:
                for file_path in extract_dir.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(extract_dir)
                        new_zip.write(file_path, arcname)
            
            print(f"    ✓ {files_corrected} fichier(s) corrigé(s)")
        else:
            print(f"    ✓ Aucune correction nécessaire")
        
        return True
        
    except Exception as e:
        print(f"    ✗ Erreur lors de la correction des coordonnées: {e}")
        return False


def run_gtfsclean(zip_path: Path, temp_dir: Path) -> bool:
    """
    Exécute l'outil gtfsclean sur le fichier
    
    Args:
        zip_path: Chemin vers le fichier zip GTFS
        temp_dir: Répertoire temporaire pour les opérations
    """
    try:
        # Obtenir le chemin Go
        gopath_result = subprocess.run(['go', 'env', 'GOPATH'], 
                                     capture_output=True, text=True, check=True)
        gopath = gopath_result.stdout.strip()
        
        gtfsclean_path = Path(gopath) / 'bin' / 'gtfsclean'
        
        if not gtfsclean_path.exists():
            print(f"    ⚠️  gtfsclean non trouvé à {gtfsclean_path}")
            print("    → Vous devez installer gtfsclean: go install github.com/patrickbr/gtfsclean@latest")
            return False
        
        print(f"  → Exécution de gtfsclean")
        
        # Changer vers le répertoire temporaire pour gtfsclean
        original_dir = os.getcwd()
        os.chdir(temp_dir)
        
        try:
            # Copier le zip dans le répertoire temporaire
            temp_zip = temp_dir / zip_path.name
            shutil.copy2(zip_path, temp_zip)
            
            # Exécuter gtfsclean
            result = subprocess.run([str(gtfsclean_path), '-SCRmTcsOeD', str(temp_zip)], 
                                  check=True, capture_output=True, text=True)
            
            # gtfsclean crée un dossier gtfs-out
            gtfs_out_dir = temp_dir / "gtfs-out"
            if gtfs_out_dir.exists():
                print(f"    ✓ gtfsclean terminé, traitement des résultats")
                
                # Aller dans gtfs-out pour les corrections finales
                os.chdir(gtfs_out_dir)
                
                # Corriger les transfer_type vides
                fix_empty_transfer_type(gtfs_out_dir)
                
                # Recréer le zip final
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_STORED) as new_zip:
                    for file_path in gtfs_out_dir.glob("*"):
                        if file_path.is_file():
                            new_zip.write(file_path, file_path.name)
                
                print(f"    ✓ Fichier GTFS nettoyé et repackagé")
                return True
            else:
                print(f"    ⚠️  gtfs-out non créé, copie du fichier original")
                shutil.copy2(temp_zip, zip_path)
                return True
                
        finally:
            os.chdir(original_dir)
        
    except subprocess.CalledProcessError as e:
        print(f"    ⚠️  Erreur gtfsclean : {e}")
        return False
    except Exception as e:
        print(f"    ⚠️  Erreur inattendue avec gtfsclean: {e}")
        return False

def download_and_clean(url: str, filename: str, output_dir: Path) -> bool:
    """
    Args:
        url: URL du fichier à télécharger
        filename: Nom du fichier de destination
        output_dir: Répertoire où sauvegarder le fichier final
    """
    print(f"\n{'='*80}")
    print(f"📦 TRAITEMENT DE: {filename}")
    print(f"🌐 URL: {url}")
    print(f"{'='*80}")
    
    # Créer un dossier temporaire pour ce téléchargement
    with tempfile.TemporaryDirectory(prefix=f"gtfs_{filename.replace('.zip', '')}_") as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        print(f"📁 Dossier temporaire: {temp_dir}")
        
        # Chemin temporaire du fichier zip
        temp_zip_path = temp_dir / filename
        final_zip_path = output_dir / filename
        
        try:
            # Étape 1: Téléchargement
            print(f"\n🔽 ÉTAPE 1: Téléchargement")
            if not download_file_with_retry(url, temp_zip_path):
                return False
            
            # Étape 2: Correction du sous-dossier si nécessaire
            print(f"\n📂 ÉTAPE 2: Correction du sous-dossier")
            subfolder_temp = temp_dir / "subfolder"
            subfolder_temp.mkdir()
            if not extract_zip_with_subfolder(temp_zip_path, subfolder_temp):
                return False
           
            
            # Étape 3: Correction des coordonnées si nécessaire
            print(f"\n🗺️  ÉTAPE 3: Correction des coordonnées")
            coord_temp = temp_dir / "coordinates"
            coord_temp.mkdir()
            if not fix_coordinates_in_zip(temp_zip_path, coord_temp):
                return False
           
            
            # Étape 4: Nettoyage avec gtfsclean
            print(f"\n🧹 ÉTAPE 4: Nettoyage GTFS")
            clean_temp = temp_dir / "clean"
            clean_temp.mkdir()
            if not run_gtfsclean(temp_zip_path, clean_temp):
                print("    ⚠️  Continuant malgré l'échec de gtfsclean")
        
            
            # Étape 5: Copie vers le répertoire final
            print(f"\n💾 ÉTAPE 5: Sauvegarde finale")
            output_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(temp_zip_path, final_zip_path)
            
            # Vérifier la taille du fichier final
            final_size = final_zip_path.stat().st_size
            print(f"    ✓ Fichier sauvegardé: {final_zip_path}")
            print(f"    ✓ Taille finale: {final_size // 1024} KB")
            
            return True
            
        except Exception as e:
            print(f"    ✗ Erreur lors du traitement de {filename}: {e}")
            return False


def check_tools_availability():
    """
    Vérifie que les outils nécessaires sont disponibles
    
    Returns:
        bool: True si Go est disponible
    """
    try:
        result = subprocess.run(['go', 'version'], check=True, capture_output=True, text=True)
        print(f"✅ Go disponible: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  Go n'est pas installé - gtfsclean ne sera pas disponible")
        return False


def main():
    """
    Télécharge et nettoie un GTFS
    """
    import argparse
    import platform
    import sys
    
    parser = argparse.ArgumentParser(
        description='Télécharge et nettoie un fichier GTFS',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples d'utilisation:
  %(prog)s --url "https://example.com/gtfs.zip" --output "my-gtfs.zip"
  %(prog)s --url "https://example.com/gtfs.zip" --output "my-gtfs.zip" --output-dir "/path/to/save"
  %(prog)s --url "https://example.com/gtfs.zip" --output "my-gtfs.zip" --temp-base "/tmp/gtfs-work"
        """
    )
    
    parser.add_argument('--url', '-u', required=True,
                       help='URL du fichier GTFS à télécharger')
    parser.add_argument('--output', '-f', required=True,
                       help='Nom du fichier de sortie (ex: my-gtfs.zip)')
    parser.add_argument('--output-dir', '-o', type=str, default='.',
                       help='Répertoire de sortie (défaut: répertoire courant)')
    parser.add_argument('--temp-base', '-t', type=str, default=None,
                       help='Répertoire de base pour les dossiers temporaires (défaut: système)')
    
    # TODO: gérer la transformation des codes 712 (bus scolaire)
    #--keep-only-sco-and-transform
    
    args = parser.parse_args()
    
    # Affichage des informations de démarrage
    print("🔧 Téléchargement et nettoyage du GTFS")
    
    # Définir le répertoire de sortie
    output_dir = Path(args.output_dir).resolve()
    print(f"📁 Répertoire de sortie: {output_dir}")
    
    # Configurer le répertoire temporaire de base si spécifié
    if args.temp_base:
        temp_base = Path(args.temp_base).resolve()
        temp_base.mkdir(parents=True, exist_ok=True)
        tempfile.tempdir = str(temp_base)
        print(f"🗂️  Répertoire temporaire de base: {temp_base}")
    
    # Vérifier que les outils nécessaires sont disponibles
    tools_available = check_tools_availability()
    if not tools_available:
        print("❌  Go n'est pas installé - gtfsclean ne sera pas disponible")
        print(f"\n❌ ÉCHEC: Impossible de traiter {args.output}")
        sys.exit(1)
    
    # Traitement du fichier
    print(f"\n🎯 Traitement du fichier GTFS:")
    print(f"   URL: {args.url}")
    print(f"   Fichier: {args.output}")
    
    # Fonction de traitement personnalisée pour le mode standalone
    success = download_and_clean(
        url=args.url,
        filename=args.output,
        output_dir=output_dir
    )
    
    if success:
        print(f"\n✅ SUCCÈS: {args.output} traité avec succès")
        print(f"📁 Fichier disponible: {output_dir / args.output}")
        sys.exit(0)
    else:
        print(f"\n❌ ÉCHEC: Impossible de traiter {args.output}")
        sys.exit(1)


if __name__ == "__main__":
    main()
