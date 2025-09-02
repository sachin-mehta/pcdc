package com.meter.giga.domain.entity.history

import com.google.gson.annotations.SerializedName


data class SnapLog(
    @SerializedName("c2sRate")
    val c2sRate: List<Double?>?,
    @SerializedName("s2cRate")
    val s2cRate: List<Double?>?
)
