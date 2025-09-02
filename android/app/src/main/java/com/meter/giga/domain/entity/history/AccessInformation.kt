package com.meter.giga.domain.entity.history

import com.google.gson.annotations.SerializedName


data class AccessInformation(
    @SerializedName("asn")
    val asn: String?,
    @SerializedName("city")
    val city: String?,
    @SerializedName("country")
    val country: String?,
    @SerializedName("hostname")
    val hostname: String?,
    @SerializedName("ip")
    val ip: String?,
    @SerializedName("loc")
    val loc: String?,
    @SerializedName("org")
    val org: String?,
    @SerializedName("postal")
    val postal: String?,
    @SerializedName("region")
    val region: String?,
    @SerializedName("timezone")
    val timezone: String?
)
