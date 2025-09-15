package com.meter.giga

import android.app.Application
import io.sentry.Sentry

class GigaApp : Application() {

  override fun onCreate() {
    super.onCreate()
    initSentry()
  }

  private fun initSentry() {
    Sentry.init { options ->
      options.dsn =
        "https://e52e97fc558344bc80a218fc22a9a6a9@excubo.unicef.io/47" // Replace with your actual DSN
      // Enable for debug builds
      options.isDebug = BuildConfig.DEBUG

      // Set Environment
      options.environment = if (BuildConfig.DEBUG) "development" else "production"
    }
  }
}
