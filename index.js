const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session'); // Adicione esta linha
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secretpassword', resave: true, saveUninitialized: true })); // Configuração da sessão

// Substitua com a sua string de conexão do MongoDB Atlas
const dbUri = 'mongodb+srv://kalissonyuri99:lindo13@cluster0.pc0wcxf.mongodb.net/?retryWrites=true&w=majority';

// Conecte ao MongoDB Atlas
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conexão com o MongoDB Atlas estabelecida!');
  })
  .catch((error) => {
    console.error('Erro na conexão com o MongoDB Atlas:', error);
  });

// Defina um modelo para usuários
const User = mongoose.model('User', {
  nome: String,
  senha: String,
});

// Defina um modelo para filmes
const Filme = mongoose.model('Filme', {
  titulo: String,
  sinopse: String,
  elenco: String,
  direcao: String,
  cartaz: String,
});

// Middleware para verificar se o usuário está autenticado
function requireLogin(req, res, next) {
  if (req.session.user) {
    // Se o usuário estiver autenticado, continue
    next();
  } else {
    // Caso contrário, redirecione para a página de login
    res.redirect('/');
  }
}

// Rota para a página de login e cadastro

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { nome, senha } = req.body;

  try {
    const user = await User.findOne({ nome });

    if (user && await bcrypt.compare(senha, user.senha)) {
      // Autenticação bem-sucedida, armazene o usuário na sessão
      req.session.user = user;
      res.redirect('/perfil');
    } else {
      // Credenciais inválidas
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
      // Nome de usuário já existe
      res.send('Nome de usuário já existe');
    } else {
      // Hash da senha antes de salvar no banco de dados
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

// Rota para a página de perfil após o login

app.get('/perfil', requireLogin, (req, res) => {
  res.render('perfil', { nomeUsuario: req.session.user.nome });
});

// Rota para a página de cadastro de filmes

app.get('/cadastro-filme', requireLogin, (req, res) => {
  res.render('cadastro-filme');
});

app.post('/cadastro-filme', requireLogin, async (req, res) => {
    const { titulo, sinopse, elenco, direcao, cartaz } = req.body;
  
    try {
      const novoFilme = new Filme({
        titulo,
        sinopse,
        elenco,
        direcao,
        cartaz,
      });
  
      await novoFilme.save();
      res.redirect('/perfil'); // Redireciona para a página de perfil após o cadastro do filme
    } catch (error) {
      console.error('Erro ao cadastrar filme:', error);
      res.send('Erro ao cadastrar filme.');
    }
  });

// Rota para a página de filmes cadastrados

app.get('/filme/:id', requireLogin, async (req, res) => {
    const filmeId = req.params.id;
  
    try {
      const filme = await Filme.findById(filmeId);
      if (!filme) {
        // Trate o caso em que o filme não foi encontrado
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

  // Rota para logout
app.get('/logout', (req, res) => {
    // Destruir a sessão do usuário
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao fazer logout:', err);
      }
      // Redirecionar para a página de login após o logout
      res.redirect('/');
    });
  });  
  

app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
