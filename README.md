# TP — Monitoring Kubernetes avec Minikube, Prometheus et Grafana

## Objectif

Dans ce TP, nous allons mettre en place une solution complète de monitoring d'un cluster Kubernetes local avec **Minikube**.

À la fin du TP, nous saurons :

- déployer une application dans Kubernetes ;
- installer Prometheus ;
- installer Grafana ;
- récupérer les métriques du cluster ;
- visualiser les métriques dans Grafana ;
- monitorer les Pods et les Deployments ;
- monitorer les ressources CPU et mémoire ;
- créer une alerte ;
- provoquer volontairement un problème ;
- observer le comportement du cluster et du monitoring.

---

# 1. Architecture du TP

L'architecture finale sera la suivante :

```text
                         ┌──────────────────────┐
                         │       Grafana        │
                         │      Dashboard       │
                         └──────────▲───────────┘
                                    │
                                    │ PromQL
                                    │
                         ┌──────────┴───────────┐
                         │     Prometheus       │
                         │   Collecte métriques │
                         └───────▲──────▲───────┘
                                 │      │
                  ┌──────────────┘      └──────────────┐
                  │                                    │
        ┌─────────┴─────────┐                ┌─────────┴─────────┐
        │ kube-state-metrics│                │   node-exporter   │
        │ Ressources K8s    │                │ Ressources Node   │
        └─────────▲─────────┘                └─────────▲─────────┘
                  │                                    │
                  └────────────────┬───────────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │     Minikube      │
                         │                   │
                         │ Application       │
                         │ Deployment        │
                         │ Service           │
                         │ Pods              │
                         └───────────────────┘
```

---

# 2. Prérequis

Nous allons utiliser :

- Minikube
- kubectl
- Docker
- Helm

Vérifier les installations :

```bash
minikube version
kubectl version --client
docker --version
helm version
```

Si Helm n'est pas installé :

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Vérifier :

```bash
helm version
```

---

# 3. Démarrer Minikube

Démarrer Minikube :

```bash
minikube start --driver=docker
```

Vérifier le cluster :

```bash
minikube status
```

Résultat attendu :

```text
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

Vérifier le Node :

```bash
kubectl get nodes
```

Résultat attendu :

```text
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   ...   ...
```

---

# 4. Vérifier les composants Kubernetes

Afficher tous les Pods :

```bash
kubectl get pods -A
```

Afficher les Services :

```bash
kubectl get svc -A
```

Afficher les Deployments :

```bash
kubectl get deployments -A
```

Cette étape permet de vérifier que le cluster fonctionne correctement avant d'installer le monitoring.

---

# 5. Créer le namespace monitoring

Nous allons isoler les composants de monitoring dans un namespace dédié.

```bash
kubectl create namespace monitoring
```

Vérifier :

```bash
kubectl get namespaces
```

Nous aurons notamment :

```text
default
kube-system
monitoring
```

---

# 6. Installer Prometheus et Grafana avec Helm

Pour simplifier le TP, nous allons utiliser le projet **kube-prometheus-stack**.

Ajouter le repository Helm :

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

Mettre à jour les repositories :

```bash
helm repo update
```

Vérifier que le chart est disponible :

```bash
helm search repo prometheus-community/kube-prometheus-stack
```

Installer la stack :

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring
```

L'installation peut prendre quelques minutes.

---

# 7. Vérifier l'installation

Afficher les Pods :

```bash
kubectl get pods -n monitoring
```

Nous devons retrouver plusieurs composants, notamment :

```text
prometheus
grafana
alertmanager
kube-state-metrics
node-exporter
```

Pour obtenir une vue plus précise :

```bash
kubectl get pods -n monitoring -o wide
```

---

# 8. Comprendre les composants

## Prometheus

Prometheus est le moteur de monitoring.

Il collecte les métriques et les stocke sous forme de séries temporelles.

Exemples :

```text
CPU
Memory
Pod status
HTTP requests
Container restarts
```

Prometheus utilise un langage de requête appelé **PromQL**.

---

## Grafana

Grafana permet de visualiser les métriques.

Prometheus fournit les données.

Grafana les transforme en :

- graphiques ;
- tableaux ;
- jauges ;
- statistiques ;
- dashboards.

---

## kube-state-metrics

kube-state-metrics expose des informations sur l'état des ressources Kubernetes.

Par exemple :

```text
Nombre de Pods
Nombre de replicas
État d'un Deployment
État d'un Pod
État d'un Job
```

---

## node-exporter

node-exporter fournit des métriques concernant les machines/Nodes.

Par exemple :

```text
CPU
Mémoire
Disque
Filesystem
Load
```

---

## Alertmanager

Alertmanager reçoit les alertes générées par Prometheus.

Il peut ensuite les envoyer vers différents systèmes :

```text
Email
Slack
Teams
Webhook
```

Dans ce TP, nous allons principalement comprendre le principe des alertes.

---

# 9. Vérifier les Services

Exécuter :

```bash
kubectl get svc -n monitoring
```

Nous allons notamment retrouver :

```text
grafana
prometheus
alertmanager
```

Pour avoir davantage d'informations :

```bash
kubectl get svc -n monitoring -o wide
```

---

# 10. Accéder à Grafana

Nous allons utiliser `kubectl port-forward`.

Identifier le Service Grafana :

```bash
kubectl get svc -n monitoring | grep grafana
```

Puis :

```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

Nous pouvons maintenant ouvrir :

```text
http://localhost:3000
```

---

# 11. Récupérer le mot de passe Grafana

Le mot de passe initial est stocké dans un Secret Kubernetes.

Récupérer le Secret :

```bash
kubectl get secret -n monitoring monitoring-grafana -o yaml
```

Pour récupérer directement le mot de passe :

```bash
kubectl get secret monitoring-grafana \
  -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 -d
```

Le compte administrateur est généralement :

```text
Username: admin
```

Utiliser le mot de passe récupéré précédemment.

---

# 12. Vérifier Prometheus

Dans un deuxième terminal, lancer :

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090
```

Puis ouvrir :

```text
http://localhost:9090
```

Nous pouvons maintenant accéder à l'interface Prometheus.

---

# 13. Première requête PromQL

Dans Prometheus, aller dans la zone de requête.

Tester :

```promql
up
```

Cette métrique permet de savoir si une cible est disponible.

Une valeur :

```text
1
```

indique généralement que la cible est disponible.

Une valeur :

```text
0
```

indique que la cible n'est pas disponible.

---

# 14. Explorer les métriques

Tester :

```promql
count(up)
```

Cette requête donne le nombre de cibles surveillées.

Tester également :

```promql
process_cpu_seconds_total
```

Puis :

```promql
node_memory_MemAvailable_bytes
```

et :

```promql
node_cpu_seconds_total
```

L'objectif est de se familiariser avec PromQL.

---

# 15. Vérifier les métriques Kubernetes

Tester :

```promql
kube_pod_info
```

Cette métrique fournit des informations sur les Pods.

Tester :

```promql
kube_deployment_status_replicas
```

Cette métrique permet d'observer les replicas des Deployments.

Tester :

```promql
kube_pod_container_status_restarts_total
```

Cette métrique permet d'identifier les containers qui redémarrent.

---

# 16. Installer une application de test

Nous allons créer une petite application Web.

Créer un fichier :

```bash
nano app.yaml
```

Contenu :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
  labels:
    app: demo-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: demo-app
spec:
  selector:
    app: demo-app
  ports:
    - port: 80
      targetPort: 80
```

Appliquer :

```bash
kubectl apply -f app.yaml
```

---

# 17. Vérifier l'application

```bash
kubectl get deployment
```

Puis :

```bash
kubectl get pods
```

Nous devons avoir deux Pods :

```text
demo-app-xxxxx
demo-app-yyyyy
```

Vérifier le Service :

```bash
kubectl get svc
```

---

# 18. Accéder à l'application

Avec Minikube :

```bash
minikube service demo-app --url
```

La commande retourne une URL.

Tester avec :

```bash
curl <URL>
```

Nous devons recevoir la page Nginx.

---

# 19. Observer les Pods dans Prometheus

Dans Prometheus, rechercher :

```promql
kube_pod_info
```

Puis filtrer notre application :

```promql
kube_pod_info{namespace="default"}
```

Nous pouvons également observer le nombre de Pods :

```promql
count(kube_pod_info{namespace="default"})
```

---

# 20. Monitorer les replicas

Nous avons configuré :

```yaml
replicas: 2
```

Nous pouvons observer :

```promql
kube_deployment_spec_replicas{deployment="demo-app"}
```

Puis :

```promql
kube_deployment_status_replicas_available{deployment="demo-app"}
```

Nous pouvons comparer :

```text
Desired replicas
       VS
Available replicas
```

---

# 21. Monitorer les redémarrages

Utiliser :

```promql
kube_pod_container_status_restarts_total
```

Pour notre application :

```promql
kube_pod_container_status_restarts_total{
  namespace="default"
}
```

Si un container redémarre, la valeur augmente.

---

# 22. Monitorer la mémoire

Une métrique intéressante est :

```promql
container_memory_working_set_bytes
```

Pour notre namespace :

```promql
container_memory_working_set_bytes{
  namespace="default"
}
```

Nous pouvons également utiliser :

```promql
sum(container_memory_working_set_bytes{
  namespace="default"
})
```

---

# 23. Monitorer le CPU

Utiliser :

```promql
rate(container_cpu_usage_seconds_total[5m])
```

Pour le namespace :

```promql
sum(
  rate(container_cpu_usage_seconds_total{
    namespace="default"
  }[5m])
)
```

Cette requête permet d'observer l'utilisation CPU des containers.

---

# 24. Ajouter Prometheus dans Grafana

Grafana est normalement configuré avec Prometheus comme Data Source par la stack.

Dans Grafana :

```text
Connections
    ↓
Data sources
    ↓
Prometheus
```

Vérifier que la connexion fonctionne.

---

# 25. Explorer les dashboards existants

La stack fournit déjà plusieurs dashboards.

Dans Grafana :

```text
Dashboards
    ↓
Browse
```

Explorer notamment les dashboards Kubernetes.

L'objectif est de comprendre les informations disponibles avant de créer notre propre dashboard.

---

# 26. Créer notre propre Dashboard

Créer un nouveau Dashboard :

```text
Dashboards
    ↓
New
    ↓
New Dashboard
    ↓
Add visualization
```

Choisir Prometheus comme Data Source.

---

# 27. Dashboard — Nombre de Pods

Créer un panneau avec :

```promql
count(kube_pod_info)
```

Titre :

```text
Total Pods
```

Choisir une visualisation de type :

```text
Stat
```

---

# 28. Dashboard — CPU

Créer un panneau avec :

```promql
sum(
  rate(container_cpu_usage_seconds_total[5m])
)
```

Titre :

```text
CPU Usage
```

Utiliser un graphique temporel.

---

# 29. Dashboard — Mémoire

Créer un panneau avec :

```promql
sum(
  container_memory_working_set_bytes
)
```

Titre :

```text
Memory Usage
```

---

# 30. Dashboard — Restarts

Créer un panneau avec :

```promql
sum(
  kube_pod_container_status_restarts_total
)
```

Titre :

```text
Container Restarts
```

---

# 31. Dashboard — Replicas

Créer un panneau avec :

```promql
kube_deployment_spec_replicas
```

Puis comparer avec :

```promql
kube_deployment_status_replicas_available
```

Cela permet de visualiser la différence entre :

```text
Desired
Available
```

---

# 32. Créer une situation de panne

Nous allons maintenant simuler un problème.

Identifier les Pods :

```bash
kubectl get pods
```

Supprimer un Pod :

```bash
kubectl delete pod <nom-du-pod>
```

Observer :

```bash
kubectl get pods -w
```

Le Deployment doit créer automatiquement un nouveau Pod.

---

# 33. Observer la panne avec Prometheus

Pendant la suppression du Pod, observer :

```promql
kube_pod_info
```

Puis :

```promql
kube_pod_container_status_restarts_total
```

L'objectif est de comprendre que Kubernetes et le monitoring sont deux mécanismes différents :

```text
Kubernetes
    ↓
maintient l'état souhaité

Prometheus
    ↓
observe l'état réel
```

---

# 34. Simuler un mauvais Deployment

Modifier le Deployment :

```bash
kubectl edit deployment demo-app
```

Changer volontairement l'image :

```yaml
image: nginx:does-not-exist
```

Observer :

```bash
kubectl get pods
```

Nous allons probablement obtenir :

```text
ImagePullBackOff
```

ou :

```text
ErrImagePull
```

---

# 35. Diagnostiquer avec Kubernetes

Exécuter :

```bash
kubectl describe pod <nom-du-pod>
```

Puis :

```bash
kubectl get events --sort-by=.lastTimestamp
```

Nous avons maintenant une chaîne de diagnostic :

```text
Grafana
   ↓
Prometheus
   ↓
Kubernetes métriques
   ↓
kubectl describe
   ↓
Kubernetes Events
```

---

# 36. Restaurer l'application

Remettre :

```yaml
image: nginx:alpine
```

Puis :

```bash
kubectl apply -f app.yaml
```

Vérifier :

```bash
kubectl get pods
```

Les Pods doivent revenir dans l'état :

```text
Running
```

---

# 37. Comprendre les alertes

Une alerte permet de passer de :

```text
Monitoring
```

à :

```text
Monitoring + Notification
```

Exemple conceptuel :

```text
CPU > 80%
      ↓
Prometheus
      ↓
Alert rule
      ↓
Alertmanager
      ↓
Notification
```

---

# 38. Exemple d'alerte Prometheus

Créer un fichier :

```bash
nano alert.yaml
```

Exemple :

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: demo-alerts
  namespace: monitoring
  labels:
    release: monitoring
spec:
  groups:
    - name: demo.rules
      rules:
        - alert: PodRestartDetected
          expr: increase(kube_pod_container_status_restarts_total[5m]) > 0
          for: 1m
          labels:
            severity: warning
          annotations:
            summary: "Container restart detected"
            description: "A container has restarted during the last 5 minutes."
```

Appliquer :

```bash
kubectl apply -f alert.yaml
```

---

# 39. Vérifier l'alerte

Vérifier la ressource :

```bash
kubectl get prometheusrules -n monitoring
```

Puis vérifier Prometheus.

Dans Prometheus :

```text
Alerts
```

Nous devons pouvoir retrouver :

```text
PodRestartDetected
```

---

# 40. Tester l'alerte

Supprimer un Pod :

```bash
kubectl delete pod <nom-du-pod>
```

Attendre la recréation du Pod.

Puis vérifier dans Prometheus si l'alerte apparaît.

---

# 41. Challenge final

À ce stade, nous avons :

```text
Minikube
   ↓
Kubernetes
   ↓
Application
   ↓
Prometheus
   ↓
Grafana
   ↓
Alertmanager
```

Le challenge consiste à construire un Dashboard contenant au minimum :

- nombre total de Pods ;
- CPU ;
- mémoire ;
- nombre de restarts ;
- nombre de replicas souhaités ;
- nombre de replicas disponibles ;
- état des Nodes.

Puis créer au moins une alerte.

---

# 42. Exercices

## Exercice 1

Déployer l'application avec :

```yaml
replicas: 3
```

Vérifier dans Grafana que le nombre de Pods augmente.

---

## Exercice 2

Supprimer un Pod.

Observer :

```bash
kubectl get pods -w
```

Puis vérifier Grafana.

Question :

> Pourquoi le nombre de Pods revient-il automatiquement à 3 ?

---

## Exercice 3

Modifier volontairement l'image :

```yaml
image: nginx:does-not-exist
```

Identifier :

- le problème ;
- le message Kubernetes ;
- l'événement correspondant ;
- l'impact visible dans Grafana.

---

## Exercice 4

Créer une alerte lorsque le nombre de restarts augmente.

---

## Exercice 5

Créer un Dashboard Grafana permettant de répondre rapidement aux questions :

```text
Le cluster fonctionne-t-il ?
Combien de Pods sont actifs ?
Y a-t-il des Pods en erreur ?
Les Pods redémarrent-ils ?
Le CPU est-il élevé ?
La mémoire est-elle élevée ?
Les Deployments ont-ils leurs replicas disponibles ?
```

---

# 43. Commandes utiles

Afficher les ressources :

```bash
kubectl get all
```

Afficher les Pods :

```bash
kubectl get pods
```

Afficher les Pods en continu :

```bash
kubectl get pods -w
```

Afficher les Pods du monitoring :

```bash
kubectl get pods -n monitoring
```

Afficher les événements :

```bash
kubectl get events --sort-by=.lastTimestamp
```

Décrire une ressource :

```bash
kubectl describe pod <pod>
```

Voir les logs :

```bash
kubectl logs <pod>
```

Voir les ressources :

```bash
kubectl top nodes
kubectl top pods
```

Si `kubectl top` ne fonctionne pas, vérifier que metrics-server est disponible :

```bash
kubectl get pods -n kube-system | grep metrics
```

---

# 44. Résultat attendu

À la fin du TP, nous devons disposer de :

```text
┌───────────────────────────────────────────────┐
│                 Minikube                      │
│                                               │
│  ┌──────────────┐       ┌──────────────┐     │
│  │  demo-app    │       │  demo-app    │     │
│  │     Pod      │       │     Pod      │     │
│  └──────────────┘       └──────────────┘     │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │             Monitoring                  │  │
│  │                                         │  │
│  │ Prometheus ─── Grafana                  │  │
│  │      │                                  │  │
│  │      ├── kube-state-metrics              │  │
│  │      └── node-exporter                   │  │
│  │                                         │  │
│  │ Alertmanager                            │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

# 45. Ce qu'il faut retenir

Le monitoring Kubernetes repose sur plusieurs niveaux.

### Niveau 1 — Infrastructure

```text
Node
CPU
Memory
Disk
```

### Niveau 2 — Kubernetes

```text
Pods
Deployments
Services
Replicas
Restarts
```

### Niveau 3 — Application

```text
Requests
Errors
Latency
Business metrics
```

### Niveau 4 — Alerting

```text
Métrique
   ↓
Prometheus
   ↓
Alert Rule
   ↓
Alertmanager
   ↓
Notification
```

L'objectif d'un système de monitoring n'est donc pas simplement de produire des graphiques.

Il doit permettre de répondre rapidement à trois questions :

```text
1. Que se passe-t-il ?
2. Pourquoi cela se passe-t-il ?
3. Quand devons-nous intervenir ?
```

---

# 46. Nettoyage du TP

À la fin du TP, supprimer l'application :

```bash
kubectl delete -f app.yaml
```

Supprimer l'alerte :

```bash
kubectl delete -f alert.yaml
```

Désinstaller la stack :

```bash
helm uninstall monitoring -n monitoring
```

Supprimer le namespace :

```bash
kubectl delete namespace monitoring
```

Arrêter Minikube :

```bash
minikube stop
```

Ou supprimer complètement le cluster :

```bash
minikube delete
```
