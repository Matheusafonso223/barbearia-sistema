const express = require("express");
const router = express.Router();
const db = require("../config/db");


router.post("/cadastro", (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  const sql = "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";

  db.query(sql, [nome, email, senha, tipo || "cliente"], (err, result) => {
    if (err) {
  console.error("Erro no cadastro:", err);
  return res.status(500).json({ erro: err.message });
}

    res.json({
      mensagem: "Usuário cadastrado com sucesso",
      id: result.insertId,
    });
  });
});


router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

  db.query(sql, [email, senha], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro no login" });
    }

    if (result.length === 0) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const usuario = result[0];

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  });
});


router.post("/agendar", (req, res) => {
  const { usuario_id, servico, data, hora } = req.body;

  const sql =
    "INSERT INTO agendamentos (usuario_id, servico, data, hora) VALUES (?, ?, ?, ?)";

  db.query(sql, [usuario_id, servico, data, hora], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao agendar" });
    }

    res.json({ mensagem: "Agendamento realizado com sucesso" });
  });
});


router.get("/meus-agendamentos/:id", (req, res) => {
  const usuarioId = req.params.id;

  const sql = `
    SELECT * FROM agendamentos
    WHERE usuario_id = ?
    ORDER BY data DESC, hora DESC
  `;

  db.query(sql, [usuarioId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar agendamentos" });
    }

    res.json(result);
  });
});


router.get("/agendamentos", (req, res) => {
  const { status } = req.query;

  let sql = `
    SELECT a.*, u.nome, u.email
    FROM agendamentos a
    JOIN usuarios u ON a.usuario_id = u.id
  `;

  const params = [];

  if (status) {
    sql += " WHERE a.status = ?";
    params.push(status);
  }

  sql += " ORDER BY a.data DESC, a.hora DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar agendamentos" });
    }

    res.json(result);
  });
});


router.put("/confirmar-agendamento/:id", (req, res) => {
  const id = req.params.id;

  const sql = "UPDATE agendamentos SET status = 'confirmado' WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao confirmar" });
    }

    res.json({ mensagem: "Agendamento confirmado" });
  });
});


router.put("/cancelar-agendamento/:id", (req, res) => {
  const id = req.params.id;

  const sql = "UPDATE agendamentos SET status = 'cancelado' WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao cancelar" });
    }

    res.json({ mensagem: "Agendamento cancelado" });
  });
});


router.get("/usuarios", (req, res) => {
  const sql = `
    SELECT id, nome, email, tipo
    FROM usuarios
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar usuários" });
    }

    res.json(result);
  });
});


router.delete("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  const checkSql = "SELECT tipo FROM usuarios WHERE id = ?";

  db.query(checkSql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao verificar usuário" });
    }

    if (result.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (result[0].tipo === "admin") {
      return res.status(403).json({ erro: "Não é permitido excluir admin" });
    }


    const deleteAgendamentos = "DELETE FROM agendamentos WHERE usuario_id = ?";

    db.query(deleteAgendamentos, [id], (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ erro: "Erro ao excluir agendamentos do usuário" });
      }

      const deleteUsuario = "DELETE FROM usuarios WHERE id = ?";

      db.query(deleteUsuario, [id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ erro: "Erro ao excluir usuário" });
        }

        res.json({ mensagem: "Usuário excluído com sucesso" });
      });
    });
  });
});

module.exports = router;