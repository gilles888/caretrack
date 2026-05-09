package com.caretrack.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "protocoles_traitement")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProtocoleTraitement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String nom;

    private String description;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Column(nullable = false)
    private boolean actif = true;
}
