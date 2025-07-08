# Clever Cloud Kubernetes Microservice Demo

## 🧩 1. Contexte général

### 🎯 Objectif de l'application
Il s'agit d'une application web multi-services conçue pour illustrer un cas d'usage typique de déploiement cloud-native. L’objectif fonctionnel importe peu ; l’essentiel est que les trois briques techniques – backend, frontend, et base de données – soient pleinement sollicitées et interconnectées.

### 🛠️ Stack technique
- **Backend** : Flask (API REST)
- **Frontend** : React.js
- **Base de données** : MySQL managée, hébergée en dehors du cluster Kubernetes (service managé Clever Cloud ou équivalent)

Ces services sont conteneurisés (sauf la base de données) et orchestrés via Kubernetes pour les deux premiers.

### ☁️ Choix du cloud provider : Clever Cloud + Kubernetes
Nous avons opté pour Clever Cloud avec support Kubernetes afin de bénéficier :
- d’un environnement managé (pas besoin de gérer les VM ou le control plane),
- d’une compatibilité avec des déploiements GitOps,
- d’un support natif pour les workloads Kubernetes tout en gardant les avantages du PaaS Clever.

Le choix de Kubernetes répond à un besoin de modularité, de scalabilité et d'indépendance entre les services.

### ⚙️ Organisation du projet
Architecture multi-services, chaque service étant indépendant dans un sous-répertoire avec son propre Dockerfile.  
Helm est utilisé pour la définition de l’infrastructure Kubernetes.  
Le déploiement est automatisé via GitHub Actions, à chaque push sur la branche principale.


## 🚢 2. Architecture déployée sur Clever Cloud

### 🔧 Vue d’ensemble des services

L’application est composée de trois services, dont deux déployés dans des pods Kubernetes indépendants :

- **`frontend`** : application Node.js servant l’interface utilisateur. Elle consomme l’API du backend.
- **`backend`** : API REST développée avec Flask, exposée en HTTP, et responsable de la logique métier.
- **`database`** : base de données MySQL managée, hébergée en dehors du cluster Kubernetes (service managé Clever Cloud).

Les services `frontend` et `backend` sont packagés en tant que sous-charts Helm au sein d’un chart parent (`my-app`), ce qui permet un déploiement cohérent et modulaire.

---

              +----------------+
              |    Ingress     |
              | (Traefik/nginx)|
              +--------+-------+
                       |
              +--------v--------+
              |   frontend svc  |
              +--------+--------+
                       |
              +--------v--------+
              |   backend svc   |
              +--------+--------+
                       |
              |  Connexion DB   |
              | (MySQL managé)  |
              +----------------+


- **Ingress Controller** : géré par Traefik ou nginx, il route les requêtes HTTP vers le frontend.

- **Services internes** : communication entre les services via le DNS interne de Kubernetes (`backend`, `frontend`).

- **Base de données MySQL** : hébergée en dehors de Kubernetes, accessible via une URL privée/sécurisée.

- **Secrets & ConfigMaps** : les variables d’environnement sensibles (URL DB, identifiants) sont injectées via `values.yaml` et rendues disponibles sous forme de `Secrets` ou `ConfigMaps`.

---

### 🚀 Déploiement automatisé avec GitHub Actions

Le déploiement CI/CD est déclenché à chaque push sur `main`. Il suit les étapes suivantes :

1. **Build des images Docker** pour chaque service (`frontend`, `backend`).

2. **Push des images** vers un registre (DockerHub ou GitHub Container Registry).

3. **Déploiement sur Kubernetes** via Helm :

```yaml
- name: Deploy via Helm
  run: |
    helm upgrade --install my-app ./helm \
      --namespace my-namespace \
      --set image.tag=${{ github.sha }}

