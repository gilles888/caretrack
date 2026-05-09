package com.caretrack.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "diseases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Disease {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;       // ex: CANCER, SEP, IC, DIABETE, IBD

    @Column(nullable = false)
    private String nom;

    private String description;
}
