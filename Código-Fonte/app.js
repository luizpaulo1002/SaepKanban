// URL da API (Backend Node.js)
const API_URL = 'http://localhost:3000';

let USERS = [];

// --- FUNÇÕES DE UTILIDADE E CONTROLE DE UI ---

function showModal(title, message, onConfirm = null) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    
    const confirmBtn = document.getElementById('modal-confirm');
    const closeBtn = document.getElementById('modal-close');
    
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

function navigateTo(targetId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
    });
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    if (targetId === 'gerenciamento') {
        renderTasks();
    } else if (targetId === 'cadastro-tarefa') {
        loadUsersToSelect();
        document.getElementById('tarefa-id').value = '';
        document.getElementById('form-tarefa').reset();
        document.getElementById('tarefa-form-title').textContent = 'Cadastro de Tarefas';
        document.getElementById('btn-submit-tarefa').textContent = 'Cadastrar Tarefa';
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(e.target.dataset.target);
    });
});

// --- INTERAÇÃO COM API (USUÁRIOS) ---

async function loadAllUsers() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        USERS = Array.isArray(data) ? data : [];
        
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        showModal('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        USERS = [];
    }
}

document.getElementById('form-usuario').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('user-nome').value.trim();
    const email = document.getElementById('user-email').value.trim();

    if (!nome || !email) {
        showModal('Validação', 'Todos os campos são obrigatórios.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao salvar');
        }

        await loadAllUsers();
        this.reset();
        showModal('Sucesso!', 'Cadastro concluído com sucesso.');
        navigateTo('gerenciamento');

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        showModal('Erro no Cadastro', error.message);
    }
});

// --- INTERAÇÃO COM API (TAREFAS) ---

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

    const payload = { id_usuario, descricao, setor, prioridade };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/tarefas/${id}` : `${API_URL}/tarefas`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro na requisição');

        showModal('Sucesso!', id ? 'Tarefa atualizada.' : 'Tarefa criada.');
        this.reset();
        navigateTo('gerenciamento');

    } catch (error) {
        console.error("Erro ao salvar tarefa:", error);
        showModal('Erro', 'Não foi possível salvar a tarefa.');
    }
});

async function editTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tarefas/${taskId}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar tarefa');
        }
        
        const task = await response.json();

        if (!task) throw new Error('Tarefa não encontrada');

        navigateTo('cadastro-tarefa');
        document.getElementById('tarefa-form-title').textContent = 'Editar Tarefa';
        document.getElementById('btn-submit-tarefa').textContent = 'Atualizar Tarefa';

        // Garante que a lista de usuários está carregada
        if(USERS.length === 0) await loadAllUsers();
        loadUsersToSelect(); 

        document.getElementById('tarefa-id').value = task.id;
        document.getElementById('tarefa-usuario').value = task.id_usuario;
        document.getElementById('tarefa-descricao').value = task.descricao;
        document.getElementById('tarefa-setor').value = task.setor;
        document.getElementById('tarefa-prioridade').value = task.prioridade;
    } catch (error) {
        console.error("Erro ao editar:", error);
        showModal('Erro', 'Não foi possível carregar os dados da tarefa.');
    }
}

function deleteTask(taskId) {
    const onConfirm = async () => {
        try {
            const response = await fetch(`${API_URL}/tarefas/${taskId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erro ao deletar');
            renderTasks();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            showModal('Erro', 'Não foi possível excluir a tarefa.');
        }
    };
    
    showModal('Confirmação', 'Deseja excluir esta tarefa?', onConfirm);
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/tarefas/${taskId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        renderTasks(); 
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        showModal('Erro', 'Falha ao mover tarefa.');
    }
}

async function renderTasks() {
    try {
        const response = await fetch(`${API_URL}/tarefas`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const tasks = Array.isArray(data) ? data : [];
        
        // Limpa colunas
        ['a-fazer', 'fazendo', 'pronto'].forEach(status => {
            const col = document.getElementById(`coluna-${status}`);
            if(col) col.innerHTML = '';
        });

        const msgElement = document.getElementById('gerenciamento-message');
        if (tasks.length === 0) {
            msgElement.textContent = 'Nenhuma tarefa cadastrada.';
            msgElement.classList.remove('hidden');
            return;
        }
        msgElement.classList.add('hidden');

        tasks.forEach(task => {
            // Classe CSS para prioridade (sem acento)
            const priorityClass = `priority-${task.prioridade}`;
            
            // Tratamento do status para o ID da coluna
            const statusId = task.status.toLowerCase().replace(/\s+/g, '-');
            const col = document.getElementById(`coluna-${statusId}`);

            if (col) {
                const card = document.createElement('div');
                card.className = `task-card ${priorityClass}`;
                card.innerHTML = `
                    <p class="task-info"><strong>Descrição:</strong> ${task.descricao}</p>
                    <p class="task-info"><strong>Setor:</strong> ${task.setor}</p>
                    <p class="task-info"><strong>Prioridade:</strong> ${task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}</p>
                    <p class="task-info"><strong>Vinculado a:</strong> ${task.nome_usuario}</p>

                    <div class="task-actions">
                        <button onclick="editTask(${task.id})" class="btn-edit">Editar</button>
                        <button onclick="deleteTask(${task.id})" class="btn-delete">Excluir</button>
                    </div>

                    <div class="task-status">
                        <select id="status-${task.id}" class="status-select">
                            <option value="a fazer" ${task.status === 'a fazer' ? 'selected' : ''}>A Fazer</option>
                            <option value="fazendo" ${task.status === 'fazendo' ? 'selected' : ''}>Fazendo</option>
                            <option value="pronto" ${task.status === 'pronto' ? 'selected' : ''}>Pronto</option>
                        </select>
                        <button onclick="updateTaskStatus(${task.id}, document.getElementById('status-${task.id}').value)" class="btn-status">Alterar Status</button>
                    </div>
                `;
                col.appendChild(card);
            }
        });
    } catch (error) {
        console.error("Erro ao renderizar tarefas:", error);
        const msgElement = document.getElementById('gerenciamento-message');
        msgElement.textContent = 'Erro ao carregar tarefas. Verifique se o servidor está rodando.';
        msgElement.classList.remove('hidden');
    }
}

// Inicialização
window.onload = async () => {
    await loadAllUsers();
    renderTasks();
};