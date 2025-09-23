package com.meter.giga

import android.app.Application
import io.sentry.Sentry
import io.sentry.android.core.SentryAndroid

/**
 * Giga App Application class
 * This class is getting used to instantiate the third party
 * libs like Sentry etc.
 */
class GigaApp : Application() {

  override fun onCreate() {
    super.onCreate()
    initSentry()
  }

  /**
   * This function is used to instantiate the Sentry instance to capture the
   * logs
   */
  private fun initSentry() {
    SentryAndroid.init(this) { options ->
      options.dsn = getString(R.string.sentry_dsn)
      options.isDebug = BuildConfig.DEBUG
      options.environment = "development" // if (BuildConfig.DEBUG) "development" else "production"
      options.connectionTimeoutMillis = 10000 // 10 seconds
      options.readTimeoutMillis = 10000
    }
  }
}
