// Registro do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}

const STORAGE_KEY = 'patrimonio';
let patrimonios = [];
let deferredPrompt = null;

// Evento de instalação do PWA
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;

    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.hidden = false;
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarPatrimonios();
    renderizarPatrimonios();
    
    const patrimonioForm = document.getElementById('patrimonioForm');
    if (patrimonioForm) {
        patrimonioForm.addEventListener('submit', adicionarPatrimonio);
    }

    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.hidden = true;
        });
    }
});

// Carregar patrimônios do localStorage
function carregarPatrimonios() {
    const dados = localStorage.getItem(STORAGE_KEY);
    patrimonios = dados ? JSON.parse(dados) : [];
}

// Renderizar patrimônios na tela
function renderizarPatrimonios() {
    const lista = document.getElementById('patrimonioList');

    if (patrimonios.length === 0) {
        lista.innerHTML = '<p class="empty-message">Nenhum patrimônio registrado.</p>';
        return;
    }

    lista.innerHTML = patrimonios.map(p => `
        <div class="patrimonio-item">
            <strong>${escapeHtml(p.numero)}</strong>
            <p>${escapeHtml(p.descricao)}</p>
            <div class="patrimonio-actions">
                <button class="btn btn-check ${p.conferido ? 'checked' : ''}" 
                        onclick="alternarConferencia(${p.id})">
                    ${p.conferido ? 'Conferido' : 'A Conferir'}
                </button>  
                <button class="btn btn-delete" onclick="deletarPatrimonio(${p.id})">
                    Remover
                </button> 
            </div>
        </div>
    `).join('');
}

// Alternar visibilidade do formulário
function toggleFormSection() {
    const formSection = document.getElementById('formSection');
    formSection.classList.toggle('visible');

    if (formSection.classList.contains('visible')) {
        document.getElementById('numeroPatrimonio').focus();
    }
}

// Notificação Temporária (Toast)
function mostrarNotificacao(mensagem) {
    const el = document.createElement('div');
    el.textContent = mensagem;
    el.className = 'toast';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

// Salvar dados no localStorage
function salvarPatrimonios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patrimonios));
}

// Adicionar novo Registro
function adicionarPatrimonio(e) {
    e.preventDefault();

    const numeroPatrimonio = document.getElementById('numeroPatrimonio').value.trim();
    const descricao = document.getElementById('descricao').value.trim();

    if (!numeroPatrimonio || !descricao) {
        alert('Preencha todos os campos.');
        return;
    }

    if (patrimonios.some(p => p.numero === numeroPatrimonio)) {
        alert('Já existe um patrimônio com este número.');
        return;
    }

    const novoPatrimonio = {
        id: Date.now(),
        numero: numeroPatrimonio,
        descricao: descricao,
        conferido: false,
        dataCriacao: new Date().toLocaleString('pt-BR'),
        dataConferencia: null
    };

    patrimonios.push(novoPatrimonio);
    salvarPatrimonios();

    document.getElementById('patrimonioForm').reset();
    toggleFormSection();
    renderizarPatrimonios();
    mostrarNotificacao('Patrimônio adicionado!');
}

// Alternar status de conferência
function alternarConferencia(id) {
    const patrimonio = patrimonios.find(p => p.id === id);
    if (patrimonio) {
        patrimonio.conferido = !patrimonio.conferido;
        patrimonio.dataConferencia = patrimonio.conferido ? new Date().toLocaleString('pt-BR') : null;
        salvarPatrimonios();
        renderizarPatrimonios();

        const status = patrimonio.conferido ? 'conferido' : 'marcado como não conferido';
        mostrarNotificacao(`Patrimônio ${status}!`);
    }
}

// Deletar patrimônio
function deletarPatrimonio(id) {
    if (confirm('Tem certeza que deseja remover este patrimônio?')) {
        patrimonios = patrimonios.filter(p => p.id !== id);
        salvarPatrimonios();
        renderizarPatrimonios();
        
        mostrarNotificacao('Patrimônio removido com sucesso!');
    }
}

// Função para sanitizar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}