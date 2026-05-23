package com.katui.repository;

import com.katui.entity.Alarme;
import com.katui.entity.Medicamento;
import com.katui.entity.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

import java.util.List;

@Repository
public interface AlarmeRepository extends JpaRepository<Alarme, Long> {

    List<Alarme> findByUsuario(Usuario usuario);

    List<Alarme> findByMedicamento(Medicamento medicamento);

    List<Alarme> findByUsuarioAndMedicamentoAtivoTrue(Usuario usuario);

    @Transactional
    @Modifying
    void deleteByMedicamentoIdAndUsuarioId(Long medicamentoId, Long usuarioId);
}