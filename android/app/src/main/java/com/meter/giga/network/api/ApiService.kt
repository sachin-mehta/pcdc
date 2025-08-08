package com.meter.giga.network.api

import com.meter.giga.BuildConfig
import com.meter.giga.data.models.requests.SpeedTestResultRequestModel
import com.meter.giga.data.models.responses.ClientInfoFallbackResponseModel
import com.meter.giga.data.models.responses.ClientInfoResponseModel
import com.meter.giga.data.models.responses.ServerInfoResponseModel
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.Query

/**
 * Retrofit API Service interface provides
 * End point url definition to hit with
 * API call type like @POST/@GET/@DELETE/@PUT etc
 */
interface ApiService {

  /**
   * getClientInfo info end point
   * @param token : access token to extract client info
   * @return Instance of Response as ClientInfoResponseModel if success or Error
   */
  @GET("json")
  suspend fun getClientInfo(
    @Query("token") token: String = BuildConfig.CLIENT_INFO_TOKEN
  ): Response<ClientInfoResponseModel>

  /**
   * getClient Info Fallback end point
   * @return Instance of Response as ClientInfoFallbackResponseModel if success or Error
   */
  @GET("ip/geo.json")
  suspend fun getClientInfoFallback(): Response<ClientInfoFallbackResponseModel>

  /**
   * postSpeedTestData to submit the speed test data on backend
   * @param token : Access Token for backend
   * @param body : SPeed Test Result data
   * @return : Instance of Response as Success or error
   */

  @POST("measurements")
  suspend fun postSpeedTestData(
    @Header("Authorization") authorization: String = "Bearer ${BuildConfig.SPEED_TEST_TOKEN}",
    @Body body: SpeedTestResultRequestModel
  ): Response<Unit>

  /**
   * getServerInfoNoPolicy to fetch the server details
   * @param format
   * @return Instance of Response as ServerInfoResponseModel if Success or error
   */
  @GET("ndt")
  suspend fun getServerInfoNoPolicy(
    @Query("format") format: String = "json",
  ): Response<ServerInfoResponseModel>


  /**
   * getServerMetroInfo to fetch the server details if metro details available
   * @param format
   * @param policy : metro type policy
   * @param metro : Selected metro
   * @return Instance of Response as ServerInfoResponseModel if Success or error
   */
  @GET("ndt")
  suspend fun getServerMetroInfo(
    @Query("format") format: String = "json",
    @Query("policy") policy: String = "metro",
    @Query("metro") metro: String
  ): Response<ServerInfoResponseModel>
}
