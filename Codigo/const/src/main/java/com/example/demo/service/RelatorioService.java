package com.example.demo.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.PedidoCozinhaDTO;
import com.example.demo.model.Pedido;
import com.example.demo.repository.DespesaRepository;
import com.example.demo.repository.FuncionarioRepository;
import com.example.demo.repository.PedidoRepository;
import com.example.demo.repository.ProdutoRepository;

@Service
public class RelatorioService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private DespesaRepository despesaRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    public Map<String, Double> getDespesasTotais() {
        Map<String, Double> totais = new HashMap<>();

        totais.put("Salários",
                funcionarioRepository.sumTotalSalarios() != null ? funcionarioRepository.sumTotalSalarios() : 0.0);
        totais.put("Produtos",
                produtoRepository.sumTotalProdutos() != null ? produtoRepository.sumTotalProdutos() : 0.0);
        totais.put("Despesas",
                despesaRepository.sumTotalDespesas() != null ? despesaRepository.sumTotalDespesas() : 0.0);

        return totais;
    }

    public Map<String, Double> getDespesasOperacionais() {
        Map<String, Double> totais = new HashMap<>();

        totais.put("Produtos",
                produtoRepository.sumTotalProdutos() != null ? produtoRepository.sumTotalProdutos() : 0.0);
        totais.put("Despesas",
                despesaRepository.sumTotalDespesas() != null ? despesaRepository.sumTotalDespesas() : 0.0);

        return totais;
    }

    public Map<String, Long> calcularItensMaisPedidos() {
        List<Pedido> todosPedidos = pedidoRepository.findAllWithItens();

        Map<String, Long> itensCount = todosPedidos.stream()
                .flatMap(pedido -> pedido.getItens().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getItemCardapio().getNome(),
                        Collectors.counting()));

        return itensCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));
    }

    public Map<String, Long> contarPedidosPorTipo() {
        long pedidosPresenciais = pedidoRepository.countPedidosPresenciais();
        long pedidosOnline = pedidoRepository.countPedidosOnline();

        Map<String, Long> resultado = new HashMap<>();
        resultado.put("Presencial", pedidosPresenciais);
        resultado.put("Online", pedidosOnline);
        return resultado;
    }

    @Autowired
    private PedidoService pedidoService;

    public Double calcularVendasTotais() {
        List<PedidoCozinhaDTO> pedidos = pedidoService.listarPedidosParaCozinha();

        return pedidos.stream()
                .mapToDouble(PedidoCozinhaDTO::getTotal)
                .sum();
    }
}
