const mysql = require("mysql2");

const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar no MySQL:", erro);
  } else {
    console.log("Conectado ao MySQL com sucesso 🚀");
  }
});

module.exports = db;