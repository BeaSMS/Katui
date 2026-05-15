package com.katui.service;

import com.katui.entity.TipoUsuario;
import com.katui.entity.Usuario;
import com.katui.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CuidadorService {

    private final UsuarioRepository usuarioRepository;

    // Adicionar paciente pelo email
    public void adicionarPaciente(Usuario cuidador, String emailPaciente) {

        if (cuidador.getTipo() != TipoUsuario.CUIDADOR) {
            throw new RuntimeException("Usuário não é um cuidador");
        }

        Usuario paciente = usuarioRepository.findByEmail(emailPaciente)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        if (paciente.getTipo() != TipoUsuario.PACIENTE) {
            throw new RuntimeException("Usuário alvo não é um paciente");
        }

        if (cuidador.getPacientes().contains(paciente)) {
            throw new RuntimeException("Paciente já vinculado");
        }

        cuidador.getPacientes().add(paciente);
        usuarioRepository.save(cuidador);
    }

    // Listar pacientes do cuidador
    public List<Usuario> listarPacientes(Usuario cuidador) {

        if (cuidador.getTipo() != TipoUsuario.CUIDADOR) {
            throw new RuntimeException("Usuário não é um cuidador");
        }

        return cuidador.getPacientes();
    }

    // Remover vínculo
    public void removerPaciente(Usuario cuidador, Long pacienteId) {

        Usuario paciente = usuarioRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        cuidador.getPacientes().remove(paciente);
        usuarioRepository.save(cuidador);
    }

    // Verifica se cuidador tem acesso ao paciente
    public Usuario verificarAcesso(Usuario cuidador, Long pacienteId) {

        return cuidador.getPacientes().stream()
                .filter(p -> p.getId().equals(pacienteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Acesso negado"));
    }
}