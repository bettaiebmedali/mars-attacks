# TP — Gestion de plusieurs clusters Kubernetes (Kind & Minikube)
![Démonstration Kind](demo.gif)
## Objectif

Dans ce TP, nous allons :

- Démarrer un cluster **Kind**
- Démarrer un cluster **Minikube**
- Visualiser les contextes Kubernetes
- Changer de contexte
- Déployer une application Nginx sur Kind
- Exposer l'application avec un Service
- Accéder à l'application avec `kubectl port-forward`
- Tester l'application avec `curl`

---

# 1. Démarrer le cluster Kind

Créer un cluster Kind nommé **demo**.

```bash
kind create cluster --name demo
```

Vérifier que le cluster existe :

```bash
kind get clusters
```

Résultat attendu :

```text
demo
```

---

# 2. Démarrer le cluster Minikube

Lancer Minikube avec Docker.

```bash
minikube start --driver=docker
```

Vérifier son état :

```bash
minikube status
```

Exemple :

```text
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

# 3. Afficher tous les contextes Kubernetes

Lister les contextes disponibles.

```bash
kubectl config get-contexts
```

Exemple :

```text
CURRENT   NAME
*         minikube
          kind-demo
```

---

# 4. Afficher le contexte actif

```bash
kubectl config current-context
```

Exemple :

```text
minikube
```

---

# 5. Basculer sur le cluster Kind

Changer le contexte Kubernetes.

```bash
kubectl config use-context kind-demo
```

Vérifier le changement :

```bash
kubectl config current-context
```

Résultat :

```text
kind-demo
```

---

# 6. Vérifier les nœuds du cluster

Afficher les nœuds du cluster actif.

```bash
kubectl get nodes -o wide
```

Exemple :

```text
NAME                 STATUS   ROLES           VERSION
demo-control-plane   Ready    control-plane   v1.xx.x
```

---

# 7. Déployer Nginx

Créer un Deployment avec deux répliques.

```bash
kubectl create deployment nginx \
    --image=nginx:latest \
    --replicas=2
```

Vérifier le Deployment :

```bash
kubectl get deployments
```

Afficher les Pods :

```bash
kubectl get pods -o wide
```

---

# 8. Exposer le Deployment

Créer un Service ClusterIP.

```bash
kubectl expose deployment nginx \
    --port=80 \
    --target-port=80 \
    --type=ClusterIP
```

Vérifier le Service :

```bash
kubectl get svc
```

Exemple :

```text
NAME         TYPE        CLUSTER-IP       PORT(S)
nginx        ClusterIP   10.96.x.x        80/TCP
```

---

# 9. Accéder à l'application

Créer un tunnel local avec `kubectl port-forward`.

```bash
kubectl port-forward svc/nginx 8080:80
```

Résultat :

```text
Forwarding from 127.0.0.1:8080 -> 80
```

Laisser cette commande ouverte.

---

# 10. Tester l'application

Ouvrir un deuxième terminal.

Tester avec :

```bash
curl http://localhost:8080
```

Résultat attendu :

```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

La page d'accueil Nginx est retournée.

---

# 11. Vérifier les ressources

Afficher les principaux objets Kubernetes.

```bash
kubectl get all
```

Exemple :

```text
NAME                         READY   STATUS
pod/nginx-xxxxx              1/1     Running
pod/nginx-yyyyy              1/1     Running

NAME                 TYPE        CLUSTER-IP
service/nginx        ClusterIP   10.96.x.x

NAME                    READY
deployment.apps/nginx   2/2
```

---

# 12. Revenir sur Minikube

Changer de contexte.

```bash
kubectl config use-context minikube
```

Vérifier :

```bash
kubectl config current-context
```

Résultat :

```text
minikube
```

Afficher les nœuds :

```bash
kubectl get nodes
```

---

# 13. Revenir sur Kind

```bash
kubectl config use-context kind-demo
```

Vérifier :

```bash
kubectl get nodes
```

---

# Résumé des commandes

```bash
kind create cluster --name demo

kind get clusters

minikube start --driver=docker

minikube status

kubectl config get-contexts

kubectl config current-context

kubectl config use-context kind-demo

kubectl get nodes -o wide

kubectl create deployment nginx \
    --image=nginx:latest \
    --replicas=2

kubectl expose deployment nginx \
    --port=80 \
    --target-port=80 \
    --type=ClusterIP

kubectl get all

kubectl port-forward svc/nginx 8080:80

curl http://localhost:8080

kubectl config use-context minikube

kubectl config use-context kind-demo
```

---

# Conclusion

À la fin de ce TP, vous savez :

- Démarrer un cluster **Kind**.
- Démarrer un cluster **Minikube**.
- Gérer plusieurs contextes Kubernetes.
- Basculer d'un cluster à un autre.
- Déployer une application avec un **Deployment**.
- Exposer une application avec un **Service**.
- Accéder à une application via **kubectl port-forward**.
- Tester l'application avec **curl**.