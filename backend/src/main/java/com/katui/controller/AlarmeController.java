package com.katui.controller;

import com.katui.entity.Alarme;
import com.katui.entity.Usuario;
import com.katui.service.AlarmeService;
import com.katui.service.CuidadorService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alarmes")
@RequiredArgsConstructor
public class AlarmeController {

    private final AlarmeService service;
    private final CuidadorService cuidadorService;

    @GetMapping
    public List<Alarme> listar(
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
    public Alarme buscar(
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
    public Alarme atualizar(
            @PathVariable Long id,
            @RequestBody Alarme alarme,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.atualizar(id, alarme, usuario);
    }

    @PatchMapping("/{id}/tomado")
    public Alarme marcarTomado(
            @PathVariable Long id,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.marcarTomado(id, usuario);
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
    
    @PostMapping("/lembrete")
    public Alarme criarLembrete(
            @RequestBody Alarme alarme,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        return service.criarLembrete(alarme, usuario);
    }
}
