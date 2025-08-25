package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Mesa;
import com.example.demo.repository.MesaRepository;

@Service
public class MesaService {

    @Autowired
    private MesaRepository mesaRepository;

    public void alterarStatus(Long id) {
        Mesa mesa = mesaRepository.findById(id).orElseThrow(() -> new RuntimeException("Mesa não encontrada"));
        mesa.setStatus(mesa.getStatus().equals("livre") ? "ocupado" : "livre");
        mesaRepository.save(mesa);
    }

    public List<Mesa> listarMesas() {
        return mesaRepository.findAll();
    }

    public Mesa buscarMesaPorId(Long id) {
        return mesaRepository.findById(id).orElse(null);
    }
}
