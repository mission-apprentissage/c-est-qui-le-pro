# Isochrones

Dockerfile et Helm charts pour la création des isochrones.

## Building images and publishing in Github Registry

### Graphhopper

```
docker build graphhopper -t ghcr.io/mission-apprentissage/graphhopper:latest
docker push ghcr.io/mission-apprentissage/graphhopper:latest
```

### Isochrones scripts

```
docker build isochrones -t ghcr.io/mission-apprentissage/cqlp-isochrones:latest
docker push ghcr.io/mission-apprentissage/cqlp-isochrones:latest
```

## Deploy on Datalab

### Create a secret to access to the registry

```
kubectl create secret docker-registry github-registry \
 --docker-server=ghcr.io \
 --docker-username=YOUR_GITHUB_USERNAME \
 --docker-password=YOUR_GITHUB_PAT \
 --docker-email=YOUR_EMAIL
```

### Install Helm charts

```
cd charts/graphhopper
helm dependency build
helm upgrade --install graphhopper-app . -f values.yaml --namespace user-ananda
```

/!\ Attendre que Graphhopper est fini de s'initialiser avant de deployer le chart de calcul des isochrones

```
cd charts/isochrones
helm dependency build
helm upgrade --install cqlp-isochrones . -f values.yaml --namespace user-ananda
```

/!\ N'oubliez pas de nettoyer les resources sur Datalab une fois terminé (suppression des pods)

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
