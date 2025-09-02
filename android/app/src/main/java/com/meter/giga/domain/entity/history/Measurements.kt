package com.meter.giga.domain.entity.history

import com.google.gson.annotations.SerializedName


data class Measurements(
    @SerializedName("measurements")
    val measurements: ArrayList<MeasurementsItem>,
)
