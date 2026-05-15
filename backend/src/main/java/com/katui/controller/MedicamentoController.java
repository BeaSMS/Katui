package com.katui.controller;

import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;
import com.katui.service.CuidadorService;
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
    private final CuidadorService cuidadorService;

    @PostMapping
    public Medicamento salvar(
            @RequestBody Medicamento medicamento,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        medicamento.setUsuario(usuario);
        return service.salvar(medicamento);
    }

    @GetMapping
    public List<Medicamento> listar(
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
    public Medicamento buscar(
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
    public Medicamento atualizar(
            @PathVariable Long id,
            @RequestBody Medicamento medicamento,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.atualizar(id, medicamento, usuario);
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