package org.usyj.makgora.global.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class VoteExceptionHandler {

    @ExceptionHandler(VoteException.class)
    public ResponseEntity<?> handleVoteException(VoteException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("errorCode", ex.getCode());
        body.put("message", ex.getMessage());

        return ResponseEntity.badRequest().body(body);
    }
}