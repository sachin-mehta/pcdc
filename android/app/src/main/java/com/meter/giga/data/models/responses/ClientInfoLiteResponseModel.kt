package com.meter.giga.data.models.responses


import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ClientInfoLiteResponseModel(
    @SerialName("as_domain")
    val asDomain: String?,
    @SerialName("as_name")
    val asName: String?,
    @SerialName("asn")
    val asn: String?,
    @SerialName("continent")
    val continent: String?,
    @SerialName("continent_code")
    val continentCode: String?,
    @SerialName("country")
    val country: String?,
    @SerialName("country_code")
    val countryCode: String?,
    @SerialName("ip")
    val ip: String?
)
