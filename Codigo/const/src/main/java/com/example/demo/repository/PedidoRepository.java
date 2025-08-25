package com.example.demo.repository;

import com.example.demo.model.Pedido;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByMesaIsNullAndStatusNot(String status);

    List<Pedido> findByMesaIsNullAndStatusNotOrderByStatusAscDataStatusDesc(String status);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.mesa IS NOT NULL")
    Long countPedidosPresenciais();

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.mesa IS NULL")
    Long countPedidosOnline();

    @Query("SELECT p FROM Pedido p")
    List<Pedido> findAllWithItens();
}
