const express = require('express');
const axios = require('axios');
const app = express();

// URL da sua API Spring Boot
const apiUrl = 'http://localhost:8080/api/clientes';

// (Exemplo de rota simples)
// app.get('/', (req, res) => {
//   res.send('Criando minha primeira rota!');
// });

// Rota para listar os clientes
app.get('/', async (req, res) => {
	try {
		const response = await axios.get(apiUrl);
		const clientes = response.data;
		res.render('index', { clientes });
	} catch (error) {
		console.error(error);
		res.status(500).send('Erro ao buscar clientes');
	}
});

// Rota para exibir o formulário de cadastro
app.get('/novo', (req, res) => {
	res.render('cadastro');
});

// Rota para cadastrar um novo cliente
app.post('/novo', async (req, res) => {
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

// Rota para exibir formulário de edição
app.get('/editar/:id', async (req, res) => {
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
app.post('/editar/:id', async (req, res) => {
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
app.post('/excluir/:id', async (req, res) => {
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