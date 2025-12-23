/**
 * SISTEMATIZA - Arquivo Digital da História de Salinas da Margarida
 * Desenvolvido para o Pesquisador Sérgio
 * Tecnologia: PouchDB + CouchDB (Docker) + PWA
 */

// 1. CONFIGURAÇÕES DOS BANCOS DE DADOS
const localDB = new PouchDB('salinas_historico');

/** * AJUSTE ESTA LINHA: 
 * Substitua 'SUA_SENHA' pela senha que você definiu no comando do Docker.
 * Se for usar no celular, substitua '127.0.0.1' pelo IP do seu Zorin OS.
 */
const remoteDB = new PouchDB('http://admin:j1junior@127.0.0.1:5984/salinas_historico');

const iconeNuvem = document.getElementById('status-conexao');

// 2. REGISTRO DO SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Sistematiza: Arquivista de Cache pronto.'))
            .catch(err => console.error('Erro ao registrar cache:', err));
    });
}

// 3. GESTÃO DO STATUS DE SINCRONIZAÇÃO (A NUVEM)
function atualizarStatus(status) {
    if (!iconeNuvem) return;

    switch (status) {
        case 'sincronizando':
            iconeNuvem.style.color = '#27ae60'; // Verde: Conectado e Ativo
            iconeNuvem.style.filter = 'drop-shadow(0 0 5px #27ae60)';
            iconeNuvem.title = "Sincronização com o Arquivo Central Ativa";
            break;
        case 'erro':
            iconeNuvem.style.color = '#e74c3c'; // Vermelho: Falha de conexão
            iconeNuvem.style.filter = 'drop-shadow(0 0 5px #e74c3c)';
            iconeNuvem.title = "Erro: Servidor CouchDB inacessível";
            break;
        case 'pausado':
            iconeNuvem.style.color = '#27ae60'; // Verde suave: Conectado, mas sem mudanças
            iconeNuvem.style.filter = 'none';
            iconeNuvem.title = "Sincronizado e Protegido";
            break;
        default:
            iconeNuvem.style.color = '#7f8c8d'; // Cinza: Offline
            iconeNuvem.style.filter = 'none';
    }
}

// 4. LÓGICA DE SINCRONIZAÇÃO BIDIRECIONAL
localDB.sync(remoteDB, {
    live: true,
    retry: true
}).on('change', function (info) {
    console.log('Novos dados recebidos do arquivo central.');
    mostrarRegistros();
}).on('active', function () {
    atualizarStatus('sincronizando');
}).on('paused', function (err) {
    atualizarStatus('pausado');
}).on('error', function (err) {
    atualizarStatus('erro');
    console.error('Falha crítica na sincronização:', err);
});

// 5. FUNÇÕES DE OPERAÇÃO HISTORIOGRÁFICA (CRUD)

// Adicionar novo registro
async function adicionarRegistro() {
    const tituloInput = document.getElementById('titulo');
    const conteudoInput = document.getElementById('conteudo');

    if (!tituloInput.value || !conteudoInput.value) {
        alert("Sérgio, é necessário preencher o título e o conteúdo para o arquivamento.");
        return;
    }

    const registro = {
        _id: new Date().toISOString(), // ID baseado no tempo para ordem cronológica
        titulo: tituloInput.value,
        conteudo: conteudoInput.value,
        data_criacao: new Date().toLocaleDateString('pt-BR'),
        hora_criacao: new Date().toLocaleTimeString('pt-BR'),
        autor: "Sérgio"
    };

    try {
        await localDB.put(registro);
        tituloInput.value = '';
        conteudoInput.value = '';
        mostrarRegistros();
        console.log("Registro preservado com sucesso.");
    } catch (err) {
        console.error("Erro ao salvar documento:", err);
    }
}

// Mostrar registros na tela
async function mostrarRegistros() {
    try {
        const resultado = await localDB.allDocs({ include_docs: true, descending: true });
        const listaDiv = document.getElementById('lista');
        listaDiv.innerHTML = '';

        resultado.rows.forEach(row => {
            const doc = row.doc;
            listaDiv.innerHTML += `
                <div class="card-registro">
                    <span class="data-registro">${doc.data_criacao} - ${doc.hora_creacao || ''}</span>
                    <h3>${doc.titulo}</h3>
                    <p>${doc.conteudo}</p>
                    <button onclick="removerRegistro('${doc._id}', '${doc._rev}')" class="btn-excluir">
                        [Eliminar Registro do Arquivo]
                    </button>
                </div>
            `;
        });
    } catch (err) {
        console.error("Erro ao recuperar registros:", err);
    }
}

// Remover registro
async function removerRegistro(id, rev) {
    if (confirm("Deseja realmente eliminar este fragmento de memória? Esta ação é permanente no arquivo central.")) {
        try {
            await localDB.remove(id, rev);
            mostrarRegistros();
        } catch (err) {
            console.error("Erro ao excluir documento:", err);
        }
    }
}

// 6. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    mostrarRegistros();
    
    // Vincula o botão de salvar à função
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.onclick = adicionarRegistro;
    }
});
