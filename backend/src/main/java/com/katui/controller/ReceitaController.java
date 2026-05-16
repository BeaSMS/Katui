package com.katui.controller;

import com.katui.dto.ReceitaProcessadaDTO.MedicamentoExtratoDTO;
import com.katui.entity.Receita;
import com.katui.entity.Usuario;
import com.katui.service.CuidadorService;
import com.katui.service.ReceitaService;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/receitas")
@RequiredArgsConstructor

public class ReceitaController {

    private final ReceitaService service;
    private final CuidadorService cuidadorService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Receita salvar(
            @RequestParam("observacao") String observacao,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) throws IOException {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.salvar(observacao, arquivo, usuario);
    }

    @PostMapping("/{id}/processar")
    public List<MedicamentoExtratoDTO> processar(
            @PathVariable Long id,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.processar(id, usuario);
    }

    @GetMapping
    public List<Receita> listar(
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.listar(usuario);
    }

    @GetMapping("/{id}")
    public Receita buscar(
            @PathVariable Long id,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.buscar(id, usuario);
    }

    @DeleteMapping("/{id}")
    public void deletar(
            @PathVariable Long id,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        service.deletar(id, usuario);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) throws IOException {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        Receita receita = service.buscar(id, usuario);

        Path caminho = Paths.get(receita.getImagem());
        Resource resource = new UrlResource(caminho.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("Arquivo não encontrado");
        }

        String contentType = Files.probeContentType(caminho);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\""
                )
                .body(resource);
    }
}