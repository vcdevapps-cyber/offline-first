/**
 * SISTEMATIZA - Gestão de Memória Histórica
 * Configurado para Sérgio - Zorin OS 18 / Docker
 */

// 1. Definição do Arquivo Local
const localDB = new PouchDB('salinas_historico');

/** * AJUSTE NECESSÁRIO:
 * Substitua 'SUA_SENHA' pela senha que você criou no comando do Docker.
 */
const remoteDB = new PouchDB('http://admin:j1junior@127.0.0.1:5984/salinas_historico');

const iconeNuvem = document.getElementById('status-conexao');

// 2. Função de Status Visual (O Brilho da Nuvem)
function atualizarStatus(status) {
    if (!iconeNuvem) return;

    switch (status) {
        case 'sincronizando':
        case 'online':
            // Brilho Verde: Segurança e Conexão estabelecida
            iconeNuvem.style.filter = 'drop-shadow(0 0 12px #27ae60)';
            iconeNuvem.style.opacity = '1';
            iconeNuvem.title = "Sincronizado e Protegido no Zorin OS";
            break;
        case 'erro':
            // Brilho Vermelho: Alerta de interrupção
            iconeNuvem.style.filter = 'drop-shadow(0 0 12px #e74c3c)';
            iconeNuvem.style.opacity = '1';
            iconeNuvem.title = "Erro na conexão com o Docker (Verifique o Banco ou CORS)";
            break;
        default:
            iconeNuvem.style.filter = 'grayscale(100%)';
            iconeNuvem.style.opacity = '0.5';
    }
}

// 3. Orquestração da Sincronização (Bidirecional)
localDB.sync(remoteDB, {
    live: true,
    retry: true
}).on('change', function (info) {
    mostrarRegistros();
}).on('active', function () {
    atualizarStatus('sincronizando');
}).on('paused', function () {
    atualizarStatus('online');
}).on('error', function (err) {
    atualizarStatus('erro');
    console.error("Falha de rede no Arquivo Central:", err);
});

// 4. Operações Documentais
async function adicionarRegistro() {
    const titulo = document.getElementById('titulo').value;
    const conteudo = document.getElementById('conteudo').value;

    if (!titulo || !conteudo) {
        alert("Sérgio, o rigor metodológico exige título e conteúdo.");
        return;
    }

    const doc = {
        _id: new Date().toISOString(),
        titulo: titulo,
        conteudo: conteudo,
        data_registro: new Date().toLocaleString('pt-BR'),
        autor: "Sérgio"
    };

    try {
        await localDB.put(doc);
        document.getElementById('titulo').value = '';
        document.getElementById('conteudo').value = '';
        mostrarRegistros();
    } catch (err) {
        console.error("Erro ao arquivar:", err);
    }
}

async function mostrarRegistros() {
    try {
        const result = await localDB.allDocs({ include_docs: true, descending: true });
        const listaDiv = document.getElementById('lista');
        listaDiv.innerHTML = '';

        result.rows.forEach(row => {
            const item = row.doc;
            listaDiv.innerHTML += `
                <article class="card-registro">
                    <span class="data-registro">Registrado em: ${item.data_registro}</span>
                    <h3>${item.titulo}</h3>
                    <p>${item.conteudo}</p>
                    <button onclick="removerRegistro('${item._id}', '${item._rev}')" class="btn-excluir">
                        [Eliminar do Arquivo]
                    </button>
                </article>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar registros:", err);
    }
}

async function removerRegistro(id, rev) {
    if (confirm("Confirmar a exclusão deste fragmento histórico?")) {
        await localDB.remove(id, rev);
        mostrarRegistros();
    }
}

// 5. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    mostrarRegistros();
    const btn = document.getElementById('btnSalvar');
    if (btn) btn.onclick = adicionarRegistro;
});
