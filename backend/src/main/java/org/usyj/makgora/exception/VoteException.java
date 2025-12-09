package org.usyj.makgora.exception;

import lombok.Getter;

@Getter
public class VoteException extends RuntimeException {

    private final String code;
    private final String message;

    public VoteException(String code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
