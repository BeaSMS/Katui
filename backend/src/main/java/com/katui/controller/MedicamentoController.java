package com.katui.controller;

import com.katui.entity.Medicamento;
import com.katui.service.MedicamentoService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@RequiredArgsConstructor

public class MedicamentoController {

    private final MedicamentoService service;

    @PostMapping
    public Medicamento salvar(
            @RequestBody Medicamento medicamento
    ) {

        return service.salvar(medicamento);
    }

    @GetMapping
    public List<Medicamento> listar() {

        return service.listar();
    }

    @GetMapping("/{id}")
    public Medicamento buscar(@PathVariable Long id) {

        return service.buscar(id);
    }

    @PutMapping("/{id}")
    public Medicamento atualizar(
            @PathVariable Long id,
            @RequestBody Medicamento medicamento
    ) {

        return service.atualizar(id, medicamento);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {

        service.deletar(id);
    }
}
