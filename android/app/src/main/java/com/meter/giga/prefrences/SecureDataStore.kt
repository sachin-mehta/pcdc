package com.meter.giga.prefrences

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.meter.giga.utils.Constants.GIGA_APP_PREFERENCES
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

// Extension property for DataStore
private val Context.secureDataStore by preferencesDataStore(
  name = GIGA_APP_PREFERENCES
)

class SecureDataStore(private val context: Context) {

  companion object {
    private val KEY_MLAB_UPLOAD_KEY = stringPreferencesKey("mlab_upload_key")
  }

  /** -------------------- Save Methods -------------------- */
  suspend fun setMlabUploadKey(value: String) {
    context.secureDataStore.edit { it[KEY_MLAB_UPLOAD_KEY] = value }
  }

  fun getMlabUploadKey(): String = runBlocking {
    context.secureDataStore.data.first()[KEY_MLAB_UPLOAD_KEY] ?: ""
  }
}
