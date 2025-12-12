# 🔧 Troubleshooting: IP Detection Error

## Error Message

```
Error checking extensions defined using -addext
error:1100006D:X509 V3 routines:X509V3_parse_list:invalid null value
error:11000069:X509 V3 routines:do_ext_nconf:invalid extension string
name=subjectAltName,section=DNS:localhost,IP:127.0.0.1,IP:
```

## Root Cause

The EC2 public IP detection is failing, returning an empty string, which causes OpenSSL to fail when generating the certificate with an empty IP in the Subject Alternative Name (SAN).

## Why This Happens

1. **EC2 Metadata Service (IMDS) not accessible**
   - IMDSv2 requires a token (more secure)
   - IMDSv1 might be disabled on your instance
   - Network timeout or configuration issue

2. **Not running on EC2**
   - Running locally or on different cloud provider
   - Metadata endpoint not available

## ✅ Solution (Already Implemented)

The deployment workflow now uses **multiple fallback methods** to detect your IP:

### Method 1: IMDSv2 (EC2 Metadata - Secure)
```bash
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
EC2_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
```

### Method 2: IMDSv1 (EC2 Metadata - Legacy)
```bash
EC2_IP=$(curl http://169.254.169.254/latest/meta-data/public-ipv4)
```

### Method 3: External IP Service (ipify.org)
```bash
EC2_IP=$(curl https://api.ipify.org)
```

### Method 4: Alternative Service (ifconfig.me)
```bash
EC2_IP=$(curl https://ifconfig.me)
```

### Method 5: Fallback to localhost
If all methods fail, uses `localhost` (safe fallback)

## Manual Fix

If the deployment still fails, SSH to your EC2 instance and run:

```bash
cd /path/to/supreme-tuning

# Method 1: Use the fix script
chmod +x scripts/fix-ssl-deployment.sh
./scripts/fix-ssl-deployment.sh

# Method 2: Manual certificate generation
# Get your public IP manually
MY_IP=$(curl https://api.ipify.org)
echo "My IP: $MY_IP"

# Generate certificate
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=$MY_IP" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$MY_IP"

chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

# Restart containers
docker compose down
docker compose up -d
```

## Checking EC2 Metadata Service

### Test if IMDSv2 is working:
```bash
# Get token
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Get public IP
curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/public-ipv4
```

### Test if IMDSv1 is working:
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

### If both fail, check your EC2 instance settings:
1. Go to AWS Console → EC2 → Your Instance
2. Click "Actions" → "Instance Settings" → "Modify instance metadata options"
3. Check if "IMDSv2" is set to "Required" or "Optional"
4. If set to "Required", IMDSv1 won't work

## Alternative: Use Environment Variable

You can also set your IP as a GitHub secret:

1. **Get your EC2 public IP:**
   ```bash
   curl https://api.ipify.org
   ```

2. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add new secret: `EC2_PUBLIC_IP` = your IP

3. **Update deployment workflow** (optional):
   Add this before certificate generation:
   ```yaml
   - name: Set EC2 IP from secret
     run: |
       echo "EC2_IP=${{ secrets.EC2_PUBLIC_IP }}" >> $GITHUB_ENV
   ```

## Verification

After deployment, verify the certificate:

```bash
# Check certificate exists
ls -la ssl/

# View certificate details
openssl x509 -in ssl/cert.pem -text -noout | grep -A1 "Subject Alternative Name"

# Should show something like:
# X509v3 Subject Alternative Name:
#     DNS:localhost, IP Address:127.0.0.1, IP Address:54.123.45.67
```

## Prevention

The updated deployment workflow now:
- ✅ Tries multiple IP detection methods
- ✅ Has proper error handling
- ✅ Falls back to localhost if all methods fail
- ✅ Shows which method succeeded
- ✅ Validates IP before using it

## Still Having Issues?

1. **Check GitHub Actions logs** - See which IP detection method is being used
2. **Run fix script manually** - `./scripts/fix-ssl-deployment.sh`
3. **Check EC2 security group** - Ensure outbound traffic is allowed
4. **Check EC2 metadata settings** - Verify IMDS is enabled
5. **Use manual IP** - Run the fix script and enter your IP manually when prompted

## Related Files

- `.github/workflows/deploy.yml` - Deployment workflow with IP detection
- `scripts/fix-ssl-deployment.sh` - Manual fix script
- `QUICK-FIX-SSL.md` - Quick SSL troubleshooting guide
- `AWS-DEPLOYMENT-HTTPS.md` - Complete AWS deployment guide

---

**The error should now be fixed with the updated deployment workflow!** 🎉

