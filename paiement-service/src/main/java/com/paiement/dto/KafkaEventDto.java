package com.paiement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class KafkaEventDto {
    public  String eventMessage;
    public String paiementId;
    public  String clientId;
    public  Double amount;
    public  String start_date;
    public  String end_date;

}
