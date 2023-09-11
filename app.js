const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
});

app.post('/cadastro', (req, res) => {
    const { newUsername, newPassword } = req.body;
});

app.listen(port, () => {
    console.log(`Servidor está rodando em http://localhost:${port}`);
});
