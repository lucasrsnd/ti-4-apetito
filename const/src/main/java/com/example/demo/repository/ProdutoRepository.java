package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.Produto;

import java.time.LocalDate;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

        @Query("SELECT p FROM Produto p WHERE p.perecivel = true AND p.dataValidade BETWEEN :hoje AND :umaSemana")
        List<Produto> findProdutosProximosVencimento(
                        @Param("hoje") LocalDate hoje,
                        @Param("umaSemana") LocalDate umaSemana);

        @Query("SELECT SUM(p.precoCompra) FROM Produto p")
        Double sumTotalProdutos();
}