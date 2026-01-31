package com.paiement.dto;

import com.paiement.Enumuration.PAIEMENTSTATUS;

public class UpdateStatusRequest {
    private PAIEMENTSTATUS status;

    public PAIEMENTSTATUS getStatus() {
        return status;
    }

    public void setStatus(PAIEMENTSTATUS status) {
        this.status = status;
    }
}
