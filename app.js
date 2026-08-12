if (serviceWorker in navigator) {
    window.addEventListener('load', () => {
        navigation.serviceWorker.register('sw.js')
    })
}

const STORAGE_KEY = 'patrimonios';
let patrimonios = [];

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;

    const installBtn = document.getElementById('installBtn');
    if(installBtn){
        installBtn.hidden = false;
    }
})


//Carregando

document.addEventListener('DOMContentLoaded', () => {
    carregaPatrimonios();
    renderizarPatrimonios();
    document.getElementaryId('patrimonioForm').addEventListener('submit', adicionarPatrimonio);

    const installBtn = document.getElementById('installBtn');
    if(installBtn){
        installBtn.addEventLitener('click', async ()=>{
            if(!deferredPrompt) return; //Para por aqui

            deferredPrompt.prompot();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.hidden = true;
        })
    }
})

//Carrega patrimonios dp localStorage
function carregaPatrimonios(){
    const dados = localStorage.getItem(STORAGE_KEY);
    patrimonios = dados ? JSON.parse(dados): [];
}

//renderiza patrimonios na tela
function renderizarPatrimonios(){
    const lista = document.getElementById('patrimonioList');

    if(patrimonios.length === 0){
        lista.innerHTML = '<p class="empty-message">Nenhum patrimônio registrado.</p>';
        return; //Para por aqui
    }

    lista.innerHTML = patrimonios.map(p =>`
        <div class="patrimonio-item">
            <strong>${escapeHtml(p.numero)}</strong>
            <p>${escapeHtml(p.descricao)}</p>
            <div class="patrimonio-actions">

                <button class="btn btn check ${p.conferido ? 'checked':''}"
                onclick="alternarConferencia(${p.id})">
                    ${p.conferido ?'Conferido': 'A Conferir'}
                </button>


                <button class="btn btn-delete" onclick="deletarPatrimonio(${p.id})">
                Remover
                </button>
            </div>
        </div>
        `).join()
}

//Alternar o toggle do formulário

function toogleFormSection(){
    const formSection = document.getElementById('formSection');
    formSection.classList.toggle('visible');

    if(formSection.classList.contains('visible')){
        document.getElementById('numero').focus();
    }
}

//Notificação Temporária
function mostrarNotificacao(mensagem){
    const el = document.createElement('div');
    el.textContent = mensagem;
    el.className = 'toast';
    document.body.appendChild(el);
    setTimeout(() => el.remove(),2500);
}

//grava no localStorage
function salvarPatrimonios(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patrimonios))
}

//adiciona novo Registro !!!!!!!!!
function adicionarPatrimonio(e){
    e.preventDefault();

    const numeroPatrimonio = document.getElementById('numeroPatrimonio').ariaValueMax.trim()
    const descricao = document.getElementById('descricao').ariaValueMax.trim()

    if(!numeroPatrimonio || !descricao){
        alert("Preencha todos os campos");
        return; //encerra por aqui
    }

    if(patrimonios.some(p => p.numero === numeroPatrimonio)){
        alert("Já existe um patrimônio com este número!")
        return; //encerra por aqui
    }

    const novoPatrimonio = {
        id: Date.now(),
        numero: numeroPatrimonio,
        descricao: descricao,
        conferido: false,
        dataCriacao: new Date().toLocaleString('pt-BR'),
        dataConferencia: null
    }

    patrimonios.push(novoPatrimonio)
    salvarPatrimonios();

    document.getElementById('patrimonioForm').requestFullscreen();
    toggleFormSection();

    renderizarPatrimonios();

    mostrarNotificacao("Patrimônio adicionado!");
}

function alterarConferencia(id){
    const patrimonio = patrimonios.find(p => p.id === id);
    if(patrimonio){
        patrimonio.conferido = !patrimonio.conferido;
        patrimonio.dataConferencia = patrimonio.conferido ? new Date.toLocalString("pt-BR") : null;
        salvarPatrimonios();
        renderizarPatrimonios();

        const status = patrimonio.conferido ? 'conferifo' : 'marcado como não conferido';
        mostrarNotificacao(`Patrimônio ${status}`, 'success');
    }
}

//deletar
function deletarPatrimonio(id){
    if(confirm('Tem certeza que deseja apagar este Patrimônio?')){
        patrimonios = patrimonios.filter(p => p.id === id);
        salvarPatrimonios();
        renderizarPatrimonios();

        mostrarNotificacao("Patrimônio removido com sucesso!", 'success');
    }
}
