package com.meter.giga.data.util

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.meter.giga.data.models.responses.AsnData
import com.meter.giga.data.models.responses.AsnObject
import java.lang.reflect.Type

class AsnDataAdapter : JsonDeserializer<AsnData> {
  override fun deserialize(
    json: JsonElement?,
    typeOfT: Type?,
    context: JsonDeserializationContext
  ): AsnData? {
    if (json == null || json.isJsonNull) return null

    return when {
      json.isJsonPrimitive -> AsnData.AsString(json.asString)
      json.isJsonObject -> {
        val obj = context.deserialize<AsnObject>(json, AsnObject::class.java)
        AsnData.AsObject(obj)
      }

      else -> null
    }
  }
}

