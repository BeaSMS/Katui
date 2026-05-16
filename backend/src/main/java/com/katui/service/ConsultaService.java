package com.katui.service;

import com.katui.entity.Consulta;
import com.katui.entity.Usuario;
import com.katui.repository.ConsultaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultaService {

    private final ConsultaRepository repository;

    public Consulta salvar(Consulta consulta, Usuario usuario) {
        consulta.setUsuario(usuario);
        return repository.save(consulta);
    }

    public List<Consulta> listar(Usuario usuario) {
        return repository.findByUsuarioOrderByDataHoraAsc(usuario);
    }

    public Consulta buscar(Long id, Usuario usuario) {
        Consulta consulta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        if (!consulta.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return consulta;
    }

    public Consulta atualizar(Long id, Consulta consulta, Usuario usuario) {
        Consulta existente = buscar(id, usuario);

        existente.setMedico(consulta.getMedico());
        existente.setEspecialidade(consulta.getEspecialidade());
        existente.setLocal(consulta.getLocal());
        existente.setDataHora(consulta.getDataHora());
        existente.setObservacao(consulta.getObservacao());

        return repository.save(existente);
    }

    public void deletar(Long id, Usuario usuario) {
        buscar(id, usuario);
        repository.deleteById(id);
    }
}