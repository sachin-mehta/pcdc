package com.meter.giga.ararm_scheduler

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log

import com.meter.giga.receiver.ScheduleBroadcastReceiver
import com.meter.giga.utils.Constants.SCHEDULE_TYPE
import java.util.Calendar
import kotlin.jvm.java

/**
 * This provides Singleton instance of AlarmHelper
 * This class is used to schedule the next Speed Test
 * Also getting used to calculate the next speed test slot
 */
object AlarmHelper {

  /**
   * This function is getting used to schedule the speed test
   * at exact time
   * @param context: App context to schedule the alarm
   * @param triggerAtMillis: Time at which need to schedule the speed test
   * @param tag: Defines if scheduled test is of start or daily one
   */
  @JvmStatic
  @SuppressLint("ScheduleExactAlarm")
  fun scheduleExactAlarm(context: Context, triggerAtMillis: Long, tag: String) {
    Log.d("GIGA AlarmHelper", "scheduleExactAlarm at $triggerAtMillis")

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val intent = Intent(context, ScheduleBroadcastReceiver::class.java).apply {
      putExtra(SCHEDULE_TYPE, tag)
    }
    val pendingIntent = PendingIntent.getBroadcast(
      context,
      tag.hashCode(),
      intent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )

    alarmManager.setExactAndAllowWhileIdle(
      AlarmManager.RTC_WAKEUP,
      triggerAtMillis,
      pendingIntent
    )
  }

  /**
   * This function is getting used to get the next slot range
   * @param afterMillis : time instance in milliseconds
   * @param lastSlotHour : Previous speed test slot
   * @param lastExecutionDay : When the last scheduled speed test performed
   * @return Pair of start and end of slot time
   */
  @JvmStatic
  fun getNextSlotRange(
    afterMillis: Long,
    lastSlotHour: Int,
    lastExecutionDay: Int
  ): Pair<Long, Long> {
    val slots = listOf(8 to 12, 12 to 16, 16 to 20)
    val calendar = Calendar.getInstance().apply { timeInMillis = afterMillis }
    var isExecutedInCurrentSlot = false
    for ((startHour, endHour) in slots) {
      val start = Calendar.getInstance().apply {
        timeInMillis = calendar.timeInMillis
        set(Calendar.HOUR_OF_DAY, startHour)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
      }.timeInMillis

      val end = Calendar.getInstance().apply {
        timeInMillis = calendar.timeInMillis
        set(Calendar.HOUR_OF_DAY, endHour)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
      }.timeInMillis

      if (isExecutedInCurrentSlot) {
        Log.d("GIGA AlarmHelper", "Slot scheduling in next slot time")
        isExecutedInCurrentSlot = false
        return start to end
      }
      val today = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
      Log.d("GIGA AlarmHelper", "today at $today")
      if (afterMillis in start until end) {
        return if (lastSlotHour == startHour && today == lastExecutionDay) {
          Log.d("GIGA AlarmHelper", "Already Executed for Slot")
          isExecutedInCurrentSlot = true
          // Already executed in this slot, go to next
          continue
        } else {
          // Still inside current slot and not executed
          Log.d("GIGA AlarmHelper", "Deciding slot time")
          val adjustedStart = maxOf(afterMillis + 60_000L, start)
          return adjustedStart to end
        }
      }
    }

    Log.d("GIGA AlarmHelper", "getNextSlotRange scheduling for next day")

    // Move to next day's 6 AM - 8 PM
    val tomorrowStart = Calendar.getInstance().apply {
      add(Calendar.DATE, 1)
      set(Calendar.HOUR_OF_DAY, 6)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    val tomorrowEnd = Calendar.getInstance().apply {
      add(Calendar.DATE, 1)
      set(Calendar.HOUR_OF_DAY, 8)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    return tomorrowStart to tomorrowEnd
  }

  /**
   * returns slot time start time
   * @param millis : time instance in milliseconds
   * @return Slot start time
   */
  @JvmStatic
  fun getSlotStartHour(millis: Long): Int {
    val hour = Calendar.getInstance().apply {
      timeInMillis = millis
    }.get(Calendar.HOUR_OF_DAY)

    return when (hour) {
      in 8 until 12 -> 8
      in 12 until 16 -> 12
      in 16 until 20 -> 16
      else -> -1
    }
  }

}
