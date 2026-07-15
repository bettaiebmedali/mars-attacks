# Installation d'un Control Plane Kubernetes (Kali Linux)

## 1. Mettre à jour le système

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Configurer le nom d'hôte

```bash
sudo hostnamectl set-hostname master01
```

Éditer `/etc/hosts` :

```text
192.168.1.100 master01
192.168.1.101 worker01
192.168.1.102 worker02
```

## 3. Désactiver le swap

```bash
swapon --show
sudo swapoff -a
sudo nano /etc/fstab
```

Commenter la ligne `swap`.

## 4. Charger les modules du noyau

Créer le fichier :

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
```

Charger les modules :

```bash
sudo modprobe overlay
sudo modprobe br_netfilter
```

## 5. Configurer les paramètres réseau

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
net.ipv4.ip_forward=1
EOF

sudo sysctl --system
```

## 6. Installer containerd

```bash
sudo apt install -y containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
```

Modifier :

```toml
SystemdCgroup = true
```

Puis :

```bash
sudo systemctl restart containerd
sudo systemctl enable containerd
```

## 7. Installer Kubernetes

```bash
sudo apt install -y apt-transport-https ca-certificates curl gpg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key \
| sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' \
| sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

## 8. Initialiser le cluster

```bash
sudo kubeadm init \
--apiserver-advertise-address=192.168.1.100 \
--pod-network-cidr=10.244.0.0/16
```

## 9. Configurer kubectl

```bash
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get nodes
```

## 10. Installer Flannel

```bash
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

Vérifier :

```bash
kubectl get nodes
```

## 11. Ajouter un worker

Exécuter sur chaque worker la commande `kubeadm join ...` affichée à la fin de `kubeadm init`.
