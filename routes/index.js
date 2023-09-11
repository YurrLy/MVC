const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const filmeController = require('../controllers/filmeController');

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/login', authController.login);
router.post('/cadastro', authController.cadastro);
router.get('/logout', authController.logout);

router.get('/perfil', filmeController.perfil);
router.get('/cadastro-filme', filmeController.cadastroFilme);
router.post('/cadastro-filme', filmeController.cadastrarFilme);
router.get('/filme/:id', filmeController.detalhesFilme);
router.get('/filmes', filmeController.listarFilmes);
router.get('/filme/editar/:id', filmeController.editarFilme);
router.post('/filme/editar/:id', filmeController.salvarEdicaoFilme);
router.post('/filme/apagar/:id', filmeController.apagarFilme);

module.exports = router;
