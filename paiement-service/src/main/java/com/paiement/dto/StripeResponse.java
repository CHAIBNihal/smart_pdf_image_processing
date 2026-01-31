package com.paiement.dto;

import com.paiement.Entity.PaiementEntity;
import com.paiement.Enumuration.PAIEMENTSTATUS;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StripeResponse {
    private PAIEMENTSTATUS status;
    private String clientSecret;
    private PaiementEntity paiementData;
    private String message; 
    
}
