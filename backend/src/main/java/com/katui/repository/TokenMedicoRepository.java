package com.katui.repository;

import com.katui.entity.TokenMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenMedicoRepository
        extends JpaRepository<TokenMedico, Long> {

    Optional<TokenMedico> findByToken(String token);
}