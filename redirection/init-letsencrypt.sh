#!/bin/bash

# Configuration — modifier ces valeurs avant le premier lancement
DOMAIN="futurpro.inserjeunes.beta.gouv.fr"
EMAIL="contact@inserjeunes.beta.gouv.fr"
STAGING=1 # Mettre à 1 pour tester avec le serveur staging de Let's Encrypt (pas de rate limit)

if [ -z "$EMAIL" ]; then
  echo "Erreur : veuillez configurer la variable EMAIL dans ce script."
  exit 1
fi

# Utiliser le serveur staging si demandé
STAGING_ARG=""
if [ $STAGING -eq 1 ]; then
  STAGING_ARG="--staging"
fi

echo "### Création des répertoires nécessaires..."
mkdir -p ./certbot-conf ./certbot-www

echo "### Démarrage de nginx en mode HTTP-only (sans SSL)..."
# Sauvegarde de la config complète, remplacement par une config HTTP-only
cp nginx.conf nginx.conf.full
cat > nginx.conf << EOF
server {
    listen 80;
    server_name $DOMAIN api.$DOMAIN documentation.$DOMAIN statistiques.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'ok';
    }
}
EOF

docker compose up -d nginx
echo "### Attente du démarrage de nginx..."
sleep 3

echo "### Demande du certificat Let's Encrypt pour $DOMAIN..."
docker compose run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    --domain $DOMAIN \
    --domain api.$DOMAIN \
    --domain documentation.$DOMAIN \
    --domain statistiques.$DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --no-eff-email \
    --force-renewal

echo "### Restauration de la config nginx complète (HTTPS)..."
cp nginx.conf.full nginx.conf
rm nginx.conf.full

echo "### Redémarrage de nginx avec le certificat Let's Encrypt..."
docker compose restart nginx

echo "### Démarrage de certbot pour le renouvellement automatique..."
docker compose up -d certbot

echo ""
echo "Terminé ! Les redirections sont actives sur https://$DOMAIN"
echo "Le certificat sera renouvelé automatiquement."
