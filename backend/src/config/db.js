const mysql = require("mysql2");

let db;

if (process.env.DATABASE_URL) {
  db = mysql.createConnection(process.env.DATABASE_URL);
} else {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
}

db.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar no MySQL:", erro);
  } else {
    console.log("Conectado ao MySQL com sucesso");
  }
});

module.exports = db;