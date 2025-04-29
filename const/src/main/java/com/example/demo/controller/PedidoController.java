package com.example.demo.controller;

import com.example.demo.dto.PedidoCozinhaDTO;
import com.example.demo.dto.PedidoMotoboyDTO;
import com.example.demo.model.Pedido;
import com.example.demo.service.PedidoService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public Pedido criarPedido(
            @RequestParam String tipoPedido,
            @RequestParam(required = false) Long mesaId,
            @RequestParam(required = false) String nomeCliente,
            @RequestParam(required = false) String enderecoCliente) {

        if ("online".equals(tipoPedido)) {
            if (nomeCliente == null || nomeCliente.trim().isEmpty()) {
                throw new IllegalArgumentException("Nome do cliente é obrigatório para pedidos online");
            }
            if (enderecoCliente == null || enderecoCliente.trim().isEmpty()) {
                throw new IllegalArgumentException("Endereço do cliente é obrigatório para pedidos online");
            }
        }

        return pedidoService.criarPedido(tipoPedido, mesaId, nomeCliente, enderecoCliente);
    }

    @GetMapping("/{id}")
    public Pedido buscarPedido(@PathVariable Long id) {
        return pedidoService.buscarPedido(id).orElseThrow();
    }

    @PostMapping("/{pedidoId}/itens/{itemCardapioId}")
    public Pedido adicionarItem(@PathVariable Long pedidoId, @PathVariable Long itemCardapioId,
            @RequestParam int quantidade) {
        return pedidoService.adicionarItem(pedidoId, itemCardapioId, quantidade);
    }

    @DeleteMapping("/{pedidoId}/itens/{itemPedidoId}")
    public void removerItem(@PathVariable Long pedidoId, @PathVariable Long itemPedidoId) {
        pedidoService.removerItem(itemPedidoId);
    }

    @PutMapping("/{pedidoId}/finalizar")
    public Pedido finalizarPedido(@PathVariable Long pedidoId) {
        return pedidoService.finalizarPedido(pedidoId);
    }

    @GetMapping("/{pedidoId}/total")
    public double calcularTotal(@PathVariable Long pedidoId) {
        return pedidoService.calcularTotal(pedidoId);
    }

    @GetMapping("/cozinha")
    public List<PedidoCozinhaDTO> listarPedidosParaCozinha() {
        return pedidoService.listarPedidosParaCozinha();
    }

    @GetMapping("/motoboy")
    public List<PedidoMotoboyDTO> listarPedidosParaMotoboy() {
        return pedidoService.listarPedidosParaMotoboy();
    }

    @PutMapping("/{pedidoId}/rota")
    public ResponseEntity<Void> marcarComoEmRota(@PathVariable Long pedidoId) {
        pedidoService.marcarComoEmRota(pedidoId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{pedidoId}/entregue")
    public ResponseEntity<Void> marcarComoEntregue(@PathVariable Long pedidoId) {
        pedidoService.marcarComoEntregue(pedidoId);
        return ResponseEntity.ok().build();
    }

}
