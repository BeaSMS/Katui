package com.katui.service;

import com.katui.entity.Exame;
import com.katui.entity.Usuario;
import com.katui.repository.ExameRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExameServiceTest {

    @Mock
    private ExameRepository repository;

    @InjectMocks
    private ExameService service;

    private Usuario usuario;
    private Exame exame;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);

        exame = new Exame();
        exame.setId(20L);
        exame.setNome("Hemograma Completo");
        exame.setArquivo("uploads/exames/teste-falso.pdf");
        exame.setUsuario(usuario);
    }

    @Test
    void deveSalvarExameComUploadDeFicheiro() throws IOException {
        // Simula um ficheiro PDF enviado pelo frontend
        MockMultipartFile ficheiroFalso = new MockMultipartFile(
                "arquivo",
                "hemograma.pdf",
                "application/pdf",
                "conteudo_falso_do_pdf".getBytes()
        );

        when(repository.save(any(Exame.class))).thenAnswer(i -> i.getArgument(0));

        Exame salvo = service.salvar("Hemograma", "Rotina", ficheiroFalso, usuario);

        assertNotNull(salvo);
        assertEquals("Hemograma", salvo.getNome());
        assertTrue(salvo.getArquivo().contains("hemograma.pdf"));
        verify(repository, times(1)).save(any(Exame.class));
    }

    @Test
    void deveBuscarExameDoProprioUsuario() {
        when(repository.findById(20L)).thenReturn(Optional.of(exame));

        Exame encontrado = service.buscar(20L, usuario);

        assertNotNull(encontrado);
        assertEquals(20L, encontrado.getId());
    }

    @Test
    void deveLancarExcecaoAoBuscarExameDeOutroUsuario() {
        Usuario intruso = new Usuario();
        intruso.setId(99L);

        when(repository.findById(20L)).thenReturn(Optional.of(exame));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.buscar(20L, intruso);
        });

        assertEquals("Acesso negado", exception.getMessage());
    }
}