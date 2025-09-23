package com.meter.giga.error_handler

import okhttp3.ResponseBody

/**
 * Error handler to provide the error based on error
 * type from server
 */
interface ErrorHandler {
  /**
   * This function is used to provide the
   * abstraction to return ErrorEntity instance
   * @param responseBody: Instance of ResponseBody
   * @return ErrorEntity
   */
  fun getError(responseBody: ResponseBody?): ErrorEntity
}
