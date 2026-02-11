package com.paiement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.paiement.services.PaiementService;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;

@RestController
@RequestMapping("/webhook")
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @Autowired
    private PaiementService paiementService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook( @RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader){

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error");
        }

        //EVENT SUCCESS
        if ("payment_intent.succeeded".equals(event.getType())) {

            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = dataObjectDeserializer.getObject().orElse(null);

            if (stripeObject instanceof PaymentIntent) {
                PaymentIntent intent = (PaymentIntent) stripeObject;

                paiementService.handleSuccessfulPayment(intent);
            }
        }

        return ResponseEntity.ok("Webhook received");
    }
}
