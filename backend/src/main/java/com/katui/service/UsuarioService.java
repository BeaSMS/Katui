package com.katui.service;

import com.katui.entity.Usuario;
import com.katui.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public Usuario salvar(Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return repository.save(usuario);
    }

    public List<Usuario> listar() {
        return repository.findAll();
    }

    public Usuario buscar(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado")
        );
    }

    public Usuario atualizar(Long id, Usuario usuario) {

        Usuario existente = buscar(id);

        existente.setNome(usuario.getNome());
        existente.setTelefone(usuario.getTelefone());
        existente.setPeso(usuario.getPeso());
        existente.setAltura(usuario.getAltura());
        existente.setAlergias(usuario.getAlergias());

        return repository.save(existente);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}