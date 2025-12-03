package com.meter.giga.utils

import android.util.Log

object AppLogger : Logger {
  override fun d(tag: String, msg: String) {
    Log.d(tag, msg)
  }
}
