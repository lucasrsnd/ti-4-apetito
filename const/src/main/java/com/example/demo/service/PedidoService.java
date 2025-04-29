package com.example.demo.service;

import com.example.demo.dto.PedidoCozinhaDTO;
import com.example.demo.dto.PedidoMotoboyDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ItemCardapioRepository itemCardapioRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private MesaService mesaService;

    public Pedido criarPedido(String tipoPedido, Long mesaId, String nomeCliente, String enderecoCliente) {
        Pedido pedido = new Pedido();

        if ("mesa".equals(tipoPedido)) {
            Mesa mesa = mesaService.buscarMesaPorId(mesaId);
            if (mesa == null) {
                throw new IllegalArgumentException("Mesa não encontrada.");
            }

            mesa.setStatus("ocupado");
            mesaRepository.save(mesa);

            pedido.setMesa(mesa);
        } else if ("online".equals(tipoPedido)) {
            pedido.setNomeCliente(nomeCliente);
            pedido.setEnderecoCliente(enderecoCliente);
        }

        return pedidoRepository.save(pedido);
    }

    public Optional<Pedido> buscarPedido(Long id) {
        return pedidoRepository.findById(id);
    }

    public Pedido adicionarItem(Long pedidoId, Long itemCardapioId, int quantidade) {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        ItemCardapio itemCardapio = itemCardapioRepository.findById(itemCardapioId).orElseThrow();

        ItemPedido itemPedido = new ItemPedido();
        itemPedido.setPedido(pedido);
        itemPedido.setItemCardapio(itemCardapio);
        itemPedido.setQuantidade(quantidade);

        pedido.getItens().add(itemPedido);
        pedidoRepository.save(pedido);
        return pedido;
    }

    public void removerItem(Long itemPedidoId) {
        itemPedidoRepository.deleteById(itemPedidoId);
    }

    public Pedido finalizarPedido(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        pedido.setStatus("EM_ANDAMENTO");
        return pedidoRepository.save(pedido);
    }

    public double calcularTotal(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        double total = 0;

        for (ItemPedido itemPedido : pedido.getItens()) {
            total += itemPedido.getItemCardapio().getPreco() * itemPedido.getQuantidade();
        }

        return total;
    }

    public List<PedidoCozinhaDTO> listarPedidosParaCozinha() {
        List<Pedido> pedidos = pedidoRepository.findAll();

        return pedidos.stream()
                .filter(pedido -> !pedido.getStatus().equals("FINALIZADO"))
                .map(pedido -> {
                    PedidoCozinhaDTO dto = new PedidoCozinhaDTO();
                    dto.setId(pedido.getId());
                    dto.setStatus(pedido.getStatus());
                    dto.setItens(pedido.getItens());
                    dto.setTotal(calcularTotal(pedido.getId()));

                    double total = pedido.getItens().stream()
                            .filter(item -> item.getItemCardapio() != null)
                            .mapToDouble(item -> item.getItemCardapio().getPreco() * item.getQuantidade())
                            .sum();

                    dto.setTotal(total);

                    if (pedido.getMesa() != null) {
                        dto.setMesaId(pedido.getMesa().getId());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<PedidoMotoboyDTO> listarPedidosParaMotoboy() {
        return pedidoRepository.findByMesaIsNullAndStatusNotOrderByStatusAscDataStatusDesc("ENTREGUE").stream()
                .map(pedido -> {
                    PedidoMotoboyDTO dto = new PedidoMotoboyDTO();
                    dto.setId(pedido.getId());
                    dto.setStatus(pedido.getStatus());
                    dto.setNomeCliente(pedido.getNomeCliente());
                    dto.setEnderecoCliente(pedido.getEnderecoCliente());
                    dto.setTotal(calcularTotal(pedido.getId()));
                    dto.setDataStatus(pedido.getDataStatus());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public void marcarComoEmRota(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado"));

        pedido.setStatus("EM ROTA");
        pedido.setDataStatus(LocalDateTime.now());
        pedidoRepository.save(pedido);
    }

    public void marcarComoEntregue(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado"));

        pedido.setStatus("ENTREGUE");
        pedido.setDataStatus(LocalDateTime.now());
        pedidoRepository.save(pedido);
    }

}
