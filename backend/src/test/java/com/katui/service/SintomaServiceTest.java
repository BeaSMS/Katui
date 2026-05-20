package com.katui.service;

import com.katui.entity.Sintoma;
import com.katui.entity.Usuario;
import com.katui.repository.SintomaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SintomaServiceTest {

    @Mock
    private SintomaRepository repository;

    @InjectMocks
    private SintomaService service;

    private Usuario usuario;
    private Usuario outroUsuario;
    private Sintoma sintoma;

    @BeforeEach
    void setUp() {
        // Preparando os dados para os testes
        usuario = new Usuario();
        usuario.setId(1L);

        outroUsuario = new Usuario();
        outroUsuario.setId(2L);

        sintoma = new Sintoma();
        sintoma.setId(10L);
        sintoma.setLocalizacao("Cabeça (Têmporas)");
        sintoma.setQualidade("Latejante");
        sintoma.setIntensidadeEscala(8);
        sintoma.setIncapacitante(true);
        sintoma.setPadraoTempo("Contínuo há 2 horas");
        sintoma.setUsuario(usuario); // O sintoma pertence ao usuario 1
    }

    @Test
    void deveSalvarSintomaComSucesso() {
        when(repository.save(any(Sintoma.class))).thenReturn(sintoma);

        Sintoma salvo = service.salvar(sintoma, usuario);

        assertNotNull(salvo);
        assertEquals(usuario, salvo.getUsuario()); // Garante que o vínculo foi feito
        verify(repository, times(1)).save(sintoma);
    }

    @Test
    void deveBuscarSintomaComSucessoParaDono() {
        when(repository.findById(10L)).thenReturn(Optional.of(sintoma));

        Sintoma encontrado = service.buscar(10L, usuario);

        assertNotNull(encontrado);
        assertEquals("Cabeça (Têmporas)", encontrado.getLocalizacao());
        assertTrue(encontrado.getIncapacitante());
    }

    @Test
    void deveLancarExcecaoAoBuscarSintomaDeOutroUsuario() {
        when(repository.findById(10L)).thenReturn(Optional.of(sintoma));

        // Tenta buscar o sintoma do usuario 1 usando o usuario 2
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.buscar(10L, outroUsuario);
        });

        assertEquals("Acesso negado", exception.getMessage());
    }

    @Test
    void deveAtualizarSintomaComNovosCamposClinicos() {
        when(repository.findById(10L)).thenReturn(Optional.of(sintoma));
        when(repository.save(any(Sintoma.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Simulando os dados chegando do Controller/Frontend
        Sintoma novosDados = new Sintoma();
        novosDados.setLocalizacao("Pescoço e Nuca");
        novosDados.setQualidade("Pressão e Rigidez");
        novosDados.setIntensidadeEscala(4);
        novosDados.setIncapacitante(false);
        novosDados.setFatoresAssociados("Piora ao abaixar a cabeça");
        novosDados.setDataHoraRegistro(LocalDateTime.now());

        // Executando a atualização
        Sintoma atualizado = service.atualizar(10L, novosDados, usuario);

        // Verificando se os campos foram substituídos corretamente
        assertEquals("Pescoço e Nuca", atualizado.getLocalizacao());
        assertEquals("Pressão e Rigidez", atualizado.getQualidade());
        assertEquals(4, atualizado.getIntensidadeEscala());
        assertFalse(atualizado.getIncapacitante());
        assertEquals("Piora ao abaixar a cabeça", atualizado.getFatoresAssociados());
    }
}