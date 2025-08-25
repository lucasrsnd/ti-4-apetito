package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.ItemCardapio;

public interface ItemCardapioRepository extends JpaRepository<ItemCardapio, Long> {
}