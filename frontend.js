const STORAGE_KEY = 'filmes-favoritos-v1';

const FILMES_INICIAIS = [
  {
    id: 1,
    nome: 'Casablanca',
    sinopse: 'Um romance intenso em meio � Segunda Guerra Mundial.',
    genero: 'Drama',
    data_lancamento: '03/01/1942',
  },
  {
    id: 2,
    nome: 'Titanic',
    sinopse: 'Uma hist�ria de amor em uma trag�dia hist�rica.',
    genero: 'Romance',
    data_lancamento: '19/12/1997',
  },
];

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

function obterFilmesLocais() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(FILMES_INICIAIS));
      return FILMES_INICIAIS;
    }
    const filmes = JSON.parse(dados);
    return Array.isArray(filmes) && filmes.length > 0 ? filmes : FILMES_INICIAIS;
  } catch (error) {
    return FILMES_INICIAIS;
  }
}

function salvarFilmesLocais(filmes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filmes));
}

function renderizarFilmes(filmes) {
  if (!filmes || filmes.length === 0) {
    listaStatus.textContent = 'Nenhum filme na sua lista ainda.';
    gridFilmes.innerHTML = '';
    return;
  }

  gridFilmes.innerHTML = filmes.map((f) => criarCardFilme(f)).join('');
  listaStatus.textContent = `${filmes.length} filme(s) na sua lista`;
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo || ''}`.trim();
}

function criarCardFilme(filme) {
  return `
    <article class="card-filme" data-id="${filme.id}">
      <div class="card-filme__topo"></div>
      <div class="card-filme__corpo">
        <span class="card-filme__genero">${escaparHtml(filme.genero)}</span>
        <h3 class="card-filme__nome">${escaparHtml(filme.nome)}</h3>
        <p class="card-filme__sinopse">${escaparHtml(filme.sinopse)}</p>
        <span class="card-filme__data">Lan�amento: ${escaparHtml(filme.data_lancamento)}</span>
      </div>
      <div class="card-filme__rodape">
        <button type="button" class="btn-excluir" data-id="${filme.id}" aria-label="Excluir ${escaparHtml(filme.nome)}">
          Excluir
        </button>
      </div>
    </article>`;
}

function carregarFilmes() {
  const filmes = obterFilmesLocais();
  renderizarFilmes(filmes);
}

gridFilmes.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-excluir');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const nome = btn.closest('.card-filme')?.querySelector('.card-filme__nome')?.textContent;

  if (!confirm(`Remover "${nome}" da lista?`)) return;

  btn.disabled = true;
  btn.textContent = 'Excluindo...';

  try {
    const filmes = obterFilmesLocais().filter((filme) => Number(filme.id) !== id);
    salvarFilmesLocais(filmes);
    mostrarMensagem('Filme removido com sucesso.', 'sucesso');
    carregarFilmes();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Excluir';
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const filme = {
    id: Date.now(),
    nome: nomeFilme.value.trim(),
    sinopse: sinopseFilme.value.trim(),
    genero: generoFilme.value.trim(),
    data_lancamento: dataLancamentoFilme.value.trim(),
  };

  if (!filme.nome || !filme.sinopse || !filme.genero || !filme.data_lancamento) {
    mostrarMensagem('Preencha todos os campos.', 'erro');
    return;
  }

  const filmes = obterFilmesLocais();
  salvarFilmesLocais([filme, ...filmes]);

  mostrarMensagem('Filme adicionado com sucesso.', 'sucesso');
  form.reset();
  carregarFilmes();
});

carregarFilmes();
