const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secretpassword', resave: true, saveUninitialized: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const dbUri = 'mongodb+srv://kalissonyuri99:lindo13@cluster0.pc0wcxf.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conexão com o MongoDB Atlas estabelecida!');
}).catch((error) => {
  console.error('Erro na conexão com o MongoDB Atlas:', error);
});

const User = mongoose.model('User', {
  nome: String,
  senha: String,
});

const Filme = mongoose.model('Filme', {
  titulo: String,
  sinopse: String,
  elenco: String,
  direcao: String,
  cartaz: String,
});

function requireLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { nome, senha } = req.body;

  try {
    const user = await User.findOne({ nome });

    if (user && await bcrypt.compare(senha, user.senha)) {
      req.session.user = user;
      res.redirect('/perfil');
    } else {
      res.send('Credenciais inválidas');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.send('Erro ao fazer login');
  }
});

app.post('/cadastro', async (req, res) => {
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
});

app.get('/perfil', requireLogin, (req, res) => {
  const mensagem = req.query.mensagem || '';
  res.render('perfil', { nomeUsuario: req.session.user.nome, mensagem });
});

app.get('/cadastro-filme', requireLogin, (req, res) => {
  res.render('cadastro-filme');
});

app.post('/cadastro-filme', requireLogin, upload.single('imagem'), async (req, res) => {
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
});

app.get('/filme/:id', requireLogin, async (req, res) => {
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
});

app.get('/filmes', requireLogin, async (req, res) => {
  try {
    const filmes = await Filme.find();
    res.render('filmes', { filmes });
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).send('Erro ao buscar filmes.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
    }
    res.redirect('/');
  });
});

app.get('/filme/editar/:id', requireLogin, async (req, res) => {
  const filmeId = req.params.id;

  try {
    const filme = await Filme.findById(filmeId);
    if (!filme) {
      res.status(404).send('Filme não encontrado.');
      return;
    }

    res.render('editar-filme', { filme });
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme para edição:', error);
    res.status(500).send('Erro ao buscar detalhes do filme para edição.');
  }
});

app.post('/filme/editar/:id', requireLogin, upload.single('imagem'), async (req, res) => {
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
});

app.post('/filme/apagar/:id', requireLogin, async (req, res) => {
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
});

app.use(express.static('public'));

app.listen(process.env.PORT, () => {
  console.log(`Servidor está rodando em ${process.env.PORT}`);
});

