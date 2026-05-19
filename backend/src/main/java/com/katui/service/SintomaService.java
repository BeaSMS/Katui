package com.katui.service;

import com.katui.entity.Sintoma;
import com.katui.entity.Usuario;
import com.katui.repository.SintomaRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class SintomaService {

    private final SintomaRepository repository;

    // Salvar sintoma
    public Sintoma salvar(Sintoma sintoma, Usuario usuario) {
        sintoma.setUsuario(usuario);
        return repository.save(sintoma);
    }

    public List<Sintoma> listar(Usuario usuario) {
        return repository.findByUsuario(usuario);
    }

    public Sintoma buscar(Long id, Usuario usuario) {
        Sintoma sintoma = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sintoma não encontrado"));

        if (!sintoma.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return sintoma;
    }

    public Sintoma atualizar(Long id, Sintoma sintoma, Usuario usuario) {
        Sintoma existente = buscar(id, usuario);

        existente.setLocalizacao(sintoma.getLocalizacao());
        existente.setQualidade(sintoma.getQualidade());
        existente.setIntensidadeEscala(sintoma.getIntensidadeEscala());
        existente.setIncapacitante(sintoma.getIncapacitante());
        existente.setPadraoTempo(sintoma.getPadraoTempo());
        existente.setFatoresAssociados(sintoma.getFatoresAssociados());
        existente.setImpactoFuncional(sintoma.getImpactoFuncional());
        existente.setDataHoraRegistro(sintoma.getDataHoraRegistro());

        return repository.save(existente);
    }

    public void deletar(Long id, Usuario usuario) {
        buscar(id, usuario);
        repository.deleteById(id);
    }
}