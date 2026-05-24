package com.katui.service;

import com.katui.entity.TokenMedico;
import com.katui.entity.Usuario;
import com.katui.repository.TokenMedicoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenMedicoService {

    private final TokenMedicoRepository repository;

    // Gera token de uso único com expiração de 30 minutos
    public TokenMedico gerarToken(Usuario paciente) {

        TokenMedico token = new TokenMedico();
        token.setToken(UUID.randomUUID().toString());
        token.setExpiracao(LocalDateTime.now().plusMinutes(30));
        token.setUsado(false);
        token.setPaciente(paciente);

        return repository.save(token);
    }

    public Usuario validarToken(String token) {

        TokenMedico tokenMedico = repository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (tokenMedico.getExpiracao().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        return tokenMedico.getPaciente();
    }

    // Invalida o token após uso
    public void invalidarToken(String token) {

        TokenMedico tokenMedico = repository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        tokenMedico.setUsado(true);
        repository.save(tokenMedico);
    }
}