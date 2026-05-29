const API_FILMES =
  window.location.protocol === 'file:'
    ? 'http://localhost:3000/bancoFilme'
    : `${window.location.origin}/bancoFilme`;

const form = document.getElementById('filmes-form');
const nomeFilme = document.getElementById('nome-filme');
const sinopseFilme = document.getElementById('sinopse-filme');
const generoFilme = document.getElementById('genero-filme');
const dataLancamentoFilme = document.getElementById('data-lancamento-filme');
const mensagem = document.getElementById('mensagem');
const listaStatus = document.getElementById('lista-status');
const gridFilmes = document.getElementById('grid-filmes');

function escaparHtml(texto) {
  const el = document.createElement('span');
  el.textContent = texto;
  return el.innerHTML;
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo || ''}`.trim();
}

async function carregarFilmes() {
  listaStatus.textContent = 'Carregando...';
  listaStatus.className = 'lista-status';
  gridFilmes.innerHTML = '';

  try {
    const res = await fetch(API_FILMES);
    const filmes = await res.json();

    if (!res.ok) {
      throw new Error(filmes.message || 'Erro ao buscar filmes.');
    }

    if (filmes.length === 0) {
      listaStatus.textContent = 'Nenhum filme na sua lista ainda.';
      return;
    }

    gridFilmes.innerHTML = filmes.map((f) => criarCardFilme(f)).join('');
    listaStatus.textContent = `${filmes.length} filme(s) na sua lista`;
  } catch (err) {
    const semServidor =
      err.message === 'Failed to fetch' || err.name === 'TypeError';
    listaStatus.textContent = semServidor
      ? 'Servidor offline. Rode "node server.js".'
      : err.message;
    listaStatus.className = 'lista-status erro';
  }
}

function criarCardFilme(filme) {
  return `
    <article class="card-filme" data-id="${filme.id}">
      <div class="card-filme__topo"></div>
      <div class="card-filme__corpo">
        <span class="card-filme__genero">${escaparHtml(filme.genero)}</span>
        <h3 class="card-filme__nome">${escaparHtml(filme.nome)}</h3>
        <p class="card-filme__sinopse">${escaparHtml(filme.sinopse)}</p>
        <span class="card-filme__data">Lançamento: ${escaparHtml(filme.data_lancamento)}</span>
      </div>
      <div class="card-filme__rodape">
        <button type="button" class="btn-excluir" data-id="${filme.id}" aria-label="Excluir ${escaparHtml(filme.nome)}">
          Excluir
        </button>
      </div>
    </article>`;
}

async function excluirFilme(id) {
  const res = await fetch(`${API_FILMES}/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Erro ao excluir filme.');
  }

  return data;
}

gridFilmes.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-excluir');
  if (!btn) return;

  const id = btn.dataset.id;
  const nome = btn.closest('.card-filme')?.querySelector('.card-filme__nome')?.textContent;

  if (!confirm(`Remover "${nome}" da lista?`)) return;

  btn.disabled = true;
  btn.textContent = 'Excluindo...';

  try {
    const data = await excluirFilme(id);
    mostrarMensagem(data.message, 'sucesso');
    await carregarFilmes();
  } catch (err) {
    const semServidor =
      err.message === 'Failed to fetch' || err.name === 'TypeError';
    mostrarMensagem(
      semServidor
        ? 'Servidor offline. Rode "node server.js".'
        : err.message,
      'erro'
    );
    btn.disabled = false;
    btn.textContent = 'Excluir';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const filme = {
    nome: nomeFilme.value.trim(),
    sinopse: sinopseFilme.value.trim(),
    genero: generoFilme.value.trim(),
    dataLancamento: dataLancamentoFilme.value.trim(),
  };

  mostrarMensagem('Salvando...', '');

  try {
    const res = await fetch(API_FILMES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filme),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Erro ao adicionar filme.');
    }

    mostrarMensagem(data.message, 'sucesso');
    form.reset();
    await carregarFilmes();
  } catch (err) {
    const semServidor =
      err.message === 'Failed to fetch' || err.name === 'TypeError';
    mostrarMensagem(
      semServidor
        ? 'Servidor offline. Rode "node server.js" e use http://localhost:3000'
        : err.message,
      'erro'
    );
  }
});

carregarFilmes();
