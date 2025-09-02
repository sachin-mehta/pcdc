package com.meter.giga.domain.entity.history

import com.google.gson.annotations.SerializedName


data class MlabInformation(
    @SerializedName("city")
    val city: String?,
    @SerializedName("country")
    val country: String?,
    @SerializedName("fqdn")
    val fqdn: String?,
    @SerializedName("ip")
    val ip: List<String?>?,
    @SerializedName("label")
    val label: String?,
    @SerializedName("metro")
    val metro: String?,
    @SerializedName("site")
    val site: String?,
    @SerializedName("url")
    val url: String?
)
