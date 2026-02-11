package com.paiement.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.paiement.Entity.*;

import com.paiement.Repository.PaiementRepos;

import com.paiement.dto.StripeResponse;

import com.paiement.services.PaiementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;


@RestController
@RequestMapping("/upgrad")
@RequiredArgsConstructor
public class PaiementController {
    
    private final PaiementRepos paiementRepository;
    private final PaiementService paiementService;
    private static final Logger log = LoggerFactory.getLogger(PaiementController.class);


    @GetMapping("/history/{clientId}")
    public ResponseEntity<List<PaiementEntity>> getPaymentHistory(@PathVariable String clientId) {
        log.info("📋 HISTORY PAIEMENT pour clientId: {}", clientId);
        log.info("HISTORY PAIEMENT :: CONTROLLER");
        List<PaiementEntity> historique = paiementRepository.findByClientId(clientId);
        if(historique.isEmpty()){
            log.warn("❌ Aucun paiement trouvé pour clientId: {}", clientId);
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(historique);
    }

    @PostMapping("/checkout")
    public ResponseEntity<StripeResponse> createCheckout(@RequestBody PaiementEntity paiement) {
        return ResponseEntity.ok(paiementService.checkout(paiement));
    }


    
 
}
