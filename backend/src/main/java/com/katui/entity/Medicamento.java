package com.katui.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String horario; // horário inicial ex: "08:00"

    private String tipoFrequencia; // INTERVALO_HORAS, VEZES_DIA, DIAS_ESPECIFICOS

    private Integer valorFrequencia; // 8 para "a cada 8h", 3 para "3x ao dia"

    private Integer dias; // duração do tratamento em dias

    @ElementCollection
    private List<Integer> diasSemana; // só para DIAS_ESPECIFICOS: [1,5] = Segunda e Sexta

    // NOVOS CAMPOS

    private String finalidade; // ex: gripe, acne, dor, pressão alta

    private String dosagem; // ex: 500mg, 1 comprimido, 10 gotas

    private LocalDate dataInicio;

    private LocalDate dataFim;

    private String observacoes; // ex: tomar após refeição

    private Boolean ativo = true;

    @ManyToOne
    private Usuario usuario;
}