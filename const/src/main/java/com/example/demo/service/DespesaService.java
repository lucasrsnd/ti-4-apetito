package com.example.demo.service;

import com.example.demo.model.Despesa;
import com.example.demo.repository.DespesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DespesaService {

    @Autowired
    private DespesaRepository repository;

    public List<Despesa> listarTodos() {
        return repository.findAll();
    }

    public Optional<Despesa> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Despesa salvar(Despesa despesa) {
        return repository.save(despesa);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
