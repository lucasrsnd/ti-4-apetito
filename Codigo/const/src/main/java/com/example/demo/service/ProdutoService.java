package com.example.demo.service;

import com.example.demo.model.Produto;
import com.example.demo.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    public List<Produto> listarTodos() {
        return repository.findAll();
    }

    public Optional<Produto> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Produto salvar(Produto produto) {
        return repository.save(produto);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    public List<Produto> verificarVencimentosProximos() {
        LocalDate hoje = LocalDate.now();
        LocalDate umaSemana = hoje.plusDays(7);
        return repository.findProdutosProximosVencimento(hoje, umaSemana);
    }

    public int contarProdutosProximosVencimento() {
        return verificarVencimentosProximos().size();
    }
}