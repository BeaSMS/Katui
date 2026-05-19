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

    // Onde está o sintoma no corpo (lado, profundidade, se espalha)
    private String localizacao;

    // Como o sintoma se manifesta (latejante, queimação, pressão, etc)
    private String qualidade;

    // Quão forte está (0 a 10)
    private Integer intensidadeEscala;

    // Ajuda na triagem de urgência
    private Boolean incapacitante;

    // Quando começa, quanto dura, contínuo ou em episódios
    private String padraoTempo;

    // O que piora ou melhora o sintoma
    private String fatoresAssociados;

    // Como afeta o dia a dia (ex: não consegue levantar, não consegue focar)
    private String impactoFuncional;

    // Data e hora em que o sintoma foi registrado/sentido
    private LocalDateTime dataHoraRegistro;

    @ManyToOne
    private Usuario usuario;
}