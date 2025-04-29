package com.example.demo.repository;

import com.example.demo.model.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    @Query("SELECT SUM(d.preco) FROM Despesa d")
    Double sumTotalDespesas();
}