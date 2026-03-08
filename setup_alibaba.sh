
#!/bin/bash

# Exit on error
set -e

echo "Starting Alibaba Cloud Deployment Setup..."

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 20.x LTS
# Node.js 18 is Maintenance, 20 is Active LTS.
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt-get install -y nginx

# Install MongoDB 7.0 (Ubuntu 22.04)
# Import public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Create list file
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload local package database
sudo apt-get update

# Install MongoDB packages
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx

# Setup Project Directory
sudo mkdir -p /var/www/dianping
sudo chown -R $USER:$USER /var/www/dianping

echo "Environment setup complete!"
echo "Please clone/upload your project to /var/www/dianping and run 'npm install' & 'npm run build'."
