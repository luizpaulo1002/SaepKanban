const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      //
    password: '2710',      // 
    database: 'saep_db',
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL');
});

// --- ROTAS DE USUÁRIOS ---

// Listar todos os usuários
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios ORDER BY nome ASC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Cadastrar usuário
app.post('/usuarios', (req, res) => {
    const { nome, email } = req.body;
    // Verificar duplicidade
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) return res.status(400).json({ message: 'E-mail já cadastrado' });

        db.query('INSERT INTO usuarios (nome, email) VALUES (?, ?)', [nome, email], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Usuário cadastrado', id: result.insertId });
        });
    });
});

// --- ROTAS DE TAREFAS ---

// Listar tarefas (com JOIN para pegar nome do usuário)
app.get('/tarefas', (req, res) => {
    const sql = `
        SELECT t.*, u.nome AS nome_usuario 
        FROM tarefas t
        JOIN usuarios u ON t.id_usuario = u.id
        ORDER BY 
            CASE t.prioridade 
                WHEN 'alta' THEN 1 
                WHEN 'média' THEN 2 
                ELSE 3 
            END,
            t.data_cadastro ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Cadastrar tarefa
app.post('/tarefas', (req, res) => {
    const { id_usuario, descricao, setor, prioridade } = req.body;
    const sql = 'INSERT INTO tarefas (id_usuario, descricao, setor, prioridade) VALUES (?, ?, ?, ?)';
    db.query(sql, [id_usuario, descricao, setor, prioridade], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Tarefa criada', id: result.insertId });
    });
});

// Atualizar tarefa
app.put('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { id_usuario, descricao, setor, prioridade } = req.body;
    const sql = 'UPDATE tarefas SET id_usuario = ?, descricao = ?, setor = ?, prioridade = ? WHERE id = ?';
    db.query(sql, [id_usuario, descricao, setor, prioridade, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Tarefa atualizada' });
    });
});

// Atualizar status da tarefa
app.patch('/tarefas/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = 'UPDATE tarefas SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Status atualizado' });
    });
});

// Excluir tarefa
app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tarefas WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Tarefa excluída' });
    });
});
// Buscar tarefa única (para edição)
app.get('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM tarefas WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

const PORT = 3000; // Alterado para 3000 para não conflitar com o MySQL
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});