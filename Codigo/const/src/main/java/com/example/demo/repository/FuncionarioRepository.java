package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.model.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    @Query("SELECT SUM(f.salario) FROM Funcionario f")
    Double sumTotalSalarios();
}