const db = new PouchDB('salinas_historico');

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Serviço de Arquivo Ativo (PWA)"))
        .catch(err => console.log("Erro ao ativar arquivo", err));
}

// Função para adicionar registro
async function adicionarRegistro() {
    const titulo = document.getElementById('titulo').value;
    const conteudo = document.getElementById('conteudo').value;

    if (!titulo || !conteudo) {
        alert("Sérgio, por favor, preencha todos os campos do registro.");
        return;
    }

    const registro = {
        _id: new Date().toISOString(),
        titulo: titulo,
        conteudo: conteudo,
        data_criacao: new Date().toLocaleDateString('pt-BR')
    };

    try {
        await db.put(registro);
        document.getElementById('titulo').value = '';
        document.getElementById('conteudo').value = '';
        mostrarRegistros();
    } catch (err) {
        console.error("Erro ao salvar no banco", err);
    }
}

// Função para carregar e exibir os dados
async function mostrarRegistros() {
    const docs = await db.allDocs({include_docs: true, descending: true});
    const listaDiv = document.getElementById('lista');
    listaDiv.innerHTML = '';

    docs.rows.forEach(row => {
        const doc = row.doc;
        listaDiv.innerHTML += `
            <div class="card-registro">
                <span class="data-registro">${doc.data_criacao}</span>
                <h3>${doc.titulo}</h3>
                <p>${doc.conteudo}</p>
                <button onclick="removerRegistro('${doc._id}', '${doc._rev}')" style="background:none; color:red; padding:0; font-size:0.8rem;">[Eliminar Registro]</button>
            </div>
        `;
    });
}

async function removerRegistro(id, rev) {
    if(confirm("Deseja realmente excluir este documento do arquivo?")) {
        await db.remove(id, rev);
        mostrarRegistros();
    }
}

// Inicializar lista ao abrir
mostrarRegistros();