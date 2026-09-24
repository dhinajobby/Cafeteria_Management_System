package com.cafeteria.exception;
import com.cafeteria.dto.response.ErrorResponse; import jakarta.servlet.http.HttpServletRequest; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.time.LocalDateTime;
@RestControllerAdvice public class GlobalExceptionHandler{
 @ExceptionHandler({CategoryNotFoundException.class,ItemNotFoundException.class,OrderNotFoundException.class}) ResponseEntity<ErrorResponse> notFound(RuntimeException e,HttpServletRequest r){return build(HttpStatus.NOT_FOUND,e,r);}
 @ExceptionHandler({InvalidOperationException.class,InvalidQuantityException.class,ItemUnavailableException.class,InsufficientStockException.class}) ResponseEntity<ErrorResponse> bad(RuntimeException e,HttpServletRequest r){return build(HttpStatus.BAD_REQUEST,e,r);}
 @ExceptionHandler(Exception.class) ResponseEntity<ErrorResponse> generic(Exception e,HttpServletRequest r){return build(HttpStatus.INTERNAL_SERVER_ERROR,e,r);}
 private ResponseEntity<ErrorResponse> build(HttpStatus s,Exception e,HttpServletRequest r){return ResponseEntity.status(s).body(new ErrorResponse(LocalDateTime.now(),s.value(),s.getReasonPhrase(),e.getMessage(),r.getRequestURI()));}
}
