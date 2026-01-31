package com.paiement.controller;

import lombok.RequiredArgsConstructor;

import org.apache.commons.logging.Log;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.paiement.Entity.*;
import com.paiement.Enumuration.PAIEMENTSTATUS;
import com.paiement.Repository.PaiementRepos;
import com.paiement.dto.StripeResponse;
import com.paiement.dto.SuccessEditeDto;
import com.paiement.dto.UpdateStatusRequest;
import com.paiement.services.PaiementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/upgrad")
@RequiredArgsConstructor
public class PaiementController {
    
    private final PaiementRepos paiementRepository;
    private final PaiementService paiementService;
    private static final Logger log = LoggerFactory.getLogger(PaiementController.class);


    @GetMapping("/history")
    public ResponseEntity<List<PaiementEntity>> getPaymentHistory() {
       log.info("HISTORY PAIEMENT :: CONTROLLER");
        return ResponseEntity.ok(paiementRepository.findAll());
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<StripeResponse> createCheckout(@RequestBody PaiementEntity paiement) {
        return ResponseEntity.ok(paiementService.checkout(paiement));
    }

    @PatchMapping("/edite/status/{id}")
    public ResponseEntity<SuccessEditeDto> editePaiementStatus(@PathVariable String id, @RequestBody UpdateStatusRequest  status){
        
        return  ResponseEntity.ok(paiementService.editeStatus(id, status.getStatus()));
    } 
}