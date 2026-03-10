#!/bin/bash

# Configuration — modifier ces valeurs avant le premier lancement
DOMAIN="futurpro.inserjeunes.beta.gouv.fr"
EMAIL="contact@inserjeunes.beta.gouv.fr"
STAGING=0 # Mettre à 1 pour tester avec le serveur staging de Let's Encrypt (pas de rate limit)

if [ -z "$EMAIL" ]; then
  echo "Erreur : veuillez configurer la variable EMAIL dans ce script."
  exit 1
fi

CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

echo "### Création des répertoires nécessaires..."
mkdir -p ./certbot-conf ./certbot-www

echo "### Téléchargement des paramètres SSL recommandés..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > ./certbot-conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ./certbot-conf/ssl-dhparams.pem

echo "### Création d'un certificat auto-signé temporaire pour $DOMAIN..."
mkdir -p "./certbot-conf/live/$DOMAIN"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout '$CERT_PATH/privkey.pem' \
    -out '$CERT_PATH/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Démarrage de nginx..."
docker compose up -d nginx
echo "### Attente du démarrage de nginx..."
sleep 5

echo "### Suppression du certificat temporaire..."
docker compose run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/$DOMAIN && \
  rm -rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

echo "### Demande du certificat Let's Encrypt pour $DOMAIN..."

# Utiliser le serveur staging si demandé
STAGING_ARG=""
if [ $STAGING -eq 1 ]; then
  STAGING_ARG="--staging"
fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    --domain $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "### Rechargement de nginx avec le nouveau certificat..."
docker compose exec nginx nginx -s reload

echo "### Démarrage de certbot pour le renouvellement automatique..."
docker compose up -d certbot

echo ""
echo "Terminé ! Les redirections sont actives sur https://$DOMAIN"
echo "Le certificat sera renouvelé automatiquement."
