const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Filme = require('../models/Filme');

function perfil(req, res) {
  const mensagem = req.query.mensagem || '';
  res.render('perfil', { nomeUsuario: req.session.user.nome, mensagem });
}

function cadastroFilme(req, res) {
  res.render('cadastro-filme');
}

async function cadastrarFilme(req, res) {
  const { titulo, sinopse, elenco, direcao } = req.body;

  try {
    const cartaz = req.file ? '/uploads/' + req.file.filename : '';
    const novoFilme = new Filme({
      titulo,
      sinopse,
      elenco,
      direcao,
      cartaz,
    });

    await novoFilme.save();

    res.redirect('/perfil?mensagem=Filme+cadastrado+com+sucesso');
  } catch (error) {
    console.error('Erro ao cadastrar filme:', error);
    res.redirect('/perfil?mensagem=Erro+ao+cadastrar+filme');
  }
}

async function detalhesFilme(req, res) {
  const filmeId = req.params.id;

  try {
    const filme = await Filme.findById(filmeId);
    if (!filme) {
      res.status(404).send('Filme não encontrado.');
      return;
    }

    res.render('filme', { filme });
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    res.status(500).send('Erro ao buscar detalhes do filme.');
  }
}

async function listarFilmes(req, res) {
  try {
    const filmes = await Filme.find();
    res.render('filmes', { filmes });
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).send('Erro ao buscar filmes.');
  }
}

async function editarFilme(req, res) {
  const filmeId = req.params.id;

  try {
    const filme = await Filme.findById(filmeId);

    if (!filme) {
      return res.status(404).send('Filme não encontrado.');
    }

    res.render('editar-filme', { filme });
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme para edição:', error);
    res.status(500).send('Erro ao buscar detalhes do filme para edição.');
  }
}

async function salvarEdicaoFilme(req, res) {
  const filmeId = req.params.id;
  const { titulo, sinopse, elenco, direcao, cartaz } = req.body;

  try {
    const filme = await Filme.findById(filmeId);
    if (!filme) {
      res.status(404).send('Filme não encontrado.');
      return;
    }

    filme.titulo = titulo;
    filme.sinopse = sinopse;
    filme.elenco = elenco;
    filme.direcao = direcao;
    filme.cartaz = cartaz;

    if (req.file) {
      filme.cartaz = '/uploads/' + req.file.filename;
    }

    await filme.save();

    res.redirect('/filme/' + filmeId);
  } catch (error) {
    console.error('Erro ao editar filme:', error);
    res.status(500).send('Erro ao editar filme.');
  }
}

async function apagarFilme(req, res) {
  const filmeId = req.params.id;

  try {
    const filme = await Filme.findById(filmeId);
    if (!filme) {
      res.status(404).send('Filme não encontrado.');
      return;
    }

    const imagemDoFilme = filme.cartaz;

    await Filme.findByIdAndRemove(filmeId);

    if (imagemDoFilme) {
      const caminhoDaImagem = path.join(__dirname, 'public', imagemDoFilme);
      fs.unlinkSync(caminhoDaImagem);
    }

    res.redirect('/filmes');
  } catch (error) {
    console.error('Erro ao apagar filme:', error);
    res.status(500).send('Erro ao apagar filme.');
  }
}

module.exports = {
  perfil,
  cadastroFilme,
  cadastrarFilme,
  detalhesFilme,
  listarFilmes,
  editarFilme,
  salvarEdicaoFilme,
  apagarFilme,
};
