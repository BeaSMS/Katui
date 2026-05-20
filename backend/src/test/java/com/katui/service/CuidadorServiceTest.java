package com.katui.service;

import com.katui.entity.TipoUsuario;
import com.katui.entity.Usuario;
import com.katui.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CuidadorServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CuidadorService cuidadorService;

    private Usuario cuidador;
    private Usuario paciente;
    private Usuario intruso;

    @BeforeEach
    void setUp() {
        cuidador = new Usuario();
        cuidador.setId(1L);
        cuidador.setTipo(TipoUsuario.CUIDADOR);
        cuidador.setPacientes(new ArrayList<>());

        paciente = new Usuario();
        paciente.setId(2L);
        paciente.setTipo(TipoUsuario.PACIENTE);
        paciente.setEmail("paciente@katui.com");

        intruso = new Usuario();
        intruso.setId(3L);
        intruso.setTipo(TipoUsuario.CUIDADOR);
        intruso.setPacientes(new ArrayList<>());
    }

    @Test
    void deveAdicionarPacienteComSucesso() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cuidador));
        when(usuarioRepository.findByEmail("paciente@katui.com")).thenReturn(Optional.of(paciente));

        cuidadorService.adicionarPaciente(cuidador, "paciente@katui.com");

        assertTrue(cuidador.getPacientes().contains(paciente));
        verify(usuarioRepository, times(1)).save(cuidador);
    }

    @Test
    void deveVerificarAcessoComSucessoParaPacienteVinculado() {
        cuidador.getPacientes().add(paciente);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cuidador));

        Usuario pacienteRetornado = cuidadorService.verificarAcesso(cuidador, 2L);

        assertNotNull(pacienteRetornado);
        assertEquals(2L, pacienteRetornado.getId());
    }

    @Test
    void deveNegarAcessoParaPacienteNaoVinculado() {
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(intruso));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cuidadorService.verificarAcesso(intruso, 2L);
        });

        assertEquals("Acesso negado: você não é cuidador deste paciente", exception.getMessage());
    }
}