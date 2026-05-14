package com.katui.controller;

import com.katui.entity.Usuario;
import com.katui.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;

    // =========================
    // REGISTRO
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Usuario usuario
    ) {

        String token =
                authService.register(usuario);

        return ResponseEntity.ok(
                Map.of(
                        "token",
                        token
                )
        );
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request
    ) {
        String email = request.get("email");
        String senha = request.get("senha");

        String token =
                authService.login(
                        email,
                        senha
                );

        return ResponseEntity.ok(
                Map.of(
                        "token",
                        token
                )
        );
    }
}