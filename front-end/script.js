const listaProdutos = document.getElementById('cardapio');
const divFiltros = document.getElementById('filtros')
const listaCarrinho = document.getElementById('tabeladecompras');
const textoValor = document.getElementById('valor');
const textoMensagem = document.getElementById('mensagem');

let produtosNaTela = [];
const carrinho = [];

function formatarPreco(valor){
    return valor.toFixed(2).replace('.', ',')
}

function desenharProdutos(produtos){
    produtosNaTela = produtos;
    listaProdutos.innerHTML = '';
    
    for (const p of produtos) {
        listaProdutos.innerHTML += `
        <div class="produto">
        <img src="${p.imagem}" alt="${p.nome}">
        <div>
          <h4>${p.nome}</h4>
          <p>${p.descricao ?? ''}</p>
          <p>R$: ${formatarPreco(p.preco)}</p>
        </div>
        <button class="menos" type="button" data-id="${p.id}" ${p.disponivel ? '' : 'disabled'}>
          <p>${p.disponivel ? 'Adicionar' : 'Indisponível'}</p>
        </button>
      </div>`;
    }
}

async function carregarProdutos(categoria) {
  let url = '/menu';
  if (categoria) {
    url += `?categoria=${encodeURIComponent(categoria)}`;
  }

  try {
    const resposta = await fetch(url);
    const produtos = await resposta.json();
    desenharProdutos(produtos);
  } catch (erro) {
    listaProdutos.innerHTML = '<p>Não foi possível carregar o cardápio.</p>';
  }
}

function marcarAtivo(botaoClicado) {
    for (const botao of divFiltros.querySelectorAll('button')){
        botao.classList.remove('ativo')
    }
    botaoClicado.classList.add('ativo')
}

async function criarFiltros() {
  try {
    const resposta = await fetch('/menu/categorias');
    const categorias = await resposta.json();

    for (const nome of ['Todos', ...categorias]) {
      const botao = document.createElement('button');
      botao.textContent = nome;

      botao.addEventListener('click', () => {
        carregarProdutos(nome === 'Todos' ? null : nome);
        marcarAtivo(botao);
      });

      divFiltros.appendChild(botao);
    }

    divFiltros.firstElementChild.classList.add('ativo');   // "Todos" começa ativo
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro);
  }
}

function mostrarMensagem(texto) {
  textoMensagem.textContent = texto;
}

function desenharCarrinho() {
  listaCarrinho.innerHTML = '';
  let total = 0;

  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = '<li>Carrinho vazio</li>';
  }

  for (const item of carrinho) {
    total += item.preco * item.quantidade;

    listaCarrinho.innerHTML += `
      <li>
        <span>${item.quantidade}x ${item.nome} - R$: ${formatarPreco(item.preco * item.quantidade)}</span>
        <button type="button" data-id="${item.id}" data-acao="menos">-</button>
        <button type="button" data-id="${item.id}" data-acao="mais">+</button>
      </li>`;
  }

  textoValor.textContent = `R$: ${formatarPreco(total)}`;
}

function adicionarAoCarrinho(id) {
  const produto = produtosNaTela.find((p) => p.id === id);
  if (!produto) return;

  const item = carrinho.find((i) => i.id === id);

  if (item) {
    item.quantidade += 1;
  } else {
    carrinho.push({ id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1 });
  }

  desenharCarrinho();
  mostrarMensagem(`${produto.nome} adicionado ao carrinho.`);
}

function diminuirDoCarrinho(id) {
  const posicao = carrinho.findIndex((i) => i.id === id);
  if (posicao === -1) return;

  carrinho[posicao].quantidade -= 1;

  if (carrinho[posicao].quantidade === 0) {
    mostrarMensagem(`${carrinho[posicao].nome} removido do carrinho.`);
    carrinho.splice(posicao, 1);
  } else {
    mostrarMensagem(`Quantidade de ${carrinho[posicao].nome} atualizada.`);
  }

  desenharCarrinho();
}

listaProdutos.addEventListener('click', (evento) => {
  const botao = evento.target.closest('button[data-id]');
  if (!botao || botao.disabled) return;

  adicionarAoCarrinho(Number(botao.dataset.id));
});

listaCarrinho.addEventListener('click', (evento) => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  const id = Number(botao.dataset.id);

  if (botao.dataset.acao === 'mais') {
    adicionarAoCarrinho(id);
  } else {
    diminuirDoCarrinho(id);
  }
});

carregarProdutos();
criarFiltros();
desenharCarrinho();