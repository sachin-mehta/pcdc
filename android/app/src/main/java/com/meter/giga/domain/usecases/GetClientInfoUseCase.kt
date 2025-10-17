package com.meter.giga.domain.usecases

import android.util.Log
import com.meter.giga.data.repository.SpeedTestRepositoryImpl
import com.meter.giga.domain.entity.response.ClientInfoResponseEntity
import com.meter.giga.utils.ResultState

/**
 * This class is responsible only to fetch the Client Info
 * Data
 */
class GetClientInfoUseCase() {
  /**
   * This function responsible for fetching the client info
   * @return ResultState<ClientInfoResponseEntity?> : Result State
   * as Success as ClientInfoResponseEntity instance
   * as Failure as String Message with failure message
   */
  suspend fun invoke(ipInfoToken: String): ResultState<ClientInfoResponseEntity?> {
    val speedTestRepository = SpeedTestRepositoryImpl()
    Log.d("GIGA GetClientInfoUseCase", "speedTestRepository $speedTestRepository")
    return speedTestRepository.getClientInfoData(ipInfoToken)
  }
}
