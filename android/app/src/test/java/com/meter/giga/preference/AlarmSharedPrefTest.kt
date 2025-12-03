package com.meter.giga.preference

import android.content.Context
import android.content.SharedPreferences
import com.meter.giga.prefrences.AlarmSharedPref
import com.meter.giga.utils.Constants.KEY_BROWSER_ID
import com.meter.giga.utils.Constants.KEY_COUNTRY_CODE
import com.meter.giga.utils.Constants.KEY_FIRST_15_EXECUTED_TIME
import com.meter.giga.utils.Constants.KEY_FIRST_15_SCHEDULED_TIME
import com.meter.giga.utils.Constants.KEY_GIGA_SCHOOL_ID
import com.meter.giga.utils.Constants.KEY_HISTORY_DATA_INDEX
import com.meter.giga.utils.Constants.KEY_IP_ADDRESS
import com.meter.giga.utils.Constants.KEY_IS_TEST_RUNNING
import com.meter.giga.utils.Constants.KEY_LAST_EXECUTION_DAY
import com.meter.giga.utils.Constants.KEY_LAST_SLOT_EXECUTION_HOUR
import com.meter.giga.utils.Constants.KEY_NEXT_EXECUTION_TIME
import com.meter.giga.utils.Constants.KEY_OLD_SPEEDTEST_DATA
import com.meter.giga.utils.Constants.KEY_SCHOOL_ID
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.*
import java.util.Calendar

class AlarmSharedPrefTest {

  private lateinit var context: Context
  private lateinit var prefs: SharedPreferences
  private lateinit var editor: SharedPreferences.Editor
  private lateinit var alarmPrefs: AlarmSharedPref

  @Before
  fun setup() {
    context = mock()
    prefs = mock()
    editor = mock()

    whenever(context.getSharedPreferences(any(), any())).thenReturn(prefs)
    whenever(prefs.edit()).thenReturn(editor)
    whenever(editor.putLong(any(), any())).thenReturn(editor)
    whenever(editor.putInt(any(), any())).thenReturn(editor)
    whenever(editor.putString(any(), any())).thenReturn(editor)
    whenever(editor.putBoolean(any(), any())).thenReturn(editor)

    alarmPrefs = AlarmSharedPref(context)
  }

  @Test
  fun `first15ExecutedTime setter and getter`() {
    whenever(prefs.getLong(any(), any())).thenReturn(123L)
    alarmPrefs.first15ExecutedTime = 123L
    assertEquals(123L, alarmPrefs.first15ExecutedTime)
  }

  @Test
  fun `first15ScheduledTime setter and getter`() {
    whenever(prefs.getLong(any(), any())).thenReturn(555L)
    alarmPrefs.first15ScheduledTime = 555L
    assertEquals(555L, alarmPrefs.first15ScheduledTime)
  }

  @Test
  fun `lastExecutionDay setter and getter`() {
    whenever(prefs.getInt(any(), any())).thenReturn(7)
    alarmPrefs.lastExecutionDay = 7
    assertEquals(7, alarmPrefs.lastExecutionDay)
  }

  @Test
  fun `nextExecutionTime setter and getter`() {
    whenever(prefs.getLong(any(), any())).thenReturn(999L)
    alarmPrefs.nextExecutionTime = 999L
    assertEquals(999L, alarmPrefs.nextExecutionTime)
  }

  @Test
  fun `lastSlotHour setter and getter`() {
    whenever(prefs.getInt(any(), any())).thenReturn(10)
    alarmPrefs.lastSlotHour = 10
    assertEquals(10, alarmPrefs.lastSlotHour)
  }

  @Test
  fun `historyDataIndex setter and getter`() {
    whenever(prefs.getInt(any(), any())).thenReturn(3)
    alarmPrefs.historyDataIndex = 3
    assertEquals(3, alarmPrefs.historyDataIndex)
  }

  @Test
  fun `countryCode setter and getter`() {
    whenever(prefs.getString(any(), anyOrNull())).thenReturn("IN")
    alarmPrefs.countryCode = "IN"
    assertEquals("IN", alarmPrefs.countryCode)
  }

  @Test
  fun `schoolId setter and getter`() {
    whenever(prefs.getString(any(), any())).thenReturn("123")
    alarmPrefs.schoolId = "123"
    assertEquals("123", alarmPrefs.schoolId)
  }

  @Test
  fun `mlabUploadKey setter and getter`() {
    whenever(prefs.getString(any(), any())).thenReturn("key")
    alarmPrefs.mlabUploadKey = "key"
    assertEquals("key", alarmPrefs.mlabUploadKey)
  }

  @Test
  fun `gigaSchoolId setter and getter`() {
    whenever(prefs.getString(any(), any())).thenReturn("giga")
    alarmPrefs.gigaSchoolId = "giga"
    assertEquals("giga", alarmPrefs.gigaSchoolId)
  }

  @Test
  fun `browserId setter and getter`() {
    whenever(prefs.getString(any(), anyOrNull())).thenReturn("browser")
    alarmPrefs.browserId = "browser"
    assertEquals("browser", alarmPrefs.browserId)
  }

  @Test
  fun `baseUrl setter and getter`() {
    whenever(prefs.getString(any(), anyOrNull())).thenReturn("https://api")
    alarmPrefs.baseUrl = "https://api"
    assertEquals("https://api", alarmPrefs.baseUrl)
  }

  @Test
  fun `ipInfoToken setter and getter`() {
    whenever(prefs.getString(any(), anyOrNull())).thenReturn("token")
    alarmPrefs.ipInfoToken = "token"
    assertEquals("token", alarmPrefs.ipInfoToken)
  }

  @Test
  fun `ipAddress setter and getter`() {
    whenever(prefs.getString(any(), anyOrNull())).thenReturn("1.1.1.1")
    alarmPrefs.ipAddress = "1.1.1.1"
    assertEquals("1.1.1.1", alarmPrefs.ipAddress)
  }

  @Test
  fun `oldSpeedTestData setter and getter`() {
    whenever(prefs.getString(any(), any())).thenReturn("[1]")
    alarmPrefs.oldSpeedTestData = "[1]"
    assertEquals("[1]", alarmPrefs.oldSpeedTestData)
  }

  @Test
  fun `environment setter and getter`() {
    whenever(prefs.getString(any(), any())).thenReturn("production")
    alarmPrefs.environment = "production"
    assertEquals("production", alarmPrefs.environment)
  }

  @Test
  fun `isTestRunning setter and getter`() {
    whenever(prefs.getBoolean(any(), any())).thenReturn(true)
    alarmPrefs.isTestRunning = true
    assertTrue(alarmPrefs.isTestRunning)
  }

  // --------------------------
  // isNewDay()
  // --------------------------

  @Test
  fun `isNewDay returns true when lastExecutionDay is different`() {
    val today = java.util.Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
    whenever(prefs.getInt(any(), any())).thenReturn(today - 1)

    assertTrue(alarmPrefs.isNewDay())
  }

  @Test
  fun `isNewDay returns false when lastExecutionDay is today`() {
    val today = java.util.Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
    whenever(prefs.getInt(any(), any())).thenReturn(today)

    assertFalse(alarmPrefs.isNewDay())
  }

  // --------------------------
  // resetForNewDay()
  // --------------------------

  @Test
  fun `resetForNewDay writes expected values`() {
    alarmPrefs.resetForNewDay()

    verify(editor).putLong(eq(KEY_FIRST_15_SCHEDULED_TIME), eq(-1L))
    verify(editor).putLong(eq(KEY_FIRST_15_EXECUTED_TIME), eq(-1L))
    verify(editor).putInt(eq(KEY_LAST_SLOT_EXECUTION_HOUR), eq(-1))
    verify(editor).putInt(eq(KEY_LAST_EXECUTION_DAY), eq(-1))
    verify(editor).putBoolean(eq(KEY_IS_TEST_RUNNING), eq(false))
    verify(editor).putLong(eq(KEY_NEXT_EXECUTION_TIME), eq(-1L))
  }

  // --------------------------
  // resetAllData()
  // --------------------------

  @Test
  fun `resetAllData writes expected values`() {
    alarmPrefs.resetAllData()

    verify(editor).putString(eq(KEY_SCHOOL_ID), eq(""))
    verify(editor).putString(eq(KEY_GIGA_SCHOOL_ID), eq(""))
    verify(editor).putString(eq(KEY_COUNTRY_CODE), eq(""))
    verify(editor).putString(eq(KEY_BROWSER_ID), eq(""))
    verify(editor).putString(eq(KEY_IP_ADDRESS), eq(""))
    verify(editor).putString(eq(KEY_OLD_SPEEDTEST_DATA), eq("[]"))

    verify(editor).putInt(eq(KEY_HISTORY_DATA_INDEX), eq(0))
    verify(editor).putBoolean(eq(KEY_IS_TEST_RUNNING), eq(false))
    verify(editor).putLong(eq(KEY_NEXT_EXECUTION_TIME), eq(-1L))
  }
}
