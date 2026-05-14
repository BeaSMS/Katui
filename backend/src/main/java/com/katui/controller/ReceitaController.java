package com.katui.controller;

import com.katui.entity.Receita;
import com.katui.service.OCRService;
import com.katui.service.ReceitaService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/receitas")
@RequiredArgsConstructor

public class ReceitaController {

    private final ReceitaService service;

    private final OCRService ocrService;

    @PostMapping
    public Receita salvar(
            @RequestBody Receita receita
    ) {

        return service.salvar(receita);
    }

    @GetMapping
    public List<Receita> listar() {

        return service.listar();
    }

    @GetMapping("/{id}")
    public Receita buscar(@PathVariable Long id) {

        return service.buscar(id);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {

        service.deletar(id);
    }

    @GetMapping("/ocr")
    public String lerReceita(
            @RequestParam String imagemUrl
    ) {

        return ocrService.lerReceita(imagemUrl);
    }
}
