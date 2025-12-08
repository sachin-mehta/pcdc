package com.meter.giga.ionic_plugin

import android.content.Context
import android.content.Intent
import com.getcapacitor.*
import com.meter.giga.MainActivity
import com.meter.giga.prefrences.AlarmSharedPref
import com.meter.giga.service.NetworkTestService
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.kotlin.*
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.shadows.ShadowApplication

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
class GigaAppPluginTest {

    private lateinit var plugin: GigaAppPlugin
    private lateinit var context: Context
    private lateinit var bridge: Bridge

    @Before
    fun setup() {
        context = Robolectric.buildActivity(MainActivity::class.java).get()

        val config = PluginConfig()
        bridge = mock()
        whenever(bridge.context).thenReturn(context)

        plugin = GigaAppPlugin()
        plugin.initialize(bridge)
        plugin.load()
    }

    // ----------------------------
    // 1️⃣ executeManualSpeedTest
    // ----------------------------
    @Test
    fun `executeManualSpeedTest should start service and schedule alarm`() {
        val call = mock<PluginCall>()
        whenever(call.getString("scheduleType")).thenReturn("manual")

        plugin.executeManualSpeedTest(call)

        val startedIntent =
            ShadowApplication.getInstance().nextStartedService
        assertEquals(NetworkTestService::class.java.name, startedIntent.component!!.className)

        verify(call).resolve()
    }

    // ------------------------------------
    // 2️⃣ getHistoricalSpeedTestData
    // ------------------------------------
    @Test
    fun `getHistoricalSpeedTestData returns historical data`() {
        val call = mock<PluginCall>()
        val alarmPref = AlarmSharedPref(context)
        val sampleData =
            """[{"download":10,"upload":5},{"download":20,"upload":10}]"""

        alarmPref.oldSpeedTestData = sampleData

        plugin.getHistoricalSpeedTestData(call)

        argumentCaptor<JSObject>().apply {
            verify(call).resolve(capture())

            val result = firstValue
            val measurements = result.getJSObject("historicalData")
                .getJSObject("measurements")
                .getJSArray("measurements")

            assertEquals(2, measurements.length())
        }
    }

    // -----------------------------------------------------
    // 3️⃣ storeAndScheduleSpeedTest
    // -----------------------------------------------------
    @Test
    fun `storeAndScheduleSpeedTest stores values into SharedPref`() {
        val call = mock<PluginCall>()

        whenever(call.getString(any())).thenReturn("value")

        plugin.storeAndScheduleSpeedTest(call)

        val alarmPref = AlarmSharedPref(context)

        assertEquals("value", alarmPref.browserId)
        assertEquals("value", alarmPref.schoolId)
        assertEquals("value", alarmPref.mlabUploadKey)

        verify(call).resolve()
    }

    // -----------------------------------------
    // 4️⃣ storeEnvironment
    // -----------------------------------------
    @Test
    fun `storeEnvironment updates environment`() {
        val call = mock<PluginCall>()
        whenever(call.getString("ENV_TYPE")).thenReturn("production")

        plugin.storeEnvironment(call)

        val alarmPref = AlarmSharedPref(context)
        assertEquals("production", alarmPref.environment)

        verify(call).resolve()
    }

    // -------------------------------------------------
    // 5️⃣ Companion Object Testing
    // -------------------------------------------------
    @Test
    fun `sendSpeedUpdate triggers notifyListeners`() {
        val spyPlugin = spy(plugin)
        GigaAppPlugin.Companion::class.java.getDeclaredField("pluginInstance")
            .apply {
                isAccessible = true
                set(null, spyPlugin)
            }

        GigaAppPlugin.sendSpeedUpdate(10.5, 5.3, "download")

        verify(spyPlugin).notifyListeners(eq("speedTestUpdate"), any())
    }

    @Test
    fun `sendSpeedTestStarted triggers listener`() {
        val spyPlugin = spy(plugin)
        GigaAppPlugin::class.java.getDeclaredField("pluginInstance")
            .apply {
                isAccessible = true
                set(null, spyPlugin)
            }

        GigaAppPlugin.sendSpeedTestStarted()

        verify(spyPlugin).notifyListeners(eq("speedTestUpdate"), any())
    }
}
