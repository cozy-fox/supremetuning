#!/bin/bash
# Generate self-signed SSL certificate for local development
# Use this when you don't have a domain name

set -e

echo "🔒 Generating Self-Signed SSL Certificate"
echo "=========================================="
echo ""

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Check if certificates already exist
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo "⚠️  SSL certificates already exist in ./ssl/"
    read -p "Do you want to regenerate them? (y/N): " REGENERATE
    if [[ ! $REGENERATE =~ ^[Yy]$ ]]; then
        echo "Using existing certificates."
        exit 0
    fi
    echo "Regenerating certificates..."
fi

# Get server IP or hostname
echo "📝 Certificate Information"
echo ""
read -p "Enter your server IP address or hostname [localhost]: " SERVER_NAME
SERVER_NAME=${SERVER_NAME:-localhost}

# Generate self-signed certificate
echo ""
echo "🔐 Generating certificate for: $SERVER_NAME"
echo ""

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=$SERVER_NAME" \
    -addext "subjectAltName=DNS:$SERVER_NAME,DNS:localhost,IP:127.0.0.1"

# Set proper permissions
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

echo ""
echo "✅ Self-signed SSL certificate generated successfully!"
echo ""
echo "📁 Certificate files created:"
echo "   - ssl/cert.pem (certificate)"
echo "   - ssl/key.pem (private key)"
echo ""
echo "⏱️  Valid for: 365 days"
echo "🌐 Server name: $SERVER_NAME"
echo ""
echo "⚠️  IMPORTANT: Self-signed certificates will show a security warning in browsers."
echo "   This is normal and expected. You can safely proceed past the warning."
echo ""
echo "📝 Next steps:"
echo "   1. Start your application: docker compose up -d"
echo "   2. Access via HTTPS: https://$SERVER_NAME"
echo "   3. Accept the security warning in your browser"
echo ""
echo "💡 For production with a real domain, use Let's Encrypt instead."
echo ""

