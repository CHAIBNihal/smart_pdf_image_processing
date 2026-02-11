package com.paiement.services;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.paiement.Entity.*;
import com.paiement.dto.KafkaEventDto;

import com.paiement.dto.StripeResponse;
import com.paiement.Enumuration.PAIEMENTSTATUS;
import com.paiement.Repository.PaiementRepos;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
// import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
// import com.stripe.param.checkout.SessionCreateParams;

// import lombok.AllArgsConstructor;
// import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor

@Slf4j
public class PaiementService {

    @Value("${stripe.secretKey}")
    private String secretKey;

    @Value("${stripe.successUrl}")
    private String successUrl;

    @Value("${stripe.cancelUrl}")
    private String cancelUrl;
    @Autowired
    private PaiementRepos paiementRepos;
    private final KafkaTemplate<String, KafkaEventDto> kafkaTemplate;


    // Create Stripe paiement session :
    public StripeResponse checkout(PaiementEntity paiement) {
        if(secretKey == null){
            log.info("No Secret Stripe key is found");
        }
        Stripe.apiKey = secretKey;
        log.info("Secrey Key is ======>" + secretKey);
        if (paiement.getAmount() < 200) {
            return StripeResponse.builder()
                    .status(PAIEMENTSTATUS.FAILED)
                    .message("Montant insuffisant ! Minimum 200")
                    .build();
        }

        long amountInCents = Math.round(paiement.getAmount() * 100);

        try {
            // Save paiement
            PaiementEntity savedPaiement = paiementRepos.save(paiement);

            // Create PaymentIntent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .addPaymentMethodType("card")
                    .putMetadata("paiementId", savedPaiement.getId().toString())
                    .putMetadata("clientId", savedPaiement.getClientId())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            // Return clientSecret ==> (clé pour React)
            return StripeResponse.builder()
                    .status(PAIEMENTSTATUS.SUCCESS)
                    .message("PaymentIntent créé avec succès")
                    .clientSecret(intent.getClientSecret())
                    .paiementData(savedPaiement)
                    .build();
        } catch (StripeException e) {
            return StripeResponse.builder()
                    .status(PAIEMENTSTATUS.FAILED)
                    .message("Erreur Stripe : " + e.getMessage())
                    .build();
        }
    }




public void handleSuccessfulPayment(PaymentIntent intent) {

    String paiementId = intent.getMetadata().get("paiementId");
    String clientId = intent.getMetadata().get("clientId");

    PaiementEntity paiement = paiementRepos.findById(paiementId).orElse(null);

    if (paiement == null) {
        log.error("Paiement introuvable pour ID {",  paiementId, "}");
        return;
    }
    
    LocalDate start = LocalDate.now(); 
    LocalDate end = start.plusDays(30);
    paiement.setStatus(PAIEMENTSTATUS.SUCCESS);
    paiementRepos.save(paiement);

    // EVENT KAFKA POUR AUTH SERVICE
    KafkaEventDto event = KafkaEventDto.builder()
            .eventMessage("SUCCESS")
            .clientId(clientId)
            .paiementId(paiementId)
            .start_date(start.toString())
            .end_date(end.toString())
            .amount(paiement.getAmount())
            .build();

    log.info("📤 Envoi SUCCESS vers Kafka pour client {}", clientId);
    kafkaTemplate.send("paiement-topic", event);
}


}