package com.katui.controller;

import com.katui.entity.Sintoma;
import com.katui.service.SintomaService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sintomas")
@RequiredArgsConstructor

public class SintomaController {

    private final SintomaService service;

    @PostMapping
    public Sintoma salvar(
            @RequestBody Sintoma sintoma
    ) {

        return service.salvar(sintoma);
    }

    @GetMapping
    public List<Sintoma> listar() {

        return service.listar();
    }

    @GetMapping("/{id}")
    public Sintoma buscar(@PathVariable Long id) {

        return service.buscar(id);
    }

    @PutMapping("/{id}")
    public Sintoma atualizar(
            @PathVariable Long id,
            @RequestBody Sintoma sintoma
    ) {

        return service.atualizar(id, sintoma);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {

        service.deletar(id);
    }
}
