package com.example.demo.controller;

import com.example.demo.model.ItemCardapio;
import com.example.demo.service.ItemCardapioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cardapio")
public class ItemCardapioController {

    @Autowired
    private ItemCardapioService service;

    @GetMapping
    public List<ItemCardapio> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemCardapio> buscarPorId(@PathVariable Long id) {
        Optional<ItemCardapio> item = service.buscarPorId(id);
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ItemCardapio criar(@RequestBody ItemCardapio item) {
        return service.salvar(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemCardapio> atualizar(@PathVariable Long id, @RequestBody ItemCardapio itemAtualizado) {
        Optional<ItemCardapio> itemExistente = service.buscarPorId(id);

        if (itemExistente.isPresent()) {
            ItemCardapio item = itemExistente.get();
            item.setNome(itemAtualizado.getNome());
            item.setDescricao(itemAtualizado.getDescricao());
            item.setPreco(itemAtualizado.getPreco());

            ItemCardapio itemSalvo = service.salvar(item);
            return ResponseEntity.ok(itemSalvo);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Optional<ItemCardapio> item = service.buscarPorId(id);

        if (item.isPresent()) {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}