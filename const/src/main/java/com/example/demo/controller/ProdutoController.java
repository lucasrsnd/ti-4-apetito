package com.example.demo.controller;

import com.example.demo.model.Produto;
import com.example.demo.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    @Autowired
    private ProdutoService service;

    @GetMapping
    public List<Produto> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Produto criar(@RequestBody Produto produto) {
        return service.salvar(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(
            @PathVariable Long id,
            @RequestBody Produto produtoAtualizado) {

        return service.buscarPorId(id)
                .map(produto -> {
                    produto.setNome(produtoAtualizado.getNome());
                    produto.setPrecoCompra(produtoAtualizado.getPrecoCompra());
                    produto.setDataValidade(produtoAtualizado.getDataValidade());
                    produto.setPerecivel(produtoAtualizado.isPerecivel());

                    Produto atualizado = service.salvar(produto);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (service.buscarPorId(id).isPresent()) {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/notificacoes")
    public List<Produto> getNotificacoesVencimento() {
        return service.verificarVencimentosProximos();
    }

    @GetMapping("/notificacoes/contagem")
    public int getContagemNotificacoes() {
        return service.contarProdutosProximosVencimento();
    }
}