package com.katui.repository;

import com.katui.entity.Consulta;
import com.katui.entity.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaRepository
        extends JpaRepository<Consulta, Long> {

    List<Consulta> findByUsuarioOrderByDataHoraAsc(Usuario usuario);
}