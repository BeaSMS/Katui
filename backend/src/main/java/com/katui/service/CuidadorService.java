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

    // Recarrega o cuidador do banco garantindo sessão ativa
    private Usuario recarregar(Usuario cuidador) {
        return usuarioRepository.findById(cuidador.getId())
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));
    }

    // Adicionar paciente pelo email
    public void adicionarPaciente(Usuario cuidador, String emailPaciente) {

        Usuario cuidadorAtualizado = recarregar(cuidador);

        if (cuidadorAtualizado.getTipo() != TipoUsuario.CUIDADOR) {
            throw new RuntimeException("Usuário não é um cuidador");
        }

        Usuario paciente = usuarioRepository.findByEmail(emailPaciente)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        if (paciente.getTipo() != TipoUsuario.PACIENTE) {
            throw new RuntimeException("Usuário alvo não é um paciente");
        }

        if (cuidadorAtualizado.getPacientes().contains(paciente)) {
            throw new RuntimeException("Paciente já vinculado");
        }

        cuidadorAtualizado.getPacientes().add(paciente);
        usuarioRepository.save(cuidadorAtualizado);
    }

    // Listar pacientes do cuidador
    public List<Usuario> listarPacientes(Usuario cuidador) {

        Usuario cuidadorAtualizado = recarregar(cuidador);

        if (cuidadorAtualizado.getTipo() != TipoUsuario.CUIDADOR) {
            throw new RuntimeException("Usuário não é um cuidador");
        }

        return cuidadorAtualizado.getPacientes();
    }

    // Remover vínculo
    public void removerPaciente(Usuario cuidador, Long pacienteId) {

        Usuario cuidadorAtualizado = recarregar(cuidador);

        Usuario paciente = usuarioRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        cuidadorAtualizado.getPacientes().remove(paciente);
        usuarioRepository.save(cuidadorAtualizado);
    }

    // Verifica se cuidador tem acesso ao paciente
    public Usuario verificarAcesso(Usuario cuidador, Long pacienteId) {

        Usuario cuidadorAtualizado = recarregar(cuidador);

        return cuidadorAtualizado.getPacientes().stream()
                .filter(p -> p.getId().equals(pacienteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Acesso negado"));
    }
}