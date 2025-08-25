# 🍽️ Apetito — Sistema de Gestão para Restaurantes

Este projeto foi desenvolvido como parte da disciplina **Trabalho Interdisciplinar: Aplicações para a Sustentabilidade**, do 4º período do curso de **Engenharia de Software** da **Pontifícia Universidade Católica de Minas Gerais (PUC Minas)**.

O objetivo foi criar uma solução em software para o restaurante **Apetito**, visando modernizar a gestão de insumos, reduzir desperdícios e otimizar processos operacionais por meio da tecnologia.

---

## 👨‍💻 Alunos integrantes da equipe

- Davi Érico dos Santos  
- João Gabriel Maia da Costa  
- Leandro Caldas Pacheco  
- Lucas Alves Resende  
- Lucas Maia Rocha  
- Lucas Porto de Andrade  
- Miguel Amaral Lessa Xavier

## 👩‍🏫 Professores responsáveis

- Profª Lucila Ishitani  
- Profª Soraia Lúcia da Silva

---

## 🚀 Como Executar o Projeto

### ⚙️ Pré-requisitos

Certifique-se de que os seguintes softwares estão instalados na máquina:

- [Java](https://www.oracle.com/java/technologies/javase-downloads.html) (versão compatível com Spring Boot)  
- [Maven](https://maven.apache.org/install.html)  
- [PostgreSQL](https://www.postgresql.org/download/)

### 🛠️ Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL.
2. Atualize as credenciais no arquivo `application.properties` com:
   - URL do banco
   - Nome do banco
   - Usuário e senha

### ▶️ Execução da Aplicação

No terminal, na raiz do projeto, execute:

```bash
mvn spring-boot:run
```

O Maven irá baixar as dependências automaticamente. A aplicação será iniciada localmente na porta padrão (`http://localhost:8080`).

---

Este sistema oferece funcionalidades como controle de estoque, pedidos online, integração com APIs externas e dashboards gerenciais — contribuindo diretamente para a sustentabilidade operacional do restaurante.