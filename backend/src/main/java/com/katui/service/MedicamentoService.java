package com.katui.service;

import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;
import com.katui.repository.MedicamentoRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class MedicamentoService {

    private final MedicamentoRepository repository;

    // Salvar medicamento
    public Medicamento salvar(Medicamento medicamento) {

        return repository.save(medicamento);
    }

    // Listar todos os medicamentos
    public List<Medicamento> listar(Usuario usuario) {
        return repository.findByUsuario(usuario);
    }

    // Buscar medicamento por ID
    public Medicamento buscar(Long id, Usuario usuario) {
        Medicamento medicamento = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicamento não encontrado"));

        if (!medicamento.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return medicamento;
    }

    public Medicamento atualizar(Long id, Medicamento medicamento, Usuario usuario) {
        Medicamento existente = buscar(id, usuario);

        existente.setNome(medicamento.getNome());
        existente.setHorario(medicamento.getHorario());
        existente.setTipoFrequencia(medicamento.getTipoFrequencia());
        existente.setValorFrequencia(medicamento.getValorFrequencia());

        return repository.save(existente);
    }

    public void deletar(Long id, Usuario usuario) {
        buscar(id, usuario); // já valida o dono
        repository.deleteById(id);
    }
}