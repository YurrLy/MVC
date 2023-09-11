const mongoose = require('mongoose');

const filmeSchema = new mongoose.Schema({
  titulo: String,
  sinopse: String,
  elenco: String,
  direcao: String,
  cartaz: String,
});

const Filme = mongoose.model('Filme', filmeSchema);

module.exports = Filme;
