package com.katui.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Alarme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime horario;

    private String titulo;

    private Boolean tomado;

    @ManyToOne
    private Medicamento medicamento;

    @ManyToOne
    private Usuario usuario;
}