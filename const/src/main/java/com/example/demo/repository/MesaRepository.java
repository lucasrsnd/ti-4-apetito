package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Mesa;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {
    List<Mesa> findAll();

    List<Mesa> findByStatus(String status);
}