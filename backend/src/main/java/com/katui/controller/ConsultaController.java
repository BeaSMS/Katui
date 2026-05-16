package com.katui.controller;

import com.katui.entity.Consulta;
import com.katui.entity.Usuario;
import com.katui.service.ConsultaService;
import com.katui.service.CuidadorService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultas")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaService service;
    private final CuidadorService cuidadorService;

    @PostMapping
    public Consulta salvar(
            @RequestBody Consulta consulta,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.salvar(consulta, usuario);
    }

    @GetMapping
    public List<Consulta> listar(
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
    public Consulta buscar(
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

    @PutMapping("/{id}")
    public Consulta atualizar(
            @PathVariable Long id,
            @RequestBody Consulta consulta,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.atualizar(id, consulta, usuario);
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
}