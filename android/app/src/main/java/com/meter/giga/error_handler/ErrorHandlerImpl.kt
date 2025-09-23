package com.meter.giga.error_handler

import okhttp3.ResponseBody

/**
 * ErrorHandlerImpl provide implementation for ErrorHandler
 */
class ErrorHandlerImpl() : ErrorHandler {

  /**
   * Provides implementation to get the error type instance, it can be extended
   * to check the error types from server and based on that ErrorEntity instance
   * can be created.
   * @param errorBody : ResponseBody instance received from server
   * @return ErrorEntity
   */
  override fun getError(errorBody: ResponseBody?): ErrorEntity {
    return when (errorBody) {
      else -> ErrorEntity.Unknown(errorBody?.string() ?: "Api failed")
    }
  }
}
