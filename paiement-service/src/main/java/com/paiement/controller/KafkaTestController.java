package com.paiement.controller;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import com.paiement.dto.KafkaEventDto;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class KafkaTestController {
    
    // Injection du KafkaTemplate
    private final KafkaTemplate<String, KafkaEventDto> kafkaTemplate;
    
  
    public KafkaTestController(KafkaTemplate<String, KafkaEventDto> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        log.info("✅ KafkaTemplate injecté avec succès !");
    }
    
    @PostMapping("/send")
    public String sendMessage(@RequestParam String message) {
        try {
            log.info("🚀 Envoi du message: {}", message);
            // kafkaTemplate.send("paiement-topic", message);
            log.info("✅ Message envoyé avec succès!");
            return "Message envoyé: " + message;
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi: {}", e.getMessage(), e);
            return "Erreur: " + e.getMessage();
        }
    }
    
    @GetMapping("/health")
    public String health() {
        return "Kafka Test Controller is running. KafkaTemplate: " + 
               (kafkaTemplate != null ? "OK" : "NULL");
    }
}