package com.katui.controller;

import com.katui.entity.Sintoma;
import com.katui.entity.Usuario;
import com.katui.service.SintomaService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sintomas")
@RequiredArgsConstructor

public class SintomaController {

    private final SintomaService service;

    @PostMapping
    public Sintoma salvar(
            @RequestBody Sintoma sintoma,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.salvar(sintoma, usuario);
    }

    @GetMapping
    public List<Sintoma> listar(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.listar(usuario);
    }

    @GetMapping("/{id}")
    public Sintoma buscar(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.buscar(id, usuario);
    }

    @PutMapping("/{id}")
    public Sintoma atualizar(
            @PathVariable Long id,
            @RequestBody Sintoma sintoma,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.atualizar(id, sintoma, usuario);
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
