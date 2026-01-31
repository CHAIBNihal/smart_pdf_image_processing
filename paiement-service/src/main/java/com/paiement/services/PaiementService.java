package com.paiement.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.paiement.Entity.*;
import com.paiement.dto.StripeResponse;
import com.paiement.dto.SuccessEditeDto;
import com.paiement.Enumuration.PAIEMENTSTATUS;
import com.paiement.Repository.PaiementRepos;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
// import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
// import com.stripe.param.checkout.SessionCreateParams;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Service
@NoArgsConstructor
@AllArgsConstructor
public class PaiementService {

    @Value("${stripe.secretKey}")
    private String secretKey;

    @Value("${stripe.successUrl}")
    private String successUrl;

    @Value("${stripe.cancelUrl}")
    private String cancelUrl;
    @Autowired
    private PaiementRepos paiementRepos;

    public StripeResponse checkout(PaiementEntity paiement) {

        Stripe.apiKey = secretKey;

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
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods
                                    .builder()
                                    .setEnabled(true)
                                    .build())
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

    public SuccessEditeDto editeStatus(String id, PAIEMENTSTATUS status) {
        try {
            if (id == null) {
                return SuccessEditeDto.builder()
                        .status(false)
                        .paiementData(null)
                        .error("Id is required")
                        .message("Erreur en récupération des données")
                        .build();

            }
            System.out.println("id est " + id);

            PaiementEntity paiement = null;
        try {
            paiement = paiementRepos.findById(id).orElse(null);
            System.out.println("Recherche terminée" + paiement);
        } catch (Exception e) {
            System.err.println("Erreur lors de findById: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
            System.out.println("is est trouvable");
            if (paiement == null) {
                return SuccessEditeDto.builder()
                        .status(false)
                        .paiementData(null)
                        .error("Payement est Introuvable!")
                        .build();
            }
            System.out.println("Paiement founded===>" + paiement);
            paiement.setStatus(status);

            // Save changes
            PaiementEntity updatedPaiement = paiementRepos.save(paiement);
            System.out.println("Updated paiement: " + updatedPaiement);

            return SuccessEditeDto.builder()
                    .message("status est changer par success!")
                    .paiementData(updatedPaiement)
                    .status(true)
                    .build();
        } catch (Exception e) {
            return SuccessEditeDto.builder()
                    .message("Erreur: " + e.getMessage())
                    .status(false)
                    .build();
        }
    }
}