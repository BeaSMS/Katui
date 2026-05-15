package com.katui.service;

import com.katui.entity.Exame;
import com.katui.entity.Usuario;
import com.katui.repository.ExameRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class ExameService {

    private final ExameRepository repository;

    public Exame salvar(
            String nome,
            String observacao,
            MultipartFile arquivo,
            Usuario usuario
    ) throws IOException {

        String pasta = "uploads/exames/";
        new File(pasta).mkdirs();

        String nomeArquivo = UUID.randomUUID() + "_" + arquivo.getOriginalFilename();
        Path caminho = Paths.get(pasta + nomeArquivo);
        Files.write(caminho, arquivo.getBytes());

        Exame exame = new Exame();
        exame.setNome(nome);
        exame.setObservacao(observacao);
        exame.setArquivo(caminho.toString());
        exame.setUsuario(usuario);

        return repository.save(exame);
    }
    public Exame atualizar(
            Long id,
            String nome,
            String observacao,
            MultipartFile arquivo,
            Usuario usuario
    ) throws IOException {

        Exame existente = buscar(id, usuario);

        String pasta = "uploads/exames/";
        new File(pasta).mkdirs();

        String nomeArquivo = UUID.randomUUID() + "_" + arquivo.getOriginalFilename();
        Path caminho = Paths.get(pasta + nomeArquivo);
        Files.write(caminho, arquivo.getBytes());

        existente.setNome(nome);
        existente.setObservacao(observacao);
        existente.setArquivo(caminho.toString());

        return repository.save(existente);
    }
    public List<Exame> listar(Usuario usuario) {
        return repository.findByUsuario(usuario);
    }

    public Exame buscar(Long id, Usuario usuario) {
        Exame exame = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exame não encontrado"));

        if (!exame.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return exame;
    }

    public void deletar(Long id, Usuario usuario) {
        buscar(id, usuario);
        repository.deleteById(id);
    }
}