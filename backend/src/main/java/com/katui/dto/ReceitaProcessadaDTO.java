package com.katui.dto;

import com.katui.entity.Receita;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReceitaProcessadaDTO {

    private Receita receita;
    private List<MedicamentoExtratoDTO> medicamentos;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MedicamentoExtratoDTO {
        private String nome;
        private String dias;
        private String periodo;
    }
}