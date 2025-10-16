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

4. **Java JDK 11/17/21**

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

6. **Add google-service.json**

   ```bash
     Add google-service.json file before building the project in android/app directory
   ```

---

## 2. Add Android Platform

This is already there in unicef giga meter, it will require to create the new android app, for giga meter need to skip.
Inside your Capacitor project root:

```bash
npx cap add android
npx cap open android
```

---

## 3. Configure Flavors

In Giga Meter android app environment configuration driven via \_production.prod_ts file params and passed to native layer via Capacitor Plugin. In Giga Meter app/build.gradle will be having below code

```gradle
android {
    ...

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
      debuggable true
      minifyEnabled false
      applicationIdSuffix ".debug"
      versionNameSuffix
    }
    release {
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

This is required if we are configuring the android build via gradle script and need to use below configuration.

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
      debuggable true
      minifyEnabled false
      applicationIdSuffix ".debug"
      versionNameSuffix
    }
    release {
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

## 4. Running app using Capacitor Commands via terminal

### Select Mode in \_environment.prod.ts as dev/stg/prod

- Run below command

  ```bash
  ionic build
  npx cap sync android
  npx cap run android
  ```

---

## 5. Running app using Android Studio IDE

- Run directly on device/emulator with live reload:

  ```bash
  npx cap run android
  ```

- Or install APK:

  ```bash
  adb install -r app/build/outputs/apk/dev/release/app-dev-release.apk
  ```

- Or Use Android Studio shortcuts
  Select the build variant debug/release as shown in image :
  ![alt text](image-1.png)

-Use run icon to run the app
![alt text](image.png)

---

## 6. Build Commands via Android Studio/VS Code/Terminal

Navigate to android drectory in project and run below commands to create builds

### Debug Variants

- **Build Debug**

  ```bash
  ./gradlew assembleDebug
  ```

### Release Variants (Signed)

- **Build Release**

  ```bash
  ./gradlew assembleRelease
  ```

### Bundles (AAB for Play Store)

- **Debug**

  ```bash
  ./gradlew bundleRelease
  ```

- **Release**

  ```bash
  ./gradlew bundleReleaseRelease
  ```

---

## 7. Debugging

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

## 8. Signing Release Builds

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

## 9. Summary

- **Debug Builds**

  - `./gradlew assembleDebug`

- **Release Builds**

  - `./gradlew assembleRelease`

- **Play Store Bundles**

  - `./gradlew bundleRelease`

## 9. Special Note : Existing Sentry version is 9.x where as android latest sentry sdk support 10.x sentry servers. Do not upgrade the android sdk until sentry server migrated to 10.x version,otherwise it will block the sentry logging.

---

✅ You now have a Capacitor Android app configured with **dev, staging, and production flavors** along with **debug/release build types**.
