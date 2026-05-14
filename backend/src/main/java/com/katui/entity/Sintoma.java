package com.katui.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Sintoma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;

    private String categoria;

    private String intensidade;

    private String tipo;

    private LocalDateTime data;

    @ManyToOne
    private Usuario usuario;
}