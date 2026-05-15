package com.katui.controller;

import com.katui.entity.Usuario;
import com.katui.service.CuidadorService;
import com.katui.service.UsuarioService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor

public class UsuarioController {

    private final UsuarioService service;
    private final CuidadorService cuidadorService;

    @GetMapping("/me")
    public Usuario me(Authentication authentication) {
        return (Usuario) authentication.getPrincipal();
    }

    @PutMapping("/me")
    public Usuario atualizarMe(
            @RequestBody Usuario usuario,
            Authentication authentication
    ) {
        Usuario logado = (Usuario) authentication.getPrincipal();
        return service.atualizar(logado.getId(), usuario);
    }

    @DeleteMapping("/me")
    public void deletarMe(Authentication authentication) {
        Usuario logado = (Usuario) authentication.getPrincipal();
        service.deletar(logado.getId());
    }

    // =========================
    // CUIDADOR
    // =========================

    @PostMapping("/me/pacientes")
    public void adicionarPaciente(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        Usuario cuidador = (Usuario) authentication.getPrincipal();
        cuidadorService.adicionarPaciente(cuidador, body.get("email"));
    }

    @GetMapping("/me/pacientes")
    public List<Usuario> listarPacientes(Authentication authentication) {
        Usuario cuidador = (Usuario) authentication.getPrincipal();
        return cuidadorService.listarPacientes(cuidador);
    }

    @DeleteMapping("/me/pacientes/{pacienteId}")
    public void removerPaciente(
            @PathVariable Long pacienteId,
            Authentication authentication
    ) {
        Usuario cuidador = (Usuario) authentication.getPrincipal();
        cuidadorService.removerPaciente(cuidador, pacienteId);
    }

    // =========================
    // ADMIN (opcional)
    // =========================

    @GetMapping
    public List<Usuario> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Usuario buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}