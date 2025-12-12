# Generate self-signed SSL certificate for local development (Windows)
# Use this when you don't have a domain name

Write-Host "🔒 Generating Self-Signed SSL Certificate" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Create ssl directory if it doesn't exist
if (-not (Test-Path "ssl")) {
    New-Item -ItemType Directory -Path "ssl" | Out-Null
}

# Check if certificates already exist
if ((Test-Path "ssl\cert.pem") -and (Test-Path "ssl\key.pem")) {
    Write-Host "⚠️  SSL certificates already exist in .\ssl\" -ForegroundColor Yellow
    $regenerate = Read-Host "Do you want to regenerate them? (y/N)"
    if ($regenerate -ne "y" -and $regenerate -ne "Y") {
        Write-Host "Using existing certificates." -ForegroundColor Green
        exit 0
    }
    Write-Host "Regenerating certificates..." -ForegroundColor Yellow
}

# Get server IP or hostname
Write-Host "📝 Certificate Information" -ForegroundColor Cyan
Write-Host ""
$serverName = Read-Host "Enter your server IP address or hostname [localhost]"
if ([string]::IsNullOrWhiteSpace($serverName)) {
    $serverName = "localhost"
}

# Check if OpenSSL is available
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $opensslPath) {
    Write-Host ""
    Write-Host "❌ OpenSSL is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install OpenSSL:" -ForegroundColor Yellow
    Write-Host "  Option 1: Install Git for Windows (includes OpenSSL)" -ForegroundColor White
    Write-Host "    Download from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host ""
    Write-Host "  Option 2: Install OpenSSL directly" -ForegroundColor White
    Write-Host "    Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor White
    Write-Host ""
    Write-Host "  Option 3: Use Docker to generate certificates:" -ForegroundColor White
    Write-Host "    docker run --rm -v ${PWD}/ssl:/ssl alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /ssl/key.pem -out /ssl/cert.pem -subj '/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=$serverName'" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Generate self-signed certificate
Write-Host ""
Write-Host "🔐 Generating certificate for: $serverName" -ForegroundColor Cyan
Write-Host ""

$subject = "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=$serverName"
$san = "subjectAltName=DNS:$serverName,DNS:localhost,IP:127.0.0.1"

& openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
    -keyout ssl\key.pem `
    -out ssl\cert.pem `
    -subj $subject `
    -addext $san

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Self-signed SSL certificate generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Certificate files created:" -ForegroundColor Cyan
    Write-Host "   - ssl\cert.pem (certificate)" -ForegroundColor White
    Write-Host "   - ssl\key.pem (private key)" -ForegroundColor White
    Write-Host ""
    Write-Host "⏱️  Valid for: 365 days" -ForegroundColor White
    Write-Host "🌐 Server name: $serverName" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Self-signed certificates will show a security warning in browsers." -ForegroundColor Yellow
    Write-Host "   This is normal and expected. You can safely proceed past the warning." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Start your application: docker compose up -d" -ForegroundColor White
    Write-Host "   2. Access via HTTPS: https://$serverName" -ForegroundColor White
    Write-Host "   3. Accept the security warning in your browser" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 For production with a real domain, use Let's Encrypt instead." -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to generate certificate" -ForegroundColor Red
    Write-Host ""
    exit 1
}

