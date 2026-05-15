package com.katui.repository;

import com.katui.entity.Medicamento;

import com.katui.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface MedicamentoRepository
        extends JpaRepository<Medicamento, Long> {
        List<Medicamento> findByUsuario(Usuario usuario);
}