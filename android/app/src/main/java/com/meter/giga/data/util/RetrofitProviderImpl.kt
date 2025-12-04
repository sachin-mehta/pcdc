package com.meter.giga.data.util

import com.google.gson.Gson
import com.meter.giga.network.RetrofitInstanceBuilder
import com.meter.giga.network.api.ApiService
import com.meter.giga.network.util.RetrofitProvider

class RetrofitInstanceProviderImpl : RetrofitProvider {
  override val clientInfoApi = RetrofitInstanceBuilder.clintInfoApi
  override val clientInfoLiteApi = RetrofitInstanceBuilder.clintInfoLitApi
  override val clientInfoFallbackApi = RetrofitInstanceBuilder.clintInfoFallbackApi
  override val serverInfoApi = RetrofitInstanceBuilder.serverInfoApi

  override fun getSpeedTestApi(baseUrl: String) =
    RetrofitInstanceBuilder.getSpeedTestApi(baseUrl)

  override fun getSpeedTestApiWithAdapter(baseUrl: String, gson: Gson) =
    RetrofitInstanceBuilder.getSpeedTestApiWithCustomAdapter(baseUrl, gson)
}

