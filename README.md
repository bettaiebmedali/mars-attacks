# TP Ansible – Mission Mars (Phase 2)
## Déploiement de l'application Example Voting App

## Objectif

À la fin de ce TP, vous serez capables de :

- Cloner une application depuis GitHub
- Étudier une architecture microservices
- Lire des Dockerfile
- Construire des images Docker
- Vérifier les images créées
- Préparer l'automatisation avec Ansible

---

# Architecture

```text
             Example Voting App

      +----------------------+
      |      Vote (Python)   |
      +----------+-----------+
                 |
              Redis
                 |
            Worker (.NET)
                 |
           PostgreSQL
                 |
      +----------+-----------+
      |     Result (Node)    |
      +----------------------+
```

## Étape 1 – Cloner le projet

```bash
cd /opt
git clone https://github.com/dockersamples/example-voting-app.git
cd example-voting-app
```

### Vérification

```bash
pwd
ls
```

Vous devez voir les dossiers `vote`, `worker`, `result`, etc.

---

## Étape 2 – Découvrir le projet

```bash
tree -L 2
```

Repérez les dossiers :

- vote
- result
- worker
- docker-compose.yml

---

## Étape 3 – Étudier les Dockerfile

Ouvrez les fichiers :

```text
vote/Dockerfile
result/Dockerfile
worker/Dockerfile
```

Identifiez les instructions :

- FROM
- COPY
- RUN
- EXPOSE
- CMD

---

## Étape 4 – Construire l'image Vote

```bash
cd vote
docker build -t mars-vote:v1 .
```

### Vérification

```bash
docker images
```

Vous devez voir :

```text
mars-vote    v1
```

---

## Étape 5 – Tester le conteneur

```bash
docker run -d --name vote -p 5000:80 mars-vote:v1
```

### Vérification

```bash
docker ps
```

Accéder ensuite à :

http://localhost:5000

L'application n'est pas encore totalement fonctionnelle car Redis n'est pas déployé.

---

## Étape 6 – Construire les autres images

### Result

```bash
cd ../result
docker build -t mars-result:v1 .
```

### Worker

```bash
cd ../worker
docker build -t mars-worker:v1 .
```

### Vérification

```bash
docker images
```

Vous devez obtenir les images :

- mars-vote:v1
- mars-result:v1
- mars-worker:v1

---

## Conclusion

Dans ce TP, vous avez appris à :

- cloner une application GitHub ;
- analyser une architecture microservices ;
- lire des Dockerfile ;
- construire des images Docker ;
- lancer un premier conteneur.

La prochaine phase consistera à automatiser toutes ces opérations avec des rôles Ansible afin qu'une seule commande :

```bash
ansible-playbook deploy.yml
```

clone le dépôt, construise les images et déploie l'application complète.
