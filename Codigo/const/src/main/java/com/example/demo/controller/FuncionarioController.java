package com.example.demo.controller;

import com.example.demo.model.Funcionario;
import com.example.demo.service.FuncionarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@CrossOrigin(origins = "*")
public class FuncionarioController {

    @Autowired
    private FuncionarioService service;

    @GetMapping
    public List<Funcionario> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Funcionario> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Funcionario criar(@RequestBody Funcionario funcionario) {
        return service.salvar(funcionario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Funcionario> atualizar(
            @PathVariable Long id,
            @RequestBody Funcionario funcionarioAtualizado) {

        return service.buscarPorId(id)
                .map(funcionario -> {
                    funcionario.setNome(funcionarioAtualizado.getNome());
                    funcionario.setCpf(funcionarioAtualizado.getCpf());
                    funcionario.setTelefone(funcionarioAtualizado.getTelefone());
                    funcionario.setEmail(funcionarioAtualizado.getEmail());
                    funcionario.setSalario(funcionarioAtualizado.getSalario());
                    funcionario.setCargo(funcionarioAtualizado.getCargo());
                    funcionario.setPlacaMoto(funcionarioAtualizado.getPlacaMoto());

                    Funcionario atualizado = service.salvar(funcionario);
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

    @GetMapping("/cargos")
    public Funcionario.Cargo[] listarCargos() {
        return Funcionario.Cargo.values();
    }
}
