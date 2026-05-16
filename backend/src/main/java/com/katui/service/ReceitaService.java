package com.katui.service;

import com.katui.dto.ReceitaProcessadaDTO.MedicamentoExtratoDTO;
import com.katui.entity.Receita;
import com.katui.entity.Usuario;
import com.katui.repository.ReceitaRepository;

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

public class ReceitaService {

    private final ReceitaRepository repository;
    private final OCRService ocrService;

    public Receita salvar(
            String observacao,
            MultipartFile arquivo,
            Usuario usuario
    ) throws IOException {

        String pasta = "uploads/receitas/";
        new File(pasta).mkdirs();

        String nomeArquivo = UUID.randomUUID() + "_" + arquivo.getOriginalFilename();
        Path caminho = Paths.get(pasta + nomeArquivo);
        Files.write(caminho, arquivo.getBytes());

        Receita receita = new Receita();
        receita.setObservacao(observacao);
        receita.setImagem(caminho.toString());
        receita.setUsuario(usuario);

        return repository.save(receita);
    }

    public List<MedicamentoExtratoDTO> processar(Long id, Usuario usuario) {
        Receita receita = buscar(id, usuario);
        Path caminho = Paths.get(receita.getImagem());
        return ocrService.extrairMedicamentos(caminho);
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