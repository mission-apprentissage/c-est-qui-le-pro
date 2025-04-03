# C'est qui le pro

Dépôt de [C'est qui le pro](https://github.com/mission-apprentissage/c-est-qui-le-pro).

## Développement

### Pré-requis

- Yarn 1+
- Docker 19 +
- Docker-compose 2.29+

### Démarrage

Pour lancer l'application :

```sh
make install
make start
```

Cette commande démarre les containers définis dans le fichier `docker-compose.yml` et `docker-compose.override.yml`

L'application est ensuite accessible à l'url [http://localhost](http://localhost)

### Outils

Nous utilisons [Commit-lint](https://commitlint.js.org/#/) avec [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#why-use-conventional-commits)

### Tests

1. Linter

```
make lint
```

2. Tests unitaires

```
make test
```

### Architecture

Le monorepo est composé d'un package back-end situé dans `server` ainsi que d'un package front-end situé dans `ui`.

#### Server

Ce package contient le code de l'API.

#### Ui

Ce package contient le front-end.

#### Base de données

Ce projet utilise `PostgreSQL` version 16 avec l'extension `postgis`.

![](https://avatars1.githubusercontent.com/u/63645182?s=200&v=4)
