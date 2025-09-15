package com.meter.giga.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.meter.giga.ararm_scheduler.AlarmHelper
import com.meter.giga.prefrences.AlarmSharedPref
import com.meter.giga.utils.Constants.FIRST_15_MIN
import com.meter.giga.utils.Constants.NEXT_SLOT
import com.meter.giga.utils.GigaUtil
import io.sentry.Sentry
import kotlin.random.Random

/**
 * BootBroadCastReceiver is used to receive the broadcast when system is restarted
 * This is native Broadcast Receiver component and registered in Manifest files
 * as well as Boot Broadcast Receiver
 */
class BootBroadCastReceiver : BroadcastReceiver() {

  /**
   * BroadcastReceiver overridden method onReceive method implementation
   * @param context: Context of the app
   * @param intent: instance of Intent, contains the data
   */
  override fun onReceive(context: Context, intent: Intent?) {
    Log.d("GIGA BootBroadCastReceiver", "On Boot")
    try {


      val prefs = AlarmSharedPref(context)
      val schoolId = prefs.schoolId
      if (schoolId != "" && intent?.action == Intent.ACTION_BOOT_COMPLETED && GigaUtil.isExactAlarmPermissionGranted(
          context
        )
      ) {
        try {
          scheduleAlarmOnRestart(context)
        } catch (e: Exception) {
          Log.d("BootBroadCastReceiver", "Failed to schedule due to ${e.toString()}")
          scheduleAlarmOnRestart(context)
        }
      } else {
        if (schoolId == "") {
          Log.d("BootBroadCastReceiver", "Failed to schedule due no school is registered")
        } else {
          Log.d("BootBroadCastReceiver", "Failed to schedule due to No permission granted")

        }
      }
    } catch (e: Exception) {
      Sentry.captureException(e)
    }
  }

  /**
   * This function is used to schedule the speed test when device (Android/Chromebook)
   * gets restart any time in the day
   * It take cares of speed test type for the day, like initial 15 min speed test or slot based
   * speed test
   * @param context : Context of app, used to access the Shared Preferences
   */
  private fun scheduleAlarmOnRestart(context: Context) {
    val alarmPrefs = AlarmSharedPref(context)

    /**
     * This check used to check if speed test need to schedule for the
     * new day
     */
    if (alarmPrefs.isNewDay()) {
      alarmPrefs.resetForNewDay()
      val now = System.currentTimeMillis()
      val randomIn15Min = now + Random.nextLong(0, 15 * 60 * 1000L)
      alarmPrefs.first15ScheduledTime = randomIn15Min
      Log.d("GIGA BootBroadCastReceiver", "On Boot New Day 15 Min $randomIn15Min")
      AlarmHelper.scheduleExactAlarm(context, randomIn15Min, FIRST_15_MIN)
    }
    /**
     * This check used to check if first 15 min speed test was scheduled
     * but not executed for the day
     */
    else if (alarmPrefs.first15ExecutedTime == -1L) {
      val now = System.currentTimeMillis()
      val randomIn15Min = now + Random.nextLong(0, 15 * 60 * 1000L)
      alarmPrefs.first15ScheduledTime = randomIn15Min
      Log.d("GIGA BootBroadCastReceiver", "On Boot Not Executed 15 Min $randomIn15Min")
      AlarmHelper.scheduleExactAlarm(context, randomIn15Min, FIRST_15_MIN)
    }
    /**
     * This schedules slot speed test based on current time
     * if speed test for current slot already executed ,
     * it schedules for next slot else for current slot
     */
    else {
      val executedTime = alarmPrefs.first15ExecutedTime
      val lastExecutionDate = alarmPrefs.lastExecutionDay
      val currentSlotStartHour = AlarmHelper.getSlotStartHour(executedTime)
      val (start, end) = AlarmHelper.getNextSlotRange(
        executedTime,
        currentSlotStartHour,
        lastExecutionDate
      )
      val nextAlarmTime = Random.nextLong(start, end)
      Log.d("GIGA BootBroadCastReceiver", "On Boot For Slot $nextAlarmTime")
      AlarmHelper.scheduleExactAlarm(context, nextAlarmTime, NEXT_SLOT)
    }
  }
}
