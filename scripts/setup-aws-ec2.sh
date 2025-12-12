#!/bin/bash
# Supreme Tuning - AWS EC2 Amazon Linux 2023 Setup Script
# Run this script on your AWS EC2 Amazon Linux 2023 instance

set -e

echo "🚀 Setting up Supreme Tuning on AWS EC2 Amazon Linux 2023..."

# Update system
echo "📦 Updating system packages..."
sudo dnf update -y

# Install required packages
echo "📦 Installing required packages..."
sudo dnf install -y git curl wget

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
sudo dnf install -y nodejs npm

# Verify Node.js installation
echo "✅ Node.js version:"
node --version
npm --version

# Install Docker
echo "🐳 Installing Docker..."
sudo dnf install -y docker

# Start and enable Docker
echo "🐳 Starting Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Add ec2-user to docker group
echo "👤 Adding ec2-user to docker group..."
sudo usermod -aG docker ec2-user

# Install Docker Compose plugin
echo "📦 Installing Docker Compose plugin..."
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# Install Docker Buildx plugin
echo "📦 Installing Docker Buildx plugin..."
curl -L "https://github.com/docker/buildx/releases/download/v0.17.1/buildx-v0.17.1.linux-amd64" \
  -o ~/.docker/cli-plugins/docker-buildx
chmod +x ~/.docker/cli-plugins/docker-buildx

# Verify installations
echo "✅ Verifying installations..."
docker --version
docker compose version
docker buildx version

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /home/ec2-user/supreme-tuning
cd /home/ec2-user/supreme-tuning

echo ""
echo "✅ Initial setup completed!"
echo ""
echo "⚠️  IMPORTANT: Please log out and log back in for Docker group to take effect."
echo ""
echo "📝 Next steps:"
echo "   1. Log out and log back in"
echo "   2. Run: ./setup-github-runner.sh to set up the GitHub Actions runner"
echo "   3. Configure GitHub secrets (see DEPLOYMENT.md)"
echo ""

