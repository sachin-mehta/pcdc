package com.meter.giga

import android.app.Application
import android.util.Log
import com.meter.giga.prefrences.AlarmSharedPref
import com.meter.giga.utils.AppLogger
import io.sentry.Sentry
import io.sentry.android.AndroidSentryClientFactory
import java.util.Properties

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

    // Access capacitor config
    val props = Properties()
    try {
      val inputStream = assets.open("env.properties")
      props.load(inputStream)
    } catch (e: Exception) {
      e.printStackTrace()
    }
    // Add global context data
    val alarmPrefs = AlarmSharedPref(this.applicationContext)
    val environment = props.getProperty("ENVIRONMENT", "development")
    alarmPrefs.environment = environment
    AppLogger.d("GIGA App environment : ", environment)
    // Initialize Sentry with legacy Android factory
    Sentry.init(
      getString(R.string.sentry_dsn),
      AndroidSentryClientFactory(applicationContext)
    )
    Sentry.getContext().apply {

      // 🏷️ Add custom tags (key-value)
      addTag("environment", getEnvironment(environment))
    }
  }

  private fun getEnvironment(env: String): String {
    when (env) {
      "stg" ->
        return "staging"


      "prod" ->
        return "production"


      else ->
        return "development"

    }
  }
}
