const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

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

// Movemos a conexão com o MongoDB para cá e estabelecemos a conexão uma única vez
mongoose.connect('mongodb+srv://kalissonyuri99:lindo13@cluster0.pc0wcxf.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conexão com o MongoDB estabelecida!');
}).catch((error) => {
  console.error('Erro na conexão com o MongoDB:', error);
});

// Importe suas rotas aqui
const routes = require('./routes');
app.use('/', routes);

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
