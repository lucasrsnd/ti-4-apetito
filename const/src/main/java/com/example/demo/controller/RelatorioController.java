package com.example.demo.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.RelatorioService;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    @GetMapping("/despesas-totais")
    public Map<String, Double> getDespesasTotais() {
        return relatorioService.getDespesasTotais();
    }

    @GetMapping("/despesas-operacionais")
    public Map<String, Double> getDespesasOperacionais() {
        return relatorioService.getDespesasOperacionais();
    }

    @GetMapping("/itens-mais-pedidos")
    public Map<String, Long> getItensMaisPedidos() {
        return relatorioService.calcularItensMaisPedidos();
    }

    @GetMapping("/tipo-pedidos")
    public Map<String, Long> getQuantidadePorTipoPedido() {
        return relatorioService.contarPedidosPorTipo();
    }

    @GetMapping("/vendas-totais")
    public ResponseEntity<Double> getVendasTotais() {
        try {
            Double total = relatorioService.calcularVendasTotais();
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.ok(0.0);
        }
    }
}