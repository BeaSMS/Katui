package com.katui.service;

import com.katui.entity.Medicamento;
import com.katui.repository.MedicamentoRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class MedicamentoService {

    private final MedicamentoRepository repository;

    // Salvar medicamento
    public Medicamento salvar(Medicamento medicamento) {

        return repository.save(medicamento);
    }

    // Listar todos os medicamentos
    public List<Medicamento> listar() {

        return repository.findAll();
    }

    // Buscar medicamento por ID
    public Medicamento buscar(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Medicamento não encontrado"));
    }

    // Atualizar medicamento
    public Medicamento atualizar(
            Long id,
            Medicamento medicamento
    ) {

        Medicamento existente = buscar(id);

        existente.setNome(medicamento.getNome());
        existente.setHorario(medicamento.getHorario());
        existente.setTipoFrequencia(
                medicamento.getTipoFrequencia()
        );
        existente.setValorFrequencia(
                medicamento.getValorFrequencia()
        );

        return repository.save(existente);
    }

    // Deletar medicamento
    public void deletar(Long id) {

        repository.deleteById(id);
    }
}