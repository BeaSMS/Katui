package com.katui.controller;

import com.katui.entity.Exame;
import com.katui.entity.Usuario;
import com.katui.service.CuidadorService;
import com.katui.service.ExameService;

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
@RequestMapping("/exames")
@RequiredArgsConstructor

public class ExameController {

    private final ExameService service;
    private final CuidadorService cuidadorService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Exame salvar(
            @RequestParam("nome") String nome,
            @RequestParam("observacao") String observacao,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) throws IOException {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.salvar(nome, observacao, arquivo, usuario);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Exame atualizar(
            @PathVariable Long id,
            @RequestParam("nome") String nome,
            @RequestParam("observacao") String observacao,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) throws IOException {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.atualizar(id, nome, observacao, arquivo, usuario);
    }

    @GetMapping
    public List<Exame> listar(
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
    public Exame buscar(
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

        Exame exame = service.buscar(id, usuario);

        Path caminho = Paths.get(exame.getArquivo());
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