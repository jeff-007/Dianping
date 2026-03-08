
#!/bin/bash

# Exit on error
set -e

echo "Starting Alibaba Cloud Deployment Setup (CentOS 7)..."

# 1. Update System
echo "Updating system..."
yum update -y
yum install -y git wget curl vim epel-release

# 2. Install Node.js (v16.x LTS recommended for CentOS 7 due to glibc)
echo "Installing Node.js 16.x..."
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# 3. Install MongoDB 4.4 (Last version to support CentOS 7 well without AVX issues)
echo "Installing MongoDB 4.4..."
cat <<EOF > /etc/yum.repos.d/mongodb-org-4.4.repo
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
EOF

yum install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# 4. Install Nginx
echo "Installing Nginx..."
yum install -y nginx
systemctl start nginx
systemctl enable nginx

# 5. Install PM2
echo "Installing PM2..."
npm install -g pm2

# 6. Install Certbot (via snapd)
echo "Installing Certbot..."
yum install -y snapd
systemctl enable --now snapd.socket
ln -s /var/lib/snapd/snap /snap
# Wait for snapd to initialize
echo "Waiting for snapd to initialize..."
sleep 10
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

# 7. Setup Project Directory
echo "Setting up project directory..."
mkdir -p /var/www/dianping
# Assuming we are running as root or a sudo user, we might want to change ownership if a specific user runs the app.
# For now, we keep it simple.

echo "Environment setup complete!"
echo "Please clone/upload your project to /var/www/dianping and run 'npm install' & 'npm run build'."
