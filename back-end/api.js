const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

// banco 
const db = new Database(path.join(__dirname, '..', 'banco', 'banco.db'));
db.pragma('foreign_keys = ON');

// configuraćões
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'front-end')));
app.use('/banco/imagens', express.static(path.join(__dirname, '..', 'banco', 'imagens')));

// Funćões
function formatarProduto(p) {
  return {
    ...p,
    preco: p.preco_centavos / 100,
    disponivel: p.disponivel === 1,
  };
}

// rotas
// cardapio
app.get('/menu', (req, res) => {
  const { categoria } = req.query;
  let produtos;

  if (categoria) {
    produtos = db.prepare('SELECT * FROM produtos WHERE categoria = ?').all(categoria);
  } else {
    produtos = db.prepare('SELECT * FROM produtos').all();
  }

  res.json(produtos.map(formatarProduto));
});

app.get('/menu/categorias', (req, res) => {
  const linhas = db.prepare('SELECT DISTINCT categoria FROM produtos ORDER BY categoria').all();
  res.json(linhas.map((l) => l.categoria));
});

app.get('/menu/:id', (req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(formatarProduto(produto));
});

// ligar 
app.listen(3000, () => console.log('rodando em http://localhost:3000'));