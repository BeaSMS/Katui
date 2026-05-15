package com.katui.repository;

import com.katui.entity.Exame;

import com.katui.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface ExameRepository
        extends JpaRepository<Exame, Long> {
    List<Exame> findByUsuario(Usuario usuario);
}