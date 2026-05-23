package com.katui.controller;

import com.katui.entity.Alarme;
import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;
import com.katui.service.AlarmeService;
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
    private final AlarmeService alarmeService;

    @PostMapping
    public Medicamento salvar(
            @RequestBody Medicamento medicamento,
            @RequestParam(value = "gerarAlarmes", defaultValue = "false") boolean gerarAlarmes,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        medicamento.setUsuario(usuario);
        Medicamento salvo = service.salvar(medicamento);

        if (gerarAlarmes) {
            alarmeService.gerarAlarmes(salvo, usuario);
        }

        return salvo;
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
            @RequestParam(value = "gerarAlarmes", defaultValue = "false") boolean gerarAlarmes,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        Medicamento atualizado = service.atualizar(id, medicamento, usuario);

        if (Boolean.FALSE.equals(atualizado.getAtivo())) {
            alarmeService.deletarPorMedicamento(atualizado);
        } else if (gerarAlarmes) {
            alarmeService.gerarAlarmes(atualizado, usuario);
        }

        return atualizado;
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

        Medicamento medicamento = service.buscar(id, usuario);
        alarmeService.deletarPorMedicamento(medicamento);
        service.deletar(id, usuario);
    }

    @PostMapping("/{id}/alarmes")
    public List<Alarme> gerarAlarmes(
            @PathVariable Long id,
            @RequestParam(value = "pacienteId", required = false) Long pacienteId,
            Authentication authentication
    ) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        if (pacienteId != null) {
            usuario = cuidadorService.verificarAcesso(usuario, pacienteId);
        }

        Medicamento medicamento = service.buscar(id, usuario);
        return alarmeService.gerarAlarmes(medicamento, usuario);
    }
}