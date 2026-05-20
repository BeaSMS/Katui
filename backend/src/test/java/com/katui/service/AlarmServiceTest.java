package com.katui.service;

import com.katui.entity.Alarme;
import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;
import com.katui.repository.AlarmeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlarmeServiceTest {

    @Mock
    private AlarmeRepository repository;

    @InjectMocks
    private AlarmeService service;

    private Usuario usuario;
    private Medicamento medicamento;
    private Alarme alarmeExistente;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);

        medicamento = new Medicamento();
        medicamento.setId(10L);
        medicamento.setHorario("08:00");
        medicamento.setDias(2); // 2 dias de tratamento
        medicamento.setTipoFrequencia("INTERVALO_HORAS");
        medicamento.setValorFrequencia(8); // a cada 8 horas (3x ao dia)
        medicamento.setUsuario(usuario);

        alarmeExistente = new Alarme();
        alarmeExistente.setId(100L);
        alarmeExistente.setHorario(LocalDateTime.now());
        alarmeExistente.setTomado(false);
        alarmeExistente.setUsuario(usuario);
        alarmeExistente.setMedicamento(medicamento);
    }

    @Test
    void deveGerarAlarmesPorIntervaloDeHoras() {
        when(repository.findByMedicamento(medicamento)).thenReturn(new ArrayList<>());
        when(repository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));

        List<Alarme> alarmesGerados = service.gerarAlarmes(medicamento, usuario);

        // 2 dias * (24 horas / 8 horas de intervalo) = 6 alarmes
        assertEquals(6, alarmesGerados.size());
        verify(repository, times(1)).deleteAll(anyList()); // Garante que apagou os antigos
        verify(repository, times(1)).saveAll(anyList());
    }

    @Test
    void deveMarcarAlarmeComoTomado() {
        when(repository.findById(100L)).thenReturn(Optional.of(alarmeExistente));
        when(repository.save(any(Alarme.class))).thenAnswer(i -> i.getArgument(0));

        Alarme atualizado = service.marcarTomado(100L, usuario);

        assertTrue(atualizado.getTomado());
        verify(repository, times(1)).save(alarmeExistente);
    }

    @Test
    void deveLancarExcecaoAoAcessarAlarmeDeOutroUsuario() {
        Usuario outroUsuario = new Usuario();
        outroUsuario.setId(2L);

        when(repository.findById(100L)).thenReturn(Optional.of(alarmeExistente));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.buscar(100L, outroUsuario);
        });

        assertEquals("Acesso negado", exception.getMessage());
    }
}