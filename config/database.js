const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: process.env.DB_SSL // En producción, considera usar true con los certificados adecuados
  }
});

pool.on('connect', () => {
  console.log('Conexión a la base de datos PostgreSQL establecida');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a PostgreSQL:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};