package com.katui.repository;

import com.katui.entity.Sintoma;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface SintomaRepository
        extends JpaRepository<Sintoma, Long> {

}