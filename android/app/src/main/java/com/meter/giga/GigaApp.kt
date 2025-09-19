package com.meter.giga

import android.app.Application
import io.sentry.Sentry
import io.sentry.android.core.SentryAndroid

class GigaApp : Application() {

  override fun onCreate() {
    super.onCreate()
    initSentry()
  }

  private fun initSentry() {

    SentryAndroid.init(this) { options ->
      options.dsn = getString(R.string.sentry_dsn)
      options.isDebug = BuildConfig.DEBUG
      options.environment = "development" // if (BuildConfig.DEBUG) "development" else "production"
      options.setTracesSampleRate(1.0) // capture 100% for demo
    }
  }
}
