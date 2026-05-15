package com.katui.controller;

import com.katui.entity.Receita;
import com.katui.entity.Usuario;
import com.katui.service.OCRService;
import com.katui.service.ReceitaService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/receitas")
@RequiredArgsConstructor

public class ReceitaController {

    private final ReceitaService service;

    private final OCRService ocrService;

    @PostMapping
    public Receita salvar(
            @RequestBody Receita receita,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.salvar(receita, usuario);
    }

    @GetMapping
    public List<Receita> listar(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.listar(usuario);
    }

    @GetMapping("/{id}")
    public Receita buscar(
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
