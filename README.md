# TP07 - Tests RBAC Kubernetes (version enrichie)

> **Note** : Cette version montre le format pédagogique qui sera utilisé dans tout le bootcamp.

## Objectif

À l'issue de ce TP, vous saurez :
- Créer un ServiceAccount.
- Créer un Role et un RoleBinding.
- Comprendre le fonctionnement interne de RBAC.
- Vérifier les permissions avec `kubectl auth can-i`.
- Comprendre pourquoi une action est autorisée ou refusée.

---

# 1. Préparation du laboratoire

## Pourquoi cette étape ?

Avant de tester RBAC, il faut vérifier que le cluster Kubernetes est opérationnel. Toutes les commandes de ce TP seront exécutées sur Minikube.

## Ce qui se passe en interne

La commande ci-dessous interroge l'API Server afin d'obtenir la liste des nœuds enregistrés dans le cluster.

```bash
kubectl get nodes
```

Résultat attendu :

```text
NAME       STATUS
minikube   Ready
```

Si l'état est `NotReady`, corrigez le problème avant de poursuivre.

---

# 2. Création du namespace de test

## Pourquoi cette étape ?

Les namespaces permettent d'isoler les ressources Kubernetes. Dans ce TP, toutes les ressources seront créées dans `rbac-demo` afin d'éviter d'impacter les autres applications.

```bash
kubectl create namespace rbac-demo
```

Vérification :

```bash
kubectl get namespaces
```

À retenir : un `Role` est limité à un namespace.

---

# 3. Déployer une application de test

## Pourquoi cette étape ?

RBAC protège des ressources. Nous devons donc créer quelques ressources à protéger.

Créer un Pod :

```bash
kubectl run nginx --image=nginx --namespace=rbac-demo
```

Créer un Deployment :

```bash
kubectl create deployment web --image=nginx -n rbac-demo
```

Vérifier :

```bash
kubectl get pods -n rbac-demo
kubectl get deployments -n rbac-demo
```

---

# 4. Créer un ServiceAccount

## Théorie

Un ServiceAccount représente l'identité d'une application.

Un Pod utilise toujours un ServiceAccount pour communiquer avec l'API Kubernetes.

Créer un ServiceAccount ne donne **aucune permission**.

Schéma :

```text
ServiceAccount
      │
      ▼
Aucune permission
```

Créer le ServiceAccount :

```bash
kubectl create serviceaccount developer -n rbac-demo
```

Vérifier :

```bash
kubectl get serviceaccounts -n rbac-demo
```

Inspecter :

```bash
kubectl describe serviceaccount developer -n rbac-demo
```

À retenir : un ServiceAccount est une identité, pas un ensemble de droits.

---

# 5. Tester les permissions avant RBAC

## Pourquoi ?

Nous voulons démontrer que le ServiceAccount ne possède encore aucun droit.

```bash
kubectl auth can-i get pods \
--as=system:serviceaccount:rbac-demo:developer \
-n rbac-demo
```

Résultat attendu :

```text
no
```

Ce qui se passe en interne :

```text
kubectl
   │
API Server
   │
Authentification
   │
RBAC
   │
Aucun RoleBinding trouvé
   │
Réponse : NO
```

---

# 6. Créer un Role

## Théorie

Un Role contient une liste de permissions sur des ressources d'un namespace.

Créer `pod-reader-role.yaml` :

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: rbac-demo
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get","list","watch"]
```

Appliquer :

```bash
kubectl apply -f pod-reader-role.yaml
```

Vérifier :

```bash
kubectl get roles -n rbac-demo
```

À retenir : le Role existe mais ne donne encore aucun accès tant qu'il n'est pas lié à une identité.

---

# 7. Créer un RoleBinding

## Théorie

Le RoleBinding relie une identité (ServiceAccount) à un Role.

```text
ServiceAccount
      │
RoleBinding
      │
Role
      │
Permissions
```

Créer `developer-binding.yaml` puis appliquer :

```bash
kubectl apply -f developer-binding.yaml
```

Vérifier :

```bash
kubectl get rolebindings -n rbac-demo
kubectl describe rolebinding developer-binding -n rbac-demo
```

---

# 8. Tester les permissions après RBAC

```bash
kubectl auth can-i get pods \
--as=system:serviceaccount:rbac-demo:developer \
-n rbac-demo
```

Résultat :

```text
yes
```

Tester également :

```bash
kubectl auth can-i list pods --as=system:serviceaccount:rbac-demo:developer -n rbac-demo
kubectl auth can-i watch pods --as=system:serviceaccount:rbac-demo:developer -n rbac-demo
```

Explication : le RoleBinding permet désormais au moteur RBAC d'associer les règles du Role au ServiceAccount.

---

# 9. Vérifier les refus

Tester :

```bash
kubectl auth can-i create pods --as=system:serviceaccount:rbac-demo:developer -n rbac-demo
kubectl auth can-i delete pods --as=system:serviceaccount:rbac-demo:developer -n rbac-demo
kubectl auth can-i get secrets --as=system:serviceaccount:rbac-demo:developer -n rbac-demo
```

Résultat attendu :

```text
no
```

Pourquoi ?

Le Role n'autorise que `get`, `list` et `watch` sur les Pods.

---

# 10. Tester avec un vrai Pod

Créer un Pod utilisant le ServiceAccount :

```bash
kubectl run test-client \
--image=bitnami/kubectl \
--serviceaccount=developer \
-n rbac-demo \
-- sleep 3600
```

Entrer dans le Pod :

```bash
kubectl exec -it test-client -n rbac-demo -- sh
```

Tester :

```bash
kubectl get pods -n rbac-demo
```

Cette fois, la requête est effectuée avec l'identité du ServiceAccount.

---

# 11. Vérifier toutes les permissions

```bash
kubectl auth can-i --list \
--as=system:serviceaccount:rbac-demo:developer \
-n rbac-demo
```

Cette commande est très utilisée pour auditer rapidement les droits d'une identité.

---

# 12. Nettoyage

```bash
kubectl delete namespace rbac-demo
```

## À retenir

- Un ServiceAccount est une identité.
- Un Role définit des permissions.
- Un RoleBinding associe une identité à un Role.
- Sans RoleBinding, aucune permission n'est accordée.
- `kubectl auth can-i` est la commande de référence pour valider RBAC.
