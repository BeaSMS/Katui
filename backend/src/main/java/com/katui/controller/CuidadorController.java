package com.katui.controller;

import com.katui.entity.Usuario;
import com.katui.service.CuidadorService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cuidador")
@RequiredArgsConstructor
public class CuidadorController {

    private final CuidadorService cuidadorService;

    @PostMapping("/pacientes")
    public void adicionarPaciente(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        Usuario cuidador = (Usuario) authentication.getPrincipal();
        cuidadorService.adicionarPaciente(cuidador, body.get("email"));
    }

    @GetMapping("/pacientes")
    public List<Usuario> listarPacientes(Authentication authentication) {
        Usuario cuidador = (Usuario) authentication.getPrincipal();
        return cuidadorService.listarPacientes(cuidador);
    }

    @DeleteMapping("/pacientes/{pacienteId}")
    public void removerPaciente(
            @PathVariable Long pacienteId,
            Authentication authentication
    ) {
        Usuario cuidador = (Usuario) authentication.getPrincipal();
        cuidadorService.removerPaciente(cuidador, pacienteId);
    }
}