# TP08 - Tester Kubernetes RBAC avec un ServiceAccount et un Utilisateur Humain

## Objectifs

À l'issue de ce TP, vous serez capable de :

- Comprendre la différence entre un utilisateur humain et un ServiceAccount.
- Créer un ServiceAccount.
- Associer un Role à un ServiceAccount.
- Tester les permissions RBAC depuis un Pod.
- Créer un véritable utilisateur humain avec un certificat X.509.
- Associer un Role à un utilisateur humain.
- Tester les permissions RBAC avec `kubectl`.

---

# Pourquoi deux types d'identités ?

Dans Kubernetes, les permissions (RBAC) sont attribuées à une **identité**.

Il existe principalement deux types d'identités :

## 1. Les utilisateurs humains

Ils représentent les personnes qui utilisent Kubernetes.

Exemples :

- Administrateur
- Développeur
- DevOps
- Exploitant

Ils utilisent généralement :

```bash
kubectl get pods
```

depuis leur ordinateur.

L'identité provient d'un mécanisme d'authentification externe :

- certificat X.509
- OpenID Connect (OIDC)
- LDAP
- Azure AD
- Google
- etc.

> Kubernetes ne crée pas les utilisateurs humains.

Il se contente de vérifier leur identité.

---

## 2. Les ServiceAccounts

Les ServiceAccounts représentent les applications exécutées dans Kubernetes.

Exemples :

- Operator
- ArgoCD
- Prometheus
- Cert-Manager
- Application métier
- Script de déploiement

Ces applications doivent parfois communiquer avec l'API Kubernetes.

Dans ce cas, elles utilisent un ServiceAccount.

---

# Comparaison

| Utilisateur humain | ServiceAccount |
|--------------------|----------------|
| Représente une personne | Représente une application |
| Utilise kubectl depuis un PC | Utilise l'API depuis un Pod |
| Authentification externe | Géré par Kubernetes |
| Certificat, OIDC, LDAP... | Token automatiquement monté dans le Pod |
| kind: User | kind: ServiceAccount |

---

# Architecture générale

## Utilisateur humain

```text
Utilisateur
      │
      ▼
kubectl
      │
      ▼
API Server
      │
      ▼
Authentification
(certificat, OIDC...)
      │
      ▼
RBAC
```

---

## ServiceAccount

```text
Application
dans un Pod
      │
      ▼
Token du ServiceAccount
      │
      ▼
API Server
      │
      ▼
RBAC
```

---

# TP 1 — Tester RBAC avec un ServiceAccount

## Objectif

Créer une identité destinée à une application Kubernetes.

Le Pod utilisera automatiquement cette identité pour accéder à l'API.

---

## Étapes

### 1. Créer un namespace

- Créer le namespace `rbac-demo`

---

### 2. Créer un ServiceAccount

Exemple :

```
developer
```

---

### 3. Créer un Role

Autoriser :

- get
- list
- watch

sur les Pods.

---

### 4. Créer un RoleBinding

Associer :

```
ServiceAccount developer
```

au Role.

---

### 5. Créer un Pod

Le Pod doit utiliser :

```
serviceAccountName: developer
```

---

### 6. Vérifier le ServiceAccount

```bash
kubectl describe pod test-client -n rbac-demo
```

---

### 7. Se connecter dans le Pod

```bash
kubectl exec -it test-client -n rbac-demo -- sh
```

---

### 8. Tester les permissions

```bash
kubectl get pods
```

Puis :

```bash
kubectl auth can-i get pods
```

ou

```bash
kubectl auth can-i delete pods
```

---

## Ce qui se passe

```text
Pod
 │
 ▼
ServiceAccount
 │
 ▼
Token
 │
 ▼
API Server
 │
 ▼
RoleBinding
 │
 ▼
Role
 │
 ▼
Autorisé ou refusé
```

---

# TP 2 — Tester RBAC avec un utilisateur humain

## Objectif

Créer un véritable utilisateur Kubernetes.

Cet utilisateur exécutera kubectl depuis son ordinateur.

---

## Étapes

### 1. Générer une clé privée

```
mohamed.key
```

---

### 2. Générer une CSR

```
mohamed.csr
```

avec :

```
CN = mohamed
O = developers
```

---

### 3. Signer le certificat

Créer :

```
mohamed.crt
```

à l'aide de la CA du cluster.

---

### 4. Ajouter l'utilisateur au kubeconfig

Créer :

```
Utilisateur : mohamed
```

---

### 5. Créer un contexte

Exemple :

```
mohamed-context
```

---

### 6. Utiliser ce contexte

Toutes les commandes seront exécutées avec l'identité :

```
mohamed
```

---

### 7. Créer un Role

Autoriser :

- get
- list
- watch

sur les Pods.

---

### 8. Créer un RoleBinding

Associer :

```
kind: User
name: mohamed
```

au Role.

---

### 9. Tester

```bash
kubectl get pods
```

Puis :

```bash
kubectl auth can-i get pods
```

---

## Ce qui se passe

```text
Utilisateur
      │
      ▼
kubectl
      │
      ▼
Certificat X509
      │
      ▼
API Server
      │
      ▼
CN = mohamed
      │
      ▼
RoleBinding
      │
      ▼
Role
      │
      ▼
Autorisé ou refusé
```

---

# Différence entre les deux TP

## ServiceAccount

Le Pod possède un token.

```text
Pod
 │
 ▼
ServiceAccount
 │
 ▼
API Server
```

Le ServiceAccount est créé par Kubernetes.

---

## Utilisateur humain

Le poste de travail possède un certificat.

```text
Utilisateur
 │
 ▼
kubectl
 │
 ▼
Certificat X509
 │
 ▼
API Server
```

L'utilisateur est authentifié grâce à son certificat.

---

# Quand utiliser chaque approche ?

## Utilisateur humain

À utiliser lorsque :

- un administrateur utilise kubectl ;
- un développeur accède au cluster ;
- un exploitant intervient sur Kubernetes.

---

## ServiceAccount

À utiliser lorsque :

- une application communique avec Kubernetes ;
- un Operator crée des ressources ;
- ArgoCD déploie des applications ;
- Prometheus interroge l'API ;
- un Job Kubernetes exécute des commandes kubectl.

---

# Résumé

| Élément | Utilisateur humain | ServiceAccount |
|----------|--------------------|----------------|
| Représente | Une personne | Une application |
| Créé par Kubernetes | ❌ Non | ✅ Oui |
| Authentification | Certificat, OIDC, LDAP... | Token |
| Utilisé depuis | Poste client | Pod |
| Objet Kubernetes | ❌ Non | ✅ Oui |
| Sujet RBAC | User | ServiceAccount |

---

# Conclusion

RBAC fonctionne de la même manière pour les deux types d'identités :

```
Identité
      │
      ▼
RoleBinding
      │
      ▼
Role
      │
      ▼
Permissions
```

La différence se situe uniquement dans **la manière dont l'identité est authentifiée** :

- **Utilisateur humain** : authentification externe (certificat X.509, OIDC, LDAP, etc.).
- **ServiceAccount** : authentification par un token automatiquement fourni aux Pods par Kubernetes.
