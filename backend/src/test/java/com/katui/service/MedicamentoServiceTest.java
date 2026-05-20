package com.katui.service;

import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;
import com.katui.repository.MedicamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicamentoServiceTest {

    @Mock
    private MedicamentoRepository repository;

    @InjectMocks
    private MedicamentoService service;

    private Usuario usuario;
    private Medicamento medicamento;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);

        medicamento = new Medicamento();
        medicamento.setId(10L);
        medicamento.setNome("Dipirona");
        medicamento.setHorario("08:00");
        medicamento.setUsuario(usuario);
    }

    @Test
    void deveSalvarMedicamento() {
        when(repository.save(any(Medicamento.class))).thenReturn(medicamento);

        Medicamento salvo = service.salvar(medicamento);

        assertNotNull(salvo);
        assertEquals("Dipirona", salvo.getNome());
        verify(repository, times(1)).save(medicamento);
    }

    @Test
    void deveBuscarMedicamentoDoProprioUsuario() {
        when(repository.findById(10L)).thenReturn(Optional.of(medicamento));

        Medicamento encontrado = service.buscar(10L, usuario);

        assertNotNull(encontrado);
        assertEquals(10L, encontrado.getId());
    }

    @Test
    void deveAtualizarMedicamentoCorretamente() {
        when(repository.findById(10L)).thenReturn(Optional.of(medicamento));
        when(repository.save(any(Medicamento.class))).thenAnswer(i -> i.getArgument(0));

        Medicamento novosDados = new Medicamento();
        novosDados.setNome("Ibuprofeno");
        novosDados.setHorario("12:00");

        Medicamento atualizado = service.atualizar(10L, novosDados, usuario);

        assertEquals("Ibuprofeno", atualizado.getNome());
        assertEquals("12:00", atualizado.getHorario());
    }
}