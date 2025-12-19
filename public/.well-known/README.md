# Passkey Configuration Files

This directory contains the configuration files required for Passkey authentication to work with the LobeHub mobile app.

## Files

### 1. `apple-app-site-association` (iOS)

This file allows iOS devices to associate the LobeHub mobile app with the web domain for passkey authentication.

- **Team ID**: `4684H589ZU`
- **Bundle Identifier**: `com.lobehub.app`
- **Full App ID**: `4684H589ZU.com.lobehub.app`

**Requirements:**

- ✅ Must be accessible via HTTPS
- ✅ Content-Type: `application/json`
- ✅ No file extension (not `.json`)
- ✅ Placed in `/.well-known/` directory

### 2. `assetlinks.json` (Android)

This file allows Android devices to associate the LobeHub mobile app with the web domain for passkey authentication.

- **Package Name**: `com.lobehub.app`
- **SHA256 Fingerprint**: ⚠️ **NEEDS TO BE FILLED IN**

## How to Get Android SHA256 Fingerprint

You need to update the `assetlinks.json` file with your actual APK signing certificate's SHA256 fingerprint.

### Method 1: From Debug Keystore (for development)

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Method 2: From Release Keystore (for production)

```bash
keytool -list -v -keystore path/to/your-release-key.keystore -alias your-key-alias
```

### Method 3: From Google Play Console (if using Play App Signing)

1. Go to Google Play Console
2. Select your app
3. Navigate to: **Release** → **Setup** → **App signing**
4. Find the **SHA-256 certificate fingerprint** under "App signing key certificate"

### Expected Format

The SHA256 fingerprint should look like this:

```
AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90
```

⚠️ **Important**: Make sure to replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` in `assetlinks.json` with your actual fingerprint!

## Deployment Domains

These files need to be accessible on all the following domains:

- <https://lobechat.com/.well-known/>
- <https://chat.lobehub.com/.well-known/>
- <https://mobile-dev.lobehub.com/.well-known/>

## Verification

After deployment, verify the files are accessible:

```bash
# iOS
curl -I https://lobechat.com/.well-known/apple-app-site-association

# Android
curl -I https://lobechat.com/.well-known/assetlinks.json
```

Both should return:

- Status: `200 OK`
- Content-Type: `application/json`
- Accessible via HTTPS

## Next.js Configuration

The response headers for these files are configured in `next.config.ts`:

- Content-Type: `application/json`
- Cache-Control: `public, max-age=3600` (1 hour)
