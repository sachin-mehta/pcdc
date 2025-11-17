package com.meter.giga.data.models.responses


import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ClientInfoMetaDataModel(
    @SerialName("asn")
    val asn: AsnData?,
    @SerialName("city")
    val city: String?,
    @SerialName("country")
    val country: String?,
    @SerialName("hostname")
    val hostname: Any?,
    @SerialName("id")
    val id: Int?,
    @SerialName("ip")
    val ip: String?,
    @SerialName("loc")
    val loc: String?,
    @SerialName("org")
    val org: String?,
    @SerialName("postal")
    val postal: String?,
    @SerialName("region")
    val region: String?,
    @SerialName("timezone")
    val timezone: String?
)
