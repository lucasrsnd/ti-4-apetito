package com.example.demo.service;

import com.example.demo.model.ItemCardapio;
import com.example.demo.repository.ItemCardapioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemCardapioService {

    @Autowired
    private ItemCardapioRepository repository;

    public List<ItemCardapio> listarTodos() {
        return repository.findAll();
    }

    public Optional<ItemCardapio> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public ItemCardapio salvar(ItemCardapio item) {
        return repository.save(item);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

}
