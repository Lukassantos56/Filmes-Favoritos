require('dotenv').config();

const path = require('path');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME || 'bancoFilme';
const isCloudDb = Boolean(process.env.DATABASE_URL);

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function createPool(options = {}) {
  if (process.env.DATABASE_URL) {
    const config = { connectionString: process.env.DATABASE_URL };
    if (!process.env.DATABASE_URL.includes('localhost')) {
      config.ssl = { rejectUnauthorized: false };
    }
    return new Pool(config);
  }

  return new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    database: options.database ?? DB_NAME,
  });
}

let pool;

async function ensureDatabase() {
  if (isCloudDb) {
    pool = createPool();
    return;
  }

  const admin = createPool({ database: 'postgres' });
  try {
    const { rowCount } = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [DB_NAME]
    );
    if (rowCount === 0) {
      await admin.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Banco "${DB_NAME}" criado.`);
    }
  } finally {
    await admin.end();
  }

  pool = createPool();
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS filme (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      sinopse TEXT NOT NULL,
      genero VARCHAR(100) NOT NULL,
      data_lancamento VARCHAR(50) NOT NULL
    )
  `);
}

app.post('/bancoFilme', async (req, res) => {
  try {
    const { nome, sinopse, genero, dataLancamento } = req.body;

    if (!nome || !sinopse || !genero || !dataLancamento) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }

    const query = `
      INSERT INTO filme (nome, sinopse, genero, data_lancamento)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [nome, sinopse, genero, dataLancamento];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Filme adicionado com sucesso',
      filme: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Erro ao salvar filme.',
      detalhe: err.message,
    });
  }
});

app.get('/bancoFilme', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM filme ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Erro ao buscar filmes.',
      detalhe: err.message,
    });
  }
});

app.delete('/bancoFilme/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const result = await pool.query(
      'DELETE FROM filme WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Filme não encontrado.' });
    }

    res.json({
      message: 'Filme removido com sucesso',
      filme: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Erro ao excluir filme.',
      detalhe: err.message,
    });
  }
});

async function start() {
  try {
    await ensureDatabase();
    await initDb();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Falha ao iniciar:', err.message);
    process.exit(1);
  }
}

start();
