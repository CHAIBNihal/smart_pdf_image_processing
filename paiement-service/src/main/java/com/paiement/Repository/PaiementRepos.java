package com.paiement.Repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.paiement.Entity.PaiementEntity;

@Repository
public interface PaiementRepos extends JpaRepository<PaiementEntity, String>{
    //========= ici on va metter tous les actions (tags actions) qui vont manipuler la table Paiement en Base de données ==================
    

    
}
