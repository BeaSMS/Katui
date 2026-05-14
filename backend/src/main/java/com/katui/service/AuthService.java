package com.katui.service;

import com.katui.config.JwtService;
import com.katui.entity.Usuario;
import com.katui.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class AuthService {

    private final UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    // =========================
    // REGISTRO
    // =========================

    public String register(Usuario usuario) {

        usuario.setSenha(
                passwordEncoder.encode(
                        usuario.getSenha()
                )
        );

        usuarioRepository.save(usuario);

        return jwtService.generateToken(usuario);
    }

    // =========================
    // LOGIN
    // =========================

    public String login(
            String email,
            String senha
    ) {

        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuário não encontrado"
                        )
                );

        boolean senhaCorreta =
                passwordEncoder.matches(
                        senha,
                        usuario.getSenha()
                );

        if (!senhaCorreta) {

            throw new RuntimeException(
                    "Senha inválida"
            );
        }

        return jwtService.generateToken(usuario);
    }
}