package com.example.demo.controller;

import com.example.demo.model.Despesa;
import com.example.demo.service.DespesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/despesas")
@CrossOrigin(origins = "*")
public class DespesaController {

    @Autowired
    private DespesaService service;

    @GetMapping
    public List<Despesa> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Despesa> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Despesa criar(@RequestBody Despesa despesa) {
        return service.salvar(despesa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Despesa> atualizar(
            @PathVariable Long id,
            @RequestBody Despesa despesaAtualizada) {

        return service.buscarPorId(id)
                .map(despesa -> {
                    despesa.setNome(despesaAtualizada.getNome());
                    despesa.setParcelas(despesaAtualizada.getParcelas());
                    despesa.setPreco(despesaAtualizada.getPreco());
                    despesa.setDataVencimento(despesaAtualizada.getDataVencimento());

                    Despesa atualizada = service.salvar(despesa);
                    return ResponseEntity.ok(atualizada);
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

    
    @PutMapping("/{id}/pagar")
    public ResponseEntity<Despesa> marcarComoPago(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(despesa -> {
                    despesa.setStatus("pago");
                    despesa.setDataPagamento(LocalDate.now());
                    Despesa atualizada = service.salvar(despesa);
                    return ResponseEntity.ok(atualizada);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}