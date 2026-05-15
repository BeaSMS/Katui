package com.katui.repository;

import com.katui.entity.Receita;

import com.katui.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface ReceitaRepository
        extends JpaRepository<Receita, Long> {
    List<Receita> findByUsuario(Usuario usuario);
}