package com.katui.controller;

import com.katui.entity.Exame;
import  com.katui.service.ExameService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exames")
@RequiredArgsConstructor

public class ExameController {

    private final ExameService service;

    @PostMapping
    public Exame salvar(
            @RequestBody Exame exame
    ) {

        return service.salvar(exame);
    }

    @GetMapping
    public List<Exame> listar() {

        return service.listar();
    }

    @GetMapping("/{id}")
    public Exame buscar(@PathVariable Long id) {

        return service.buscar(id);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {

        service.deletar(id);
    }
}
