package com.meter.giga

import android.app.Application
import io.sentry.Sentry
import io.sentry.android.AndroidSentryClientFactory

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


    // Initialize Sentry with legacy Android factory
    Sentry.init(
      getString(R.string.sentry_dsn),
      AndroidSentryClientFactory(applicationContext)
    )
    // Add global context data
    Sentry.getContext().apply {

      // 🏷️ Add custom tags (key-value)
      addTag("environment", getEnvironment())
    }
  }

  private fun getEnvironment(): String {
    when (BuildConfig.FLAVOR) {
      "dev" ->
        return "development"


      "staging" ->
        return "staging"


      "prod" ->
        return "production"


      else ->
        return "development"

    }
  }
}
