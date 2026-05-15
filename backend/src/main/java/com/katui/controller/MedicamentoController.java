package com.katui.controller;

import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;
import com.katui.service.MedicamentoService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@RequiredArgsConstructor

public class MedicamentoController {

    private final MedicamentoService service;

    @PostMapping
    public Medicamento salvar(
            @RequestBody Medicamento medicamento,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        medicamento.setUsuario(usuario);
        return service.salvar(medicamento);
    }

    @GetMapping
    public List<Medicamento> listar(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.listar(usuario);
    }

    @GetMapping("/{id}")
    public Medicamento buscar(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.buscar(id, usuario);
    }

    @PutMapping("/{id}")
    public Medicamento atualizar(
            @PathVariable Long id,
            @RequestBody Medicamento medicamento,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return service.atualizar(id, medicamento, usuario);
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
