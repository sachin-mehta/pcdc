package com.meter.giga.data.repository

import android.util.Log
import com.meter.giga.BuildConfig
import com.meter.giga.domain.entity.request.SpeedTestResultRequestEntity
import com.meter.giga.domain.entity.response.ClientInfoResponseEntity
import com.meter.giga.domain.entity.response.ServerInfoResponseEntity
import com.meter.giga.domain.repository.SpeedTestRepository
import com.meter.giga.error_handler.ErrorEntity
import com.meter.giga.error_handler.ErrorHandlerImpl
import com.meter.giga.network.RetrofitInstanceBuilder
import com.meter.giga.utils.ResultState
import com.meter.giga.utils.toEntity
import com.meter.giga.utils.toModel

/**
 * SpeedTestRepositoryImpl provides abstract implementation of
 * SpeedTestRepository interface
 */
class SpeedTestRepositoryImpl : SpeedTestRepository {
  /**
   * This function provides getClientInfoData function
   * implementation
   * @return ResultState<ClientInfoResponseEntity?> : Result State
   * as Success as ClientInfoResponseEntity instance
   * as Failure as String Message with failure message
   */
  override suspend fun getClientInfoData(): ResultState<ClientInfoResponseEntity?> {
    try {
      Log.d("GIGA SpeedTestRepositoryImpl", "getClientInfoData Invoked")
      val response = RetrofitInstanceBuilder.clintInfoApi.getClientInfo()
      Log.d("GIGA SpeedTestRepositoryImpl", "response $response")
      if (response.isSuccessful) {
        if (response.body() != null) {
          return ResultState.Success(
            response.body()!!.toEntity()
          )
        } else {
          val fallbackResponse =
            RetrofitInstanceBuilder.clintInfoFallbackApi.getClientInfoFallback()
          if (fallbackResponse.isSuccessful) {
            return if (fallbackResponse.body() != null) {
              ResultState.Success(
                response.body()!!.toEntity()
              )
            } else {
              ResultState.Failure(ErrorHandlerImpl().getError(response.errorBody()))
            }
          }
        }
      }
      return ResultState.Failure(
        ErrorEntity.Unknown("Get client info api failed")
      )
    } catch (e: Exception) {
      Log.d("GIGA SpeedTestRepositoryImpl", "Exception $e")
      return ResultState.Failure(
        ErrorEntity.Unknown("Get client info api failed")
      )
    }
  }

  /**
   * This function provides getServerInfoData function
   * implementation
   * @param metro : Null or value if user has selected any metro
   * @return ResultState<ServerInfoResponseEntity?> : Result State
   * as Success as ServerInfoResponseEntity instance
   * as Failure as String Message with failure message
   */
  override suspend fun getServerInfoData(metro: String?): ResultState<ServerInfoResponseEntity?> {
    Log.d("GIGA SpeedTestRepositoryImpl", "getClientInfoData Invoked")
    val response = if (metro != null && metro != "automatic") {
      RetrofitInstanceBuilder.serverInfoApi.getServerMetroInfo(metro = metro)
    } else {
      RetrofitInstanceBuilder.serverInfoApi.getServerInfoNoPolicy()
    }
    Log.d("GIGA SpeedTestRepositoryImpl", "response $response")
    if (response.isSuccessful) {
      if (response.body() != null) {
        return ResultState.Success(
          response.body()!!.toEntity()
        )
      } else {
        ResultState.Failure(ErrorHandlerImpl().getError(response.errorBody()))
      }
    }
    return ResultState.Failure(
      ErrorEntity.Unknown("Get client info api failed")
    )
  }

  /**
   * This function provides publishSpeedTestData function
   * implementation to post the speed test data
   * @param speedTestData : instance of SpeedTestResultRequestEntity,
   * contains details of speed test
   * @return ResultState<Any?>
   *   as Success if posted the data successfully
   *   as Failure if post request failed with message
   */
  override suspend fun publishSpeedTestData(
    speedTestData: SpeedTestResultRequestEntity,
    uploadKey: String
  ): ResultState<Unit?> {
    val response =
      RetrofitInstanceBuilder.speedTestApi.postSpeedTestData(
        body = speedTestData.toModel(),
        authorization = "Bearer $uploadKey"
      )
    if (response.isSuccessful) {
      Log.d("GIGA SpeedTestRepositoryImpl Success", "$response")
      if (response.body() != null) {
        return ResultState.Success(
          response.body()!!
        )
      } else {
        return ResultState.Failure(ErrorHandlerImpl().getError(response.errorBody()))
      }
    } else {
      Log.d("GIGA SpeedTestRepositoryImpl Failure", "$response")
    }
    return ResultState.Failure(
      ErrorEntity.Unknown("Post speed test data api failed")
    )
  }
}

