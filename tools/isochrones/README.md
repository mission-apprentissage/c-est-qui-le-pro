# Isochrones

Dockerfile et Helm charts pour la création des isochrones.

## Building images and publishing in Private Registry

### Set private registry url

```
export REGISTRY_DOMAIN=url_du_registry
export REGISTRY_URL=${REGISTRY_DOMAIN}/path
docker login https://url_de_login_du_registry
```

### Graphhopper

```
docker build graphhopper -t ${REGISTRY_URL}/graphhopper:latest --no-cache
docker push ${REGISTRY_URL}/graphhopper:latest
```

### Isochrones scripts

```
docker build isochrones -t ${REGISTRY_URL}/cqlp-isochrones:latest --no-cache
docker push ${REGISTRY_URL}/cqlp-isochrones:latest
```

## Deploy on Datalab

### Create a secret to access to the registry

```
kubectl create secret docker-registry my-registry \
 --docker-server=${REGISTRY_DOMAIN}\
 --docker-username=YOUR_GITHUB_USERNAME \
 --docker-password=YOUR_GITHUB_PAT \
 --docker-email=YOUR_EMAIL
```

### Install Helm charts

```
helm repo add inseefrlab https://inseefrlab.github.io/helm-charts-interactive-services
```

Editer les valeurs de `charts/graphhopper/values.yaml`:

- service.image.repository : url du registry
- service.image.custom.version : image reference
- extraEnvVars : autes valeurs d'environnement (voir le docker-compose.yml)
- global.suspend: true pour stopper le pod sans supprimer les volumes

```
cd charts/graphhopper
helm dependency build
helm upgrade --install graphhopper-app . -f values.yaml --namespace user-ananda
```

/!\ Attendre que Graphhopper est fini de s'initialiser avant de deployer le chart de calcul des isochrones

Editer les valeurs de `charts/isochrones/values.yaml`:

- service.image.repository : url du registry
- service.image.custom.version : image reference
- extraEnvVars : autes valeurs d'environnement (voir le docker-compose.yml)
- global.suspend: true pour stopper le pod sans supprimer les volumes

```
cd charts/isochrones
helm dependency build
helm upgrade --install cqlp-isochrones . -f values.yaml --namespace user-ananda
```

Une fois les calculs des isochrones terminés, vous pouvez retrouver les données dans `/home/onyxia/work`.

Le pod reste en `running` après les calculs pour pouvoir réupérer/transférer les isochrones.

/!\ N'oubliez pas de nettoyer les resources sur Datalab une fois terminé (suppression des pods)

### Traitement et importation des isochrones

Le traitement des isochrones se fait en utilisant le cli `splitIsochrones` du backend.

Vous pouvez utiliser une instance Postgres de Datalab pour accélérer le traitement des isochrones.

L'importation des isochrones se fait en utilisant le cli `importIsochrones` du backend.

### Useful commands

#### bash to a pods

```
kubectl exec -it graphhopper-app-0 -- /bin/bash
```

```
kubectl exec -it cqlp-isochrones-0 -- /bin/bash
```

#### Read pods logs

```
kubectl logs graphhopper-app-0 -f --tail 100
```

```
kubectl logs cqlp-isochrones-0 -f --tail 100
```

#### Delete helm charts

```
helm delete graphhopper-app
```

```
helm delete cqlp-isochrones
```

#### Delete pods

```
kubectl delete pods graphhopper-app-0
```

```
kubectl delete pods cqlp-isochrones-0
```

## Limite de Graphhopper

Graphhopper ne supporte pas les `route_type` 712 (bus scolaire) : Il est nécessaire de les convertir en bus normaux pour pouvoir les utiliser.
