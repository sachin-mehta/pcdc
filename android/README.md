# Capacitor Android App - Configuration & Build Guide

This guide provides step-by-step setup and build instructions for a **Capacitor-based Android app** with **flavors (dev, staging, release)** and standard **build types (debug, release)**.

---

## 1. Prerequisites

### Install Required Tools

1. **Node.js & npm**
   Download from [Node.js](https://nodejs.org) (LTS recommended).

   ```bash
   node -v
   npm -v
   ```

2. **Capacitor CLI & Ionic CLI** (if using Ionic)

   ```bash
   npm install -g @capacitor/cli
   npm install -g @ionic/cli
   ```

3. **Android Studio**

   - Install [Android Studio](https://developer.android.com/studio).
   - Install SDK, build tools, and emulator images.

4. **Java JDK 11/17**

   ```bash
   java -version
   ```

5. **Environment Variables**

   ```
   ANDROID_HOME = <Your SDK path>
   PATH += $ANDROID_HOME/platform-tools
   PATH += $ANDROID_HOME/tools
   PATH += $ANDROID_HOME/tools/bin
   ```

---

## 2. Add Android Platform

Inside your Capacitor project root:

```bash
npx cap add android
npx cap open android
```

---

## 3. Configure Flavors

In `android/app/build.gradle`, add product flavors:

```gradle
android {
    ...

  flavorDimensions "environment"

  productFlavors {
    dev {
      dimension "environment"
      buildConfigField "String", "BASE_URL", "\"${BASE_URL_DEVELOPMENT}\""

    }
    staging {
      dimension "environment"
      buildConfigField "String", "BASE_URL", "\"${BASE_URL_STAGING}\""

    }
    prod {
      dimension "environment"
      buildConfigField "String", "BASE_URL", "\"${BASE_URL_PRODUCTION}\""
    }
  }

  signingConfigs {
    release {
      storeFile file(KEYSTORE_PATH)
      storePassword KEYSTORE_PASSWORD
      keyAlias KEY_ALIAS
      keyPassword KEY_PASSWORD
    }
  }
  buildTypes {
    debug {
      buildConfigField "String", "CLIENT_INFO_TOKEN", "\"${CLIENT_INFO_API_TOKEN}\""
      debuggable true
      minifyEnabled false
      applicationIdSuffix ".debug"
      versionNameSuffix
    }
    release {
      buildConfigField "String", "CLIENT_INFO_TOKEN", "\"${CLIENT_INFO_API_TOKEN}\""
      debuggable false
      minifyEnabled true
      shrinkResources true
      applicationIdSuffix
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
      signingConfig signingConfigs.release
    }
  }

}
```

---

## 4. Build Commands

### Debug Variants

- **Dev Debug**

  ```bash
  ./gradlew assembleDevDebug
  ```

- **Staging Debug**

  ```bash
  ./gradlew assembleStagingDebug
  ```

- **Release Debug (rarely used)**

  ```bash
  ./gradlew assembleReleaseDebug
  ```

### Release Variants (Signed)

- **Dev Release**

  ```bash
  ./gradlew assembleDevRelease
  ```

- **Staging Release**

  ```bash
  ./gradlew assembleStagingRelease
  ```

- **Production Release**

  ```bash
  ./gradlew assembleReleaseRelease
  ```

### Bundles (AAB for Play Store)

- **Dev**

  ```bash
  ./gradlew bundleDevRelease
  ```

- **Staging**

  ```bash
  ./gradlew bundleStagingRelease
  ```

- **Prod**

  ```bash
  ./gradlew bundleReleaseRelease
  ```

---

## 5. Running App

- Run directly on device/emulator with live reload:

  ```bash
  npx cap run android
  ```

- Or install APK:

  ```bash
  adb install -r app/build/outputs/apk/dev/release/app-dev-release.apk
  ```

---

## 6. Debugging

- Inspect logs:

  ```bash
  adb logcat
  ```

- Inspect UI/WebView:

  - Open `android/app/src/main/java/com/meter/giga/MainActivity.java` in Chrome.
  - Add WebView.setWebContentsDebuggingEnabled(true) in oncreate function
  - Open `chrome://inspect/#devices` in Chrome.
  - Tap **Inspect** under your app.

---

## 7. Signing Release Builds

1. Generate keystore:

   ```bash
   keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release
   ```

2. Add to `gradle.properties`:

   ```
   MYAPP_UPLOAD_STORE_FILE=release-key.jks
   MYAPP_UPLOAD_KEY_ALIAS=release
   MYAPP_UPLOAD_STORE_PASSWORD=your-password
   MYAPP_UPLOAD_KEY_PASSWORD=your-password
   ```

3. Link in `app/build.gradle`:

   ```gradle
   signingConfigs {
       release {
           storeFile file(MYAPP_UPLOAD_STORE_FILE)
           storePassword MYAPP_UPLOAD_STORE_PASSWORD
           keyAlias MYAPP_UPLOAD_KEY_ALIAS
           keyPassword MYAPP_UPLOAD_KEY_PASSWORD
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled true
           shrinkResources true
       }
   }
   ```

---

## 8. Summary

- **Debug Builds**

  - `./gradlew assembleDevDebug`
  - `./gradlew assembleStagingDebug`
  - `./gradlew assembleReleaseDebug`

- **Release Builds**

  - `./gradlew assembleDevRelease`
  - `./gradlew assembleStagingRelease`
  - `./gradlew assembleReleaseRelease`

- **Play Store Bundles**

  - `./gradlew bundleDevRelease`
  - `./gradlew bundleStagingRelease`
  - `./gradlew bundleReleaseRelease`

---

✅ You now have a Capacitor Android app configured with **dev, staging, and production flavors** along with **debug/release build types**.
