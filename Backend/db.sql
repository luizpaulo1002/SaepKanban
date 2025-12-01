CREATE DATABASE IF NOT EXISTS saep_db;
USE saep_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    setor VARCHAR(255) NOT NULL,
    prioridade ENUM('baixa', 'média', 'alta') NOT NULL,
    status ENUM('a fazer', 'fazendo', 'pronto') NOT NULL DEFAULT 'a fazer',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);