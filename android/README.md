# Giga Meter Android App - Configuration & Build Guide

This guide provides step-by-step setup and build instructions for the **Giga Meter Android app** with **flavors (dev, staging, release)** and standard **build types (debug, release)**.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Add Android Platform](#2-add-android-platform)
3. [Configure Flavors](#3-configure-flavors)
4. [Running app using Capacitor Commands via terminal](#4-running-app-using-capacitor-commands-via-terminal)
5. [Running app using Android Studio IDE](#5-running-app-using-android-studio-ide)
6. [Build Commands via Android Studio/VS Code/Terminal](#6-build-commands-via-android-studiovs-codeterminal)
7. [APK File Locations](#7-apk-file-locations)
8. [Debugging](#8-debugging)
9. [Signing Release Builds](#9-signing-release-builds)
10. [Summary](#10-summary)
11. [Special Note](#11-special-note)

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

4. **Java JDK 21**

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

6. **Add google-services.json**

   A `google-services.json` file is required for Firebase services (Crashlytics, Analytics, etc.). Place it in the `android/app/` directory. Refer the Firebase [official documentation](https://firebase.google.com/docs/android/setup) for more info.

7. **Sentry Configuration**

   A Sentry DSN URL is required for error tracking. This app uses Sentry SDK **version 9.1.2** (must match the deployed version - **do not upgrade to 10.x until the sentry server is migrated)**. Refer to Sentry's [official documentation](https://docs.sentry.io/platforms/android/) for more info.

---

## 2. Add Android Platform

**Note**: The Android platform is already configured for the UNICEF Giga Meter project. If you're working on a new Android app, you can skip this step. For new projects, follow the instructions below.
Inside your project/repo root:

```bash
npx cap add android
npx cap open android
```

---

## 3. Configure Flavors

**What are Flavors?** Android flavors are different variants of your app built from the same codebase but with different configurations. In the Giga Meter app, we use flavors to create separate builds for different environments (dev, staging, production) with different API endpoints and settings.

In the Giga Meter android app, the environment configuration is driven via `_environment.prod.ts` file params and passed to native layer via Capacitor Plugin. 

**IMPORTANT**: The product flavors are currently commented out in the `app/build.gradle` file and need to be uncommented to enable flavor-specific builds.

### Step 1: Uncomment the Flavor Configuration

In `android/app/build.gradle`, you need to uncomment the following sections:

1. **Uncomment the `flavorDimensions` line** (around line 50):
   ```gradle
   flavorDimensions "environment"
   ```

2. **Uncomment the `productFlavors` block** (around lines 52-67):
   ```gradle
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
   ```

### Step 2: Verify Configuration

After uncommenting, your `android/app/build.gradle` should have the complete configuration:

```gradle
android {
    // ... other configurations ...

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
            applicationIdSuffix ".debug" // Need to remove it once we got the crashlytics json config
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 3: Verify BASE_URL Variables

Ensure the following variables are defined in `android/gradle.properties`:
```
BASE_URL_DEVELOPMENT=https://uni-ooi-giga-meter-backend-dev.azurewebsites.net/api/v1/
BASE_URL_STAGING=https://uni-ooi-giga-meter-backend-stg.azurewebsites.net/api/v1/
BASE_URL_PRODUCTION=https://uni-ooi-giga-meter-backend.azurewebsites.net/api/v1/
```

### Step 4: Set the Environment MODE in the Angular Settings

In the `\_environment.prod.ts` file, set the ```mode``` field as one of these options:
- dev
- stg
- prod

Setting this value will define which BASE_URL_X is used from the `android/gradle.properties` defined in Step 3.

## 4. Running app using Capacitor Commands via terminal



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

Navigate to android directory in project and run below commands to create builds

### Debug Variants

- **Build Debug (Default)**
  ```bash
  ./gradlew assembleDebug
  ```

- **Build Dev Debug**
  ```bash
  ./gradlew assembleDevDebug
  ```

- **Build Staging Debug**
  ```bash
  ./gradlew assembleStagingDebug
  ```

- **Build Prod Debug**
  ```bash
  ./gradlew assembleProdDebug
  ```

### Release Variants (Signed)

- **Build Release (Default)**
  ```bash
  ./gradlew assembleRelease
  ```

- **Build Dev Release**
  ```bash
  ./gradlew assembleDevRelease
  ```

- **Build Staging Release**
  ```bash
  ./gradlew assembleStagingRelease
  ```

- **Build Prod Release**
  ```bash
  ./gradlew assembleProdRelease
  ```

### Bundles (AAB for Play Store)

- **Debug Bundle**
  ```bash
  ./gradlew bundleDebug
  ```

- **Release Bundle**
  ```bash
  ./gradlew bundleRelease
  ```

- **Dev Release Bundle**
  ```bash
  ./gradlew bundleDevRelease
  ```

- **Staging Release Bundle**
  ```bash
  ./gradlew bundleStagingRelease
  ```

- **Prod Release Bundle**
  ```bash
  ./gradlew bundleProdRelease
  ```

---

## 7. APK File Locations

APK files are generated in: `android/app/build/outputs/apk/`

- Debug builds: `android/app/build/outputs/apk/{flavor}/debug/`
- Release builds: `android/app/build/outputs/apk/{flavor}/release/`
- Bundles (AAB): `android/app/build/outputs/bundle/{flavor}/release/`

---

## 8. Debugging

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

## 9. Signing Release Builds

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

