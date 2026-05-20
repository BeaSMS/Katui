package com.katui.service;

import com.katui.config.JwtService;
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
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("teste@katui.com");
        usuario.setSenha("senha123");
    }

    @Test
    void deveRegistrarUsuarioComSucesso() {
        when(passwordEncoder.encode("senha123")).thenReturn("senhaCriptografada");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        when(jwtService.generateToken(usuario)).thenReturn("tokenFalso");

        String token = authService.register(usuario);

        assertEquals("tokenFalso", token);
        assertEquals("senhaCriptografada", usuario.getSenha());
        verify(usuarioRepository, times(1)).save(usuario);
    }

    @Test
    void deveRealizarLoginComSucesso() {
        when(usuarioRepository.findByEmail("teste@katui.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senha123", "senha123")).thenReturn(true);
        when(jwtService.generateToken(usuario)).thenReturn("tokenFalso");

        String token = authService.login("teste@katui.com", "senha123");

        assertEquals("tokenFalso", token);
    }

    @Test
    void deveLancarExcecaoQuandoSenhaInvalidaNoLogin() {
        when(usuarioRepository.findByEmail("teste@katui.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaErrada", "senha123")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login("teste@katui.com", "senhaErrada");
        });

        assertEquals("Senha inválida", exception.getMessage());
    }
}