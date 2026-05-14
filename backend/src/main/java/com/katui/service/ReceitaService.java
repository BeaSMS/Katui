package com.katui.service;

import com.katui.entity.Receita;
import com.katui.repository.ReceitaRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class ReceitaService {

    private final ReceitaRepository repository;

    // Salvar receita
    public Receita salvar(Receita receita) {

        return repository.save(receita);
    }

    // Listar todas as receitas
    public List<Receita> listar() {

        return repository.findAll();
    }

    // Buscar receita por ID
    public Receita buscar(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Receita não encontrada"));
    }

    // Atualizar receita
    public Receita atualizar(Long id, Receita receita) {

        Receita existente = buscar(id);

        existente.setObservacao(receita.getObservacao());
        existente.setImagem(receita.getImagem());

        return repository.save(existente);
    }

    // Deletar receita
    public void deletar(Long id) {

        repository.deleteById(id);
    }
}