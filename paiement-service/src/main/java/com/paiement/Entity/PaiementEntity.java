package com.paiement.Entity;


import java.time.LocalDate;


import org.hibernate.annotations.GenericGenerator;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

import com.paiement.Enumuration.PAIEMENTSTATUS;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;

import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@EntityScan("com.paiement.Entity")
@Table(name="Paiement")
public class PaiementEntity {
   

    @Id
@GeneratedValue(generator = "uuid2")
@GenericGenerator(name = "uuid2", strategy = "uuid2")
@Column(length = 36, nullable = false, updatable = false)
private String id;

    @Column(name = "clientId", nullable = false)
    private String clientId;

    @Column(name="amount", nullable = false)
    private Double amount;

    @Column(name="start_date")
    private LocalDate start_date;

    @Column(name="end_date")
    private LocalDate end_date;

    
    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable = false)
 
    private PAIEMENTSTATUS status = PAIEMENTSTATUS.PENDING;

    // ===========Constructur with params ========
    public PaiementEntity(String clientId,Double amount, LocalDate start_date, LocalDate end_date ){
        this.clientId=clientId;
        this.amount= amount;
        this.status = status != null ? status : PAIEMENTSTATUS.PENDING;
        this.start_date=start_date;
        this.end_date=end_date;
    }


    // ================Getter and setter ====================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getStart_date() {
        return start_date;
    }

    public void setStart_date(LocalDate start_date) {
        this.start_date = start_date;
    }

    public LocalDate getEnd_date() {
        return end_date;
    }

    public void setEnd_date(LocalDate end_date) {
        this.end_date = end_date;
    }


    public PAIEMENTSTATUS getStatus() {
        return status;
    }


    public void setStatus(PAIEMENTSTATUS status) {
        this.status = status;
    }
    
    

}
