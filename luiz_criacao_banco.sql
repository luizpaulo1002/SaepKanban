    -- Criação da tabela de usuários

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE tarefas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    descricao TEXT NOT NULL,
    setor VARCHAR(100) NOT NULL,
    
    -- Prioridade definida com os valores permitidos
    prioridade ENUM('baixa', 'média', 'alta') NOT NULL,
    
    -- Status com valores permitidos e padrão 'a fazer'
    status ENUM('a fazer', 'fazendo', 'pronto') NOT NULL DEFAULT 'a fazer',
    
    -- Data de cadastro com preenchimento automático
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave estrangeira que liga a tarefa ao usuário
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);