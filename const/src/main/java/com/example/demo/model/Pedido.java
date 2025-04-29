package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Entity
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status;
    private LocalDateTime dataStatus;

    @ManyToOne
    private Mesa mesa;

    private String nomeCliente;
    private String enderecoCliente;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    public Pedido() {
        this.status = "EM_ANDAMENTO";
    }

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<ItemPedido> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }

    public Mesa getMesa() {
        return mesa;
    }

    public void setMesa(Mesa mesa) {
        this.mesa = mesa;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public String getEnderecoCliente() {
        return enderecoCliente;
    }

    public void setEnderecoCliente(String enderecoCliente) {
        this.enderecoCliente = enderecoCliente;
    }

    public LocalDateTime getDataStatus() {
        return dataStatus;
    }

    public void setDataStatus(LocalDateTime dataStatus) {
        this.dataStatus = dataStatus;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    @Column(nullable = true)
    private Double total;

    @PrePersist
    @PreUpdate
    public void calcularTotal() {
        try {
            double calculatedTotal = 0.0;

            if (this.itens != null) {
                calculatedTotal = this.itens.stream()
                        .filter(Objects::nonNull)
                        .filter(item -> item.getItemCardapio() != null)
                        .filter(item -> item.getItemCardapio().getPreco() != null)
                        .mapToDouble(item -> item.getItemCardapio().getPreco() * item.getQuantidade())
                        .sum();
            }

            this.total = calculatedTotal;
        } catch (Exception e) {
            this.total = 0.0;
            System.err.println("Erro ao calcular total do pedido ID: " + this.id);
            e.printStackTrace();
        }
    }
}
