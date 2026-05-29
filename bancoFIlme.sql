-- Schema usado pelo server.js (PostgreSQL cria a tabela automaticamente ao iniciar)
CREATE TABLE IF NOT EXISTS filme (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  sinopse TEXT NOT NULL,
  genero VARCHAR(100) NOT NULL,
  data_lancamento VARCHAR(50) NOT NULL
);

-- Consultar filmes salvos pelo formulário:
SELECT * FROM filme ORDER BY id;