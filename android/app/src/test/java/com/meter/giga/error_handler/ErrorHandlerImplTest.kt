package com.meter.giga.error_handler

import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.ResponseBody
import org.junit.Assert.*
import org.junit.Test

class ErrorHandlerImplTest {

  private val errorHandler = ErrorHandlerImpl()

  // Helper to create ResponseBody
  private fun body(content: String?): ResponseBody {
    return ResponseBody.create("application/json".toMediaTypeOrNull(), content ?: "")
  }

  @Test
  fun `getError should return Unknown when responseBody is null`() {
    val error = errorHandler.getError(null)

    assertTrue(error is ErrorEntity.Unknown)
    assertEquals("Api failed", (error as ErrorEntity.Unknown).message)
  }

  @Test
  fun `getError should return Unknown with provided message`() {
    val response = body("Something bad happened")

    val error = errorHandler.getError(response)

    assertTrue(error is ErrorEntity.Unknown)
    assertEquals("Something bad happened", (error as ErrorEntity.Unknown).message)
  }

  @Test
  fun `getError should return Unknown with empty string when body is empty`() {
    val response = body("")

    val error = errorHandler.getError(response)

    assertTrue(error is ErrorEntity.Unknown)
    assertEquals("", (error as ErrorEntity.Unknown).message)
  }

  @Test
  fun `getError should handle large JSON body`() {
    val json = """{ "error": "Server exploded", "code": 500 }"""
    val response = body(json)

    val error = errorHandler.getError(response)

    assertTrue(error is ErrorEntity.Unknown)
    assertEquals(json, (error as ErrorEntity.Unknown).message)
  }

  @Test
  fun `getError should treat whitespace-only body as empty`() {
    val response = body("   ")

    val error = errorHandler.getError(response)

    assertTrue(error is ErrorEntity.Unknown)
    assertEquals("   ", (error as ErrorEntity.Unknown).message)
  }

  @Test
  fun `getError should handle json-like body`() {
    val json = """{"msg":"Invalid token"}"""
    val response = body(json)

    val error = errorHandler.getError(response)

    assertTrue(error is ErrorEntity.Unknown)
    assertEquals(json, (error as ErrorEntity.Unknown).message)
  }
}
