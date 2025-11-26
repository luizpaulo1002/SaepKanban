-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS saep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saep_db;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS USUARIOS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS TAREFAS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    setor VARCHAR(100) NOT NULL,
    prioridade ENUM('baixa', 'média', 'alta') NOT NULL DEFAULT 'média',
    status ENUM('a fazer', 'fazendo', 'pronto') NOT NULL DEFAULT 'a fazer',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_prioridade (prioridade),
    INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO TAREFAS (id_usuario, descricao, setor, prioridade, status) VALUES 
    (1, 'Revisar relatório de vendas', 'Comercial', 'alta', 'fazendo'),
    (2, 'Atualizar sistema de gestão', 'TI', 'média', 'a fazer'),
    (3, 'Realizar treinamento de equipe', 'RH', 'baixa', 'pronto');