const bcrypt = require('bcrypt');
const User = require('../models/User');

async function login(req, res) {
  const { nome, senha } = req.body;

  try {
    const user = await User.findOne({ nome });

    if (user && await user.comparePassword(senha)) {
      req.session.user = user;
      res.redirect('/perfil');
    } else {
      res.send('Credenciais inválidas');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.send('Erro ao fazer login');
  }
}

async function cadastro(req, res) {
  const { novoNome, novaSenha } = req.body;

  try {
    const existingUser = await User.findOne({ nome: novoNome });

    if (existingUser) {
      res.send('Nome de usuário já existe');
    } else {
      const hashedSenha = await bcrypt.hash(novaSenha, 10);
      const newUser = new User({ nome: novoNome, senha: hashedSenha });
      await newUser.save();
      res.redirect('/');
    }
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.send('Erro ao cadastrar usuário');
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
    }
    res.redirect('/');
  });
}

module.exports = { login, cadastro, logout };
