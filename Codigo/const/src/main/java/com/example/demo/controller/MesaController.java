package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Mesa;
import com.example.demo.service.MesaService;

@RestController
@RequestMapping("/mesas")
public class MesaController {

    @Autowired
    private MesaService mesaService;

    @GetMapping
    public List<Mesa> listarMesas() {
        return mesaService.listarMesas();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> alterarStatus(@PathVariable Long id) {
        mesaService.alterarStatus(id);
        return ResponseEntity.ok().build();
    }
}
