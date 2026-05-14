package com.katui.service;

import com.katui.entity.Sintoma;
import com.katui.repository.SintomaRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class SintomaService {

    private final SintomaRepository repository;

    // Salvar sintoma
    public Sintoma salvar(Sintoma sintoma) {

        return repository.save(sintoma);
    }

    // Listar todos os sintomas
    public List<Sintoma> listar() {

        return repository.findAll();
    }

    // Buscar sintoma por ID
    public Sintoma buscar(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Sintoma não encontrado"));
    }

    // Atualizar sintoma
    public Sintoma atualizar(Long id, Sintoma sintoma) {

        Sintoma existente = buscar(id);

        existente.setDescricao(sintoma.getDescricao());
        existente.setCategoria(sintoma.getCategoria());
        existente.setIntensidade(sintoma.getIntensidade());
        existente.setTipo(sintoma.getTipo());
        existente.setData(sintoma.getData());

        return repository.save(existente);
    }

    // Deletar sintoma
    public void deletar(Long id) {

        repository.deleteById(id);
    }
}