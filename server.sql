-- Tabela USUARIOS
CREATE TABLE USUARIOS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Tabela TAREFAS
CREATE TABLE TAREFAS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    setor TEXT NOT NULL,
    prioridade TEXT NOT NULL CHECK(prioridade IN ('baixa', 'média', 'alta')),
    status TEXT NOT NULL CHECK(status IN ('a fazer', 'fazendo', 'pronto')) DEFAULT 'a fazer',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Definição da Chave Estrangeira
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id) ON DELETE CASCADE
);

