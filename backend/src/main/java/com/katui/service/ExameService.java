package com.katui.service;

import com.katui.entity.Exame;
import com.katui.repository.ExameRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class ExameService {

    private final ExameRepository repository;

    // Salvar exame
    public Exame salvar(Exame exame) {

        return repository.save(exame);
    }

    // Listar todos os exames
    public List<Exame> listar() {

        return repository.findAll();
    }

    // Buscar exame por ID
    public Exame buscar(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Exame não encontrado"));
    }

    // Atualizar exame
    public Exame atualizar(Long id, Exame exame) {

        Exame existente = buscar(id);

        existente.setNome(exame.getNome());
        existente.setArquivo(exame.getArquivo());
        existente.setObservacao(exame.getObservacao());

        return repository.save(existente);
    }

    // Deletar exame
    public void deletar(Long id) {

        repository.deleteById(id);
    }
}