package com.katui.service;

import com.katui.entity.Receita;
import com.katui.entity.Usuario;
import com.katui.repository.ReceitaRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class ReceitaService {

    private final ReceitaRepository repository;

    public Receita salvar(Receita receita, Usuario usuario) {
        receita.setUsuario(usuario);
        return repository.save(receita);
    }

    public List<Receita> listar(Usuario usuario) {
        return repository.findByUsuario(usuario);
    }

    public Receita buscar(Long id, Usuario usuario) {
        Receita receita = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receita não encontrada"));

        if (!receita.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return receita;
    }

    public void deletar(Long id, Usuario usuario) {
        buscar(id, usuario);
        repository.deleteById(id);
    }
}