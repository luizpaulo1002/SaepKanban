// Variáveis globais para o banco de dados e usuários
let DB;
let SQL;
let USERS = [];

// --- FUNÇÕES DE UTILIDADE E CONTROLE DE UI ---

/**
 * Exibe uma mensagem na modal.
 */
function showModal(title, message, onConfirm = null) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    
    const confirmBtn = document.getElementById('modal-confirm');
    const closeBtn = document.getElementById('modal-close');
    
    // Limpa eventos anteriores para evitar duplicação
    confirmBtn.onclick = null;
    closeBtn.onclick = null;

    confirmBtn.onclick = () => {
        if (onConfirm) onConfirm();
        document.getElementById('app-modal').style.display = 'none';
    };

    closeBtn.onclick = () => {
        document.getElementById('app-modal').style.display = 'none';
    };

    if (onConfirm) {
        confirmBtn.classList.remove('hidden');
        closeBtn.textContent = 'Cancelar';
    } else {
        confirmBtn.classList.add('hidden');
        closeBtn.textContent = 'Fechar';
    }

    document.getElementById('app-modal').style.display = 'block';
}

/**
 * Altera a seção visível na tela.
 */
function navigateTo(targetId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
    });
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Ações específicas ao navegar
    if (targetId === 'gerenciamento') {
        renderTasks();
    } else if (targetId === 'cadastro-tarefa') {
        loadUsersToSelect();
        // Limpa o formulário e configura para cadastro
        document.getElementById('tarefa-id').value = '';
        document.getElementById('form-tarefa').reset();
        document.getElementById('tarefa-form-title').textContent = 'Cadastro de Tarefas';
        document.getElementById('btn-submit-tarefa').textContent = 'Cadastrar Tarefa';
    }
}

// Configuração dos links de navegação
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(e.target.dataset.target);
    });
});



    
/**
 * Salva o estado atual do banco de dados no LocalStorage.
 */
function persistDB() {
    if (!DB) return;
    // Exporta o banco como um array de bytes (Uint8Array)
    const data = DB.export();
    // Converte para Array normal para poder salvar como JSON
    const arrayData = Array.from(data);
    localStorage.setItem('saepDB', JSON.stringify(arrayData));
}


/**
 * Executa uma consulta SQL e retorna os resultados como array de objetos.
 */
function execQuery(sql, params = []) {
    try {
        const stmt = DB.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        return results;
    } catch (error) {
        console.error("Erro ao executar query:", sql, error);
        showModal('Erro no Banco de Dados', 'Ocorreu um erro ao tentar acessar os dados. Detalhes no console.');
        return [];
    }
}

// --- CRUD USUARIOS ---

/**
 * Carrega todos os usuários para a variável global USERS.
 */
async function loadAllUsers() {
    const sql = "SELECT id, nome, email FROM USUARIOS ORDER BY nome ASC";
    USERS = execQuery(sql);
}

/**
 * Adiciona um novo usuário.
 */
document.getElementById('form-usuario').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('user-nome').value.trim();
    const email = document.getElementById('user-email').value.trim();

    if (!nome || !email) {
        showModal('Validação', 'Todos os campos são obrigatórios.');
        return;
    }

    // Validação simples de email pego da internet para facilitação de uso!
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showModal('Validação', 'Por favor, insira um e-mail válido.');
        return;
    }

    try {
        const existing = execQuery("SELECT COUNT(*) as count FROM USUARIOS WHERE email = ?", [email]);
        if (existing[0].count > 0) {
            showModal('Erro de Cadastro', 'Este e-mail já está cadastrado.');
            return;
        }

        DB.run("INSERT INTO USUARIOS (nome, email) VALUES (?, ?)", [nome, email]);
        persistDB();
        await loadAllUsers();
        this.reset();
        showModal('Sucesso!', 'Cadastro concluído com sucesso.');
        navigateTo('gerenciamento');

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        showModal('Erro no Cadastro', 'Ocorreu um erro ao salvar o usuário.');
    }
});

// --- CRUD TAREFAS ---

/**
 * Popula o select de usuários.
 */
function loadUsersToSelect() {
    const select = document.getElementById('tarefa-usuario');
    select.innerHTML = '<option value="" disabled selected>Selecione um usuário</option>';

    USERS.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.nome} (${user.email})`;
        select.appendChild(option);
    });
}

/**
 * Adiciona ou atualiza uma tarefa.
 */
document.getElementById('form-tarefa').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('tarefa-id').value;
    const id_usuario = document.getElementById('tarefa-usuario').value;
    const descricao = document.getElementById('tarefa-descricao').value.trim();
    const setor = document.getElementById('tarefa-setor').value.trim();
    const prioridade = document.getElementById('tarefa-prioridade').value;

    if (!id_usuario || !descricao || !setor || !prioridade) {
        showModal('Validação', 'Todos os campos são obrigatórios.');
        return;
    }

    try {
        if (id) {
            // UPDATE
            const sql = `
                UPDATE TAREFAS 
                SET id_usuario = ?, descricao = ?, setor = ?, prioridade = ? 
                WHERE id = ?
            `;
            DB.run(sql, [id_usuario, descricao, setor, prioridade, id]);
            showModal('Sucesso!', 'Tarefa atualizada com sucesso.');
        } else {
            // INSERT
            const sql = `
                INSERT INTO TAREFAS (id_usuario, descricao, setor, prioridade) 
                VALUES (?, ?, ?, ?)
            `;
            DB.run(sql, [id_usuario, descricao, setor, prioridade]);
            showModal('Sucesso!', 'Cadastro concluído com sucesso.');
        }

        persistDB();
        this.reset();
        navigateTo('gerenciamento');

    } catch (error) {
        console.error("Erro ao salvar/atualizar tarefa:", error);
        showModal('Erro na Operação', 'Ocorreu um erro ao salvar a tarefa.');
    }
});

/**
 * Preenche o formulário para edição de uma tarefa.
 */
async function editTask(taskId) {
    const sql = "SELECT * FROM TAREFAS WHERE id = ?";
    const task = execQuery(sql, [taskId])[0];

    if (!task) {
        showModal('Erro', 'Tarefa não encontrada.');
        return;
    }
    
    navigateTo('cadastro-tarefa');
    document.getElementById('tarefa-form-title').textContent = 'Editar Tarefa';
    document.getElementById('btn-submit-tarefa').textContent = 'Atualizar Tarefa';

    // Como a lista de usuários pode não ter sido carregada no select se viermos direto da home
    loadUsersToSelect(); 

    document.getElementById('tarefa-id').value = task.id;
    document.getElementById('tarefa-usuario').value = task.id_usuario;
    document.getElementById('tarefa-descricao').value = task.descricao;
    document.getElementById('tarefa-setor').value = task.setor;
    document.getElementById('tarefa-prioridade').value = task.prioridade;
}

/**
 * Exclui uma tarefa.
 */
function deleteTask(taskId) {
    const onConfirm = () => {
        try {
            DB.run("DELETE FROM TAREFAS WHERE id = ?", [taskId]);
            persistDB();
            renderTasks();
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error);
            showModal('Erro na Exclusão', 'Não foi possível excluir a tarefa.');
        }
    };
    
    showModal(
        'Confirmação de Exclusão', 
        'Tem certeza que deseja excluir esta tarefa?', 
        onConfirm
    );
}

/**
 * Altera o status de uma tarefa.
 */
function updateTaskStatus(taskId, newStatus) {
    try {
        DB.run("UPDATE TAREFAS SET status = ? WHERE id = ?", [newStatus, taskId]);
        persistDB();
        renderTasks(); 
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        showModal('Erro na Atualização', 'Não foi possível alterar o status da tarefa.');
    }
}

/**
 * Renderiza a lista de tarefas nas colunas Kanban.
 */
async function renderTasks() {
    const sql = `
        SELECT 
            T.id, T.descricao, T.setor, T.prioridade, T.status, 
            U.nome AS nome_usuario 
        FROM TAREFAS T
        JOIN USUARIOS U ON T.id_usuario = U.id
        ORDER BY 
            CASE T.prioridade 
                WHEN 'alta' THEN 1 
                WHEN 'média' THEN 2 
                ELSE 3 
            END,
            T.data_cadastro ASC;
    `;
    const tasks = execQuery(sql);
    
    // Limpa colunas
    ['a fazer', 'fazendo', 'pronto'].forEach(status => {
        document.getElementById(`coluna-${status}`).innerHTML = '';
    });

    const msgElement = document.getElementById('gerenciamento-message');
    if (tasks.length === 0) {
        msgElement.textContent = 'Nenhuma tarefa cadastrada.';
        msgElement.classList.remove('hidden');
        return;
    }
    msgElement.classList.add('hidden');

    tasks.forEach(task => {
        const card = document.createElement('div');
        // Corrige a classe da borda de prioridade
        const priorityClass = `priority-${task.prioridade.toLowerCase().replace('é', 'e')}`;
        
        card.className = `task-card ${priorityClass} bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 mb-3`;
        card.innerHTML = `
            <p class="text-sm font-bold text-gray-800 mb-1">${task.descricao}</p>
            <p class="text-xs text-gray-600 mb-1">Setor: ${task.setor}</p>
            <p class="text-xs text-gray-600 mb-2">Prioridade: <span class="font-semibold capitalize">${task.prioridade}</span></p>
            <p class="text-xs text-gray-600 mb-3">Resp: <span class="font-medium">${task.nome_usuario}</span></p>

            <div class="flex space-x-2 mb-3">
                <button onclick="editTask(${task.id})" class="btn-primary text-xs px-3 py-1 rounded-md">Editar</button>
                <button onclick="deleteTask(${task.id})" class="btn-danger text-xs px-3 py-1 rounded-md">Excluir</button>
            </div>

            <div class="flex items-center space-x-2">
                <select onchange="updateTaskStatus(${task.id}, this.value)" class="p-1 text-xs border border-gray-300 rounded">
                    <option value="a fazer" ${task.status === 'a fazer' ? 'selected' : ''}>A Fazer</option>
                    <option value="fazendo" ${task.status === 'fazendo' ? 'selected' : ''}>Fazendo</option>
                    <option value="pronto" ${task.status === 'pronto' ? 'selected' : ''}>Pronto</option>
                </select>
            </div>
        `;
        
        const colId = `coluna-${task.status.toLowerCase().replace(' ', '-')}`;
        const col = document.getElementById(colId);
        if(col) col.appendChild(card);
    });
}

// Inicialização
window.onload = initDB;