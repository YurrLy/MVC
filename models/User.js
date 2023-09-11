const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nome: String,
  senha: String,
});

userSchema.methods.comparePassword = function (senha) {
  return bcrypt.compare(senha, this.senha);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
