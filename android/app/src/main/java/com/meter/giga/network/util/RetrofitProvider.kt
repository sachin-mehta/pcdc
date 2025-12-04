package com.meter.giga.network.util

import com.google.gson.Gson
import com.meter.giga.network.api.ApiService


interface RetrofitProvider {
  val clientInfoApi: ApiService
  val clientInfoFallbackApi: ApiService
  val clientInfoLiteApi: ApiService
  val serverInfoApi: ApiService

  fun getSpeedTestApi(baseUrl: String): ApiService
  fun getSpeedTestApiWithAdapter(baseUrl: String, gson: Gson): ApiService
}


