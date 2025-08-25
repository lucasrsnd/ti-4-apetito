package com.example.demo.controller;

import com.example.demo.dto.PedidoCozinhaDTO;
import com.example.demo.dto.PedidoMotoboyDTO;
import com.example.demo.model.Pedido;
import com.example.demo.service.PedidoService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.resources.preference.Preference;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

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
    
   @PostMapping("/criar-pagamento")
public ResponseEntity<Map<String, String>> criarPagamento(
        @RequestBody Map<String, Object> request) {
    
    try {
        // Configurar credenciais
       MercadoPagoConfig.setAccessToken("TEST-1880828437433904-051813-16c0b6d25c3715ae9ad1c48305d8d945-1711917813");
        
        // Criar cliente de preferência
        PreferenceClient client = new PreferenceClient();
        
        // Criar item da preferência
        PreferenceItemRequest item =
            PreferenceItemRequest.builder()
                .title("Pedido no Restaurante Apetito")
                .description(request.get("descricao").toString())
                .quantity(1)
                .currencyId("BRL")
                .unitPrice(new BigDecimal(request.get("valor").toString()))
                .build();
        
        // Criar request da preferência
        PreferenceRequest preferenceRequest =
            PreferenceRequest.builder()
                .externalReference(request.get("pedidoId").toString())
                .items(List.of(item))
                .build();
        
        // Criar preferência
        Preference preference = client.create(preferenceRequest);
        
        // Retornar ID da preferência
        Map<String, String> response = new HashMap<>();
        response.put("id", preference.getId());
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).build();
    }
}
}