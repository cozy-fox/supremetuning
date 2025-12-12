#!/bin/bash

# Fix SSL deployment issues for Supreme Tuning
# This script generates SSL certificates and restarts the application

set -e

echo "=========================================="
echo "Supreme Tuning - SSL Fix Script"
echo "=========================================="
echo ""

# Get the public IP (works on EC2)
echo "🔍 Detecting server IP address..."
if command -v curl &> /dev/null; then
    # Try to get EC2 public IP
    EC2_IP=$(curl -s --connect-timeout 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")

    if [ -z "$EC2_IP" ]; then
        echo "EC2 metadata not available, trying external IP service..."
        # Try to get public IP from external service
        EC2_IP=$(curl -s --connect-timeout 5 https://api.ipify.org 2>/dev/null || echo "")
    fi

    if [ -z "$EC2_IP" ]; then
        echo "Could not detect public IP, using localhost"
        EC2_IP="localhost"
    fi
else
    EC2_IP="localhost"
fi

echo "✅ Detected IP: $EC2_IP"
echo ""

# Prompt for custom IP if needed
read -p "Is this correct? (y/n) or enter custom IP/hostname: " user_input

if [ "$user_input" != "y" ] && [ "$user_input" != "Y" ]; then
    if [ "$user_input" != "n" ] && [ "$user_input" != "N" ]; then
        EC2_IP="$user_input"
        echo "Using custom value: $EC2_IP"
    else
        read -p "Enter your server IP or hostname: " EC2_IP
    fi
fi

echo ""
echo "=========================================="
echo "🔐 Generating SSL Certificates"
echo "=========================================="

# Create ssl directory
mkdir -p ssl

# Generate self-signed certificate with proper SAN handling
echo "Generating certificate for: $EC2_IP"

if [ "$EC2_IP" = "localhost" ]; then
    # For localhost, use DNS entry only
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" 2>/dev/null
else
    # For IP address, include it in SAN
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=$EC2_IP" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$EC2_IP" 2>/dev/null
fi

# Set proper permissions
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

echo "✅ SSL certificates generated successfully!"
echo ""

# Verify certificates exist
if [ -f ssl/cert.pem ] && [ -f ssl/key.pem ]; then
    echo "✅ Certificate files verified:"
    echo "   - ssl/cert.pem"
    echo "   - ssl/key.pem"
    echo ""
    
    # Show certificate details
    echo "📋 Certificate Details:"
    echo "   Valid from: $(openssl x509 -in ssl/cert.pem -noout -startdate | cut -d= -f2)"
    echo "   Valid until: $(openssl x509 -in ssl/cert.pem -noout -enddate | cut -d= -f2)"
    echo ""
else
    echo "❌ Error: Certificate files not found!"
    exit 1
fi

echo "=========================================="
echo "🐳 Restarting Docker Containers"
echo "=========================================="

# Stop containers
echo "Stopping containers..."
docker compose down

# Start containers
echo "Starting containers..."
docker compose up -d

echo ""
echo "✅ Containers started!"
echo ""

# Wait a moment for containers to start
sleep 3

# Check container status
echo "=========================================="
echo "📊 Container Status"
echo "=========================================="
docker compose ps
echo ""

# Test HTTPS
echo "=========================================="
echo "🧪 Testing HTTPS Connection"
echo "=========================================="

if curl -k -s -o /dev/null -w "%{http_code}" https://localhost | grep -q "200\|301\|302"; then
    echo "✅ HTTPS is working!"
else
    echo "⚠️  HTTPS test inconclusive - check logs below"
fi

echo ""
echo "=========================================="
echo "🎉 Setup Complete!"
echo "=========================================="
echo ""
echo "Access your application at:"
echo "  🔒 HTTPS: https://$EC2_IP"
echo "  🌐 HTTP:  http://$EC2_IP (redirects to HTTPS)"
echo ""
echo "⚠️  Browser Security Warning:"
echo "You will see a security warning because this uses"
echo "a self-signed certificate. This is normal!"
echo ""
echo "To proceed:"
echo "  1. Click 'Advanced'"
echo "  2. Click 'Proceed to $EC2_IP (unsafe)'"
echo ""
echo "=========================================="
echo ""
echo "📝 Useful Commands:"
echo "  View logs:        docker compose logs -f"
echo "  Restart nginx:    docker compose restart nginx"
echo "  Stop all:         docker compose down"
echo "  Check certs:      openssl x509 -in ssl/cert.pem -text -noout"
echo ""
echo "=========================================="

