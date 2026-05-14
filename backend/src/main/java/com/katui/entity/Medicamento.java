package com.katui.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private String horario;

    private String tipoFrequencia;

    private Integer valorFrequencia;

    @ManyToOne
     private Usuario usuario;

}
