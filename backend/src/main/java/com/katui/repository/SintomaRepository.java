package com.katui.repository;

import com.katui.entity.Sintoma;

import com.katui.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface SintomaRepository
        extends JpaRepository<Sintoma, Long> {
    List<Sintoma> findByUsuario(Usuario usuario);
}