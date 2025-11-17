package com.meter.giga.data.models.responses

sealed class AsnData {
  data class AsString(val value: String) : AsnData()
  data class AsObject(val obj: AsnObject) : AsnData()
}

data class AsnObject(
  val asn: String?
)
