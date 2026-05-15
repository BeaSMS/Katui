package com.katui.controller;

import com.katui.entity.Exame;
import com.katui.entity.Usuario;
import  com.katui.service.ExameService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/exames")
@RequiredArgsConstructor

public class ExameController {

    private final ExameService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Exame salvar(
            @RequestParam("nome") String nome,
            @RequestParam("observacao") String observacao,
            @RequestParam("arquivo") MultipartFile arquivo,
            Authentication authentication
    ) throws IOException {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.salvar(nome, observacao, arquivo, usuario);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Exame atualizar(
            @PathVariable Long id,
            @RequestParam("nome") String nome,
            @RequestParam("observacao") String observacao,
            @RequestParam("arquivo") MultipartFile arquivo,
            Authentication authentication
    ) throws IOException {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.atualizar(id, nome, observacao, arquivo, usuario);
    }
    @GetMapping
    public List<Exame> listar(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.listar(usuario);
    }

    @GetMapping("/{id}")
    public Exame buscar(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.buscar(id, usuario);
    }

    @DeleteMapping("/{id}")
    public void deletar(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        service.deletar(id, usuario);
    }
}
