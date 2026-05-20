package com.katui.service;

import com.katui.entity.Consulta;
import com.katui.entity.Usuario;
import com.katui.repository.ConsultaRepository;
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
class ConsultaServiceTest {

    @Mock
    private ConsultaRepository repository;

    @InjectMocks
    private ConsultaService service;

    private Usuario usuario;
    private Consulta consulta;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);

        consulta = new Consulta();
        consulta.setId(50L);
        consulta.setMedico("Dr. Rey");
        consulta.setEspecialidade("Cardiologista");
        consulta.setLocal("Hospital das Clínicas");
        consulta.setDataHora(LocalDateTime.now().plusDays(5));
        consulta.setUsuario(usuario);
    }

    @Test
    void deveSalvarConsultaComSucesso() {
        when(repository.save(any(Consulta.class))).thenReturn(consulta);

        Consulta salva = service.salvar(consulta, usuario);

        assertNotNull(salva);
        assertEquals(usuario, salva.getUsuario());
        verify(repository, times(1)).save(consulta);
    }

    @Test
    void deveAtualizarConsultaComSucesso() {
        when(repository.findById(50L)).thenReturn(Optional.of(consulta));
        when(repository.save(any(Consulta.class))).thenAnswer(i -> i.getArgument(0));

        Consulta novosDados = new Consulta();
        novosDados.setMedico("Dra. Angela");
        novosDados.setEspecialidade("Neurologista");

        Consulta atualizada = service.atualizar(50L, novosDados, usuario);

        assertEquals("Dra. Angela", atualizada.getMedico());
        assertEquals("Neurologista", atualizada.getEspecialidade());
    }
}