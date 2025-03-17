const express = require('express');
const session = require('express-session');
const axios = require('axios');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();

// Configurar EJS como engine de views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos (correção para o css)
app.use(express.static(path.join(__dirname, 'public')));

// Exibir feedbacks
const flash = require('connect-flash');
app.use(flash());

// Middleware para interpretar os dados do formulário
app.use(express.urlencoded({ extended: true }));

// Configuração do middleware de sessão
app.use(session({
	secret: 'lpweb',
	resave: false,
	saveUninitialized: false
}));

// Inicializar Passport e gerenciar sessão
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
	if (username === 'admin' && password === 'admin') {
		return done(null, { id: 1, username: 'admin' });
	} else {
		return done(null, false, { message: 'Credenciais inválidas.' });
	}
}));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	done(null, { id: 1, username: 'admin' });
});

// URL da API Spring Boot
const apiUrl = 'http://localhost:8080/api/clientes';

// Rota para exibir a tela de login
app.get('/login', (req, res) => {
	res.render('login', { message: req.flash('error') });
});

// Rota para processar o login
app.post('/login', passport.authenticate('local', {
	successRedirect: '/',     // Redireciona para a rota protegida após login bem-sucedido
	failureRedirect: '/login', // Em caso de falha, redireciona de volta para a tela de login
	failureFlash: 'Usuário ou senha incorretos!' // Em caso de falha, exibe feedback
}));

// Rota para logout
app.get('/logout', (req, res, next) => {
	req.logout(function (err) {
		if (err) { return next(err); }
		res.redirect('/login');
	});
});


// Middleware para proteger rotas
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

app.get('/', ensureAuthenticated, async (req, res) => {
	try {
		const response = await axios.get(apiUrl);
		const clientes = response.data;
		res.render('index', { clientes, user: req.user });
	} catch (error) {
		console.error(error);
		res.status(500).send('Erro ao buscar clientes');
	}
});


// Rota para exibir o formulário de cadastro
app.get('/novo', ensureAuthenticated, (req, res) => {
	res.render('cadastro');
});

// Rota para cadastrar um novo cliente
app.post('/novo', ensureAuthenticated, async (req, res) => {
	const { nome, nascimento, cpf, endereco, telefone, email } = req.body;
	try {
		await axios.post(apiUrl,
			{ nome, nascimento, cpf, endereco, telefone, email });
		res.redirect('/');
	} catch (error) {
		console.error(error);
		res.status(500).send('Erro ao cadastrar cliente');
	}
});

// Rota para pesquisar cliente por id
app.get('/pesquisar/:id', ensureAuthenticated, async (req, res) => {
	const { id } = req.params;
	try {
		const response = await axios.get(`${apiUrl}/${id}`);
		const cliente = response.data;
		res.render('index', { clientes: [cliente], user: req.user });
	} catch (error) {
		console.error(error);
		res.redirect('/');
		//res.status(500).send('Erro ao buscar cliente');
	}
});

// Rota para pesquisar cliente por nome
app.get('/pesquisar', ensureAuthenticated, async (req, res) => {
	const { nome } = req.query;  
	try {
	  const response = await axios.get(`${apiUrl}/search`, {
		params: { nome }
	  });
	  const clientes = response.data;
	  res.render('index', { clientes, user: req.user });
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Erro ao buscar cliente');
	}
  });
  

// Rota para exibir formulário de edição
app.get('/editar/:id', ensureAuthenticated, async (req, res) => {
	const { id } = req.params;
	try {
		const response = await axios.get(`${apiUrl}/${id}`);
		const cliente = response.data;
		res.render('editar', { cliente });
	} catch (error) {
		console.error(error);
		res.status(500).send('Erro ao buscar cliente');
	}
});

// Rota para atualizar um cliente
app.post('/editar/:id', ensureAuthenticated, async (req, res) => {
	const { id } = req.params;
	const { nome, nascimento, cpf, endereco, telefone, email } = req.body;
	try {
		await axios.put(`${apiUrl}/${id}`, {
			nome, nascimento, cpf, endereco, telefone, email
		});
		res.redirect('/');
	} catch (error) {
		console.error(error);
		res.status(500).send('Erro ao atualizar cliente');
	}
});

// Rota para excluir um cliente
app.post('/excluir/:id', ensureAuthenticated, async (req, res) => {
	const { id } = req.params;
	try {
		await axios.delete(`${apiUrl}/${id}`);
		res.redirect('/');
	} catch (error) {
		console.error(error);
		res.status(500).send('Erro ao excluir cliente');
	}
});

app.listen(3000, () => {
	console.log('Servidor rodando na porta 3000');
});