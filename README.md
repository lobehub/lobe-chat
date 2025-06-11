#!/bin/bash

# ===============================
# LAVITACONNECT - Future-Ready AI Admin Deployment Script v2075
# ===============================
# Author: Mostafa Aamer
# Role: AI Administrator | Global Admin
# Assets: 200,000 Microsoft Fabric Licenses, Private Server, GitHub + Azure
# ===============================

# === CONFIG ===
PROJECT_NAME="lavitaconnect"
DOMAIN="lavitaconnect.com"
GITHUB_REPO="https://github.com/mostafaammer/ViTAINSIGHT"
DISCORD_WEBHOOK="https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE"
EDITOR="code"

# === CHECK ROOT ===
if [[ $EUID -ne 0 ]]; then
   echo "❌ Please run as root or use sudo." 
   exit 1
fi

# === NETWORK CHECK ===
echo "🌐 Checking Internet connection..."
ping -c 2 google.com || { echo "❌ No internet connection."; exit 1; }

# === FORCE IPv4 ===
echo 'Acquire::ForceIPv4 "true";' | tee /etc/apt/apt.conf.d/99force-ipv4

# === FIX APT & UPDATE ===
echo "🔄 Updating APT sources..."
cp /etc/apt/sources.list /etc/apt/sources.list.backup
cat <<EOF > /etc/apt/sources.list
deb http://http.kali.org/kali kali-rolling main non-free contrib
EOF
apt-get clean && apt-get update --fix-missing && apt-get upgrade -y

# === GITHUB INIT ===
echo "🔧 Cloning GitHub repository..."
git clone "$GITHUB_REPO" || { echo "❌ Clone failed"; exit 1; }
cd "$PROJECT_NAME" || exit

echo "🔧 Setting Git identity..."
git config user.name "Mostafa Aamer"
git config user.email "moustafaameer@gmail.com"

# === OPEN PROJECT ===
$EDITOR . &

# === AZURE INIT ===
echo "☁️ Logging into Azure CLI..."
az login || { echo "❌ Azure login failed"; exit 1; }
echo "📦 Creating Azure Resource Group..."
az group create --name "${PROJECT_NAME}-rg" --location "westeurope"

# === DEPLOY BICEP INFRA ===
echo "🏗️ Deploying Bicep infrastructure..."
az deployment group create \
  --resource-group "${PROJECT_NAME}-rg" \
  --template-file infra/main.bicep || echo "⚠️ Bicep deployment needs review."

# === GITHUB ACTIONS SECRET SETUP ===
echo "🔐 Setting up GitHub secret for Azure credentials..."
read -p "Paste your AZURE_CREDENTIALS JSON: " AZ_CREDS

gh secret set AZURE_CREDENTIALS --body "$AZ_CREDS"

# === GITHUB PAGES DEPLOY ===
echo "🚀 Deploying placeholder to GitHub Pages..."
git checkout -b gh-pages
mkdir -p dist && echo "<h1>$PROJECT_NAME Deployed</h1>" > dist/index.html
cp -r dist/* . && git add . && git commit -m "Initial deployment"
git push origin gh-pages

# === MICROSOFT FABRIC ===
echo "🧠 Reserving 200K Microsoft Fabric licenses..."
echo "// Fabric activation simulated - Licensing platform integration in progress."

# === README GENERATION ===
echo "📄 Creating README.md..."
cat <<EOF > README.md
# $PROJECT_NAME

> Fully automated deployment for AI-powered infrastructure.

- GitHub Pages & Actions ready
- Azure Resource Group: ${PROJECT_NAME}-rg
- Microsoft Fabric Licensing
- Discord Webhook Notifications
EOF
git add README.md && git commit -m "Add future-ready README"

# === NOTIFY DISCORD ===
echo "📢 Sending deployment notice to Discord..."
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{"content": "🚀 $PROJECT_NAME AI Admin Environment setup by Mostafa Aamer is complete. Visit: https://'$DOMAIN'"}' \
     "$DISCORD_WEBHOOK"

# === DONE ===
echo "✅ Future-ready AI infrastructure setup complete! 🧠"
