package com.meter.giga.domain.entity.history


import com.google.gson.annotations.SerializedName

data class DataUsage(
    @SerializedName("download")
    val download: Long?,
    @SerializedName("total")
    val total: Long?,
    @SerializedName("upload")
    val upload: Long?
)
