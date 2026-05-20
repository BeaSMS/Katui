package com.katui.service;

import com.katui.entity.Usuario;
import com.katui.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Yue Akiyama");
        usuario.setEmail("yue@katui.com");
        usuario.setSenha("senhaMestra");
        usuario.setPeso(65.0);
        usuario.setAltura(1.70);
    }

    @Test
    void deveSalvarUsuarioCriptografandoSenha() {
        when(passwordEncoder.encode("senhaMestra")).thenReturn("hashSeguro123");
        when(repository.save(any(Usuario.class))).thenReturn(usuario);

        Usuario salvo = service.salvar(usuario);

        assertEquals("hashSeguro123", salvo.getSenha());
        verify(repository, times(1)).save(usuario);
    }

    @Test
    void deveAtualizarDadosDoPerfilComSucesso() {
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        Usuario novosDados = new Usuario();
        novosDados.setNome("Beatriz");
        novosDados.setPeso(63.5);
        novosDados.setAlergias("Dipirona");

        Usuario atualizado = service.atualizar(1L, novosDados);

        assertEquals("Beatriz", atualizado.getNome());
        assertEquals(63.5, atualizado.getPeso());
        assertEquals("Dipirona", atualizado.getAlergias());
    }

    @Test
    void deveDeletarUsuarioSeExistir() {
        when(repository.existsById(1L)).thenReturn(true);

        service.deletar(1L);

        verify(repository, times(1)).deleteById(1L);
    }

    @Test
    void deveLancarExcecaoAoDeletarUsuarioInexistente() {
        when(repository.existsById(99L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.deletar(99L);
        });

        assertEquals("Usuário não encontrado", exception.getMessage());
        verify(repository, never()).deleteById(anyLong());
    }
}