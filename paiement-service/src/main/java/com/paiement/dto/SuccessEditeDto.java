package com.paiement.dto;

import java.util.Optional;

import com.paiement.Entity.PaiementEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@AllArgsConstructor
@Builder
public class SuccessEditeDto {
    private String message;
    private String error;
    private boolean status;
    private PaiementEntity paiementData;
}
