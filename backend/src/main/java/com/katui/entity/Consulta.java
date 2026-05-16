package com.katui.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String medico;

    private String especialidade;

    private String local;

    private LocalDateTime dataHora;

    private String observacao;

    @ManyToOne
    private Usuario usuario;
}