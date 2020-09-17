// NODE MODULES
const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs').promises;
const methodOverride = require('method-override')

// SERVER DECLARE
const server = express();

// override with the X-HTTP-Method-Override header in the request
server.use(methodOverride('_method'))

// BODYPARSER DECLARE
server.use(bodyParser.json());

// STATIC path for forntend
server.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));
server.use('/images', express.static(path.join(__dirname, '..', 'backend', 'images')));

const mysql = require("./db/mysql_connection")
mysql.init()
.then(async () => {
	console.log('DB connected');
}).catch((err) => {
	console.log('Error al conectar a la db', err);
});	

// DATABASE
let db = {
	files: {
		users: path.join('db', 'users.json'),
		products: path.join('db', 'products.json')
	},
	users: {
		add: async (data, callback) => {
			let users;
			let usersAdd;
			users = await db.users.list();
			// users.push(data);
			// usersAdd = await fs.writeFile(db.files.users, JSON.stringify(users), 'utf8');
			usersAdd = mysql.query(`INSERT INTO users(name, lastname, mail, password, id_permisos) VALUES('${data.name}', '${data.lastName}', '${data.mail}', '${data.password}', '${data.id_permisos}')`); 
			users = await db.users.list();
			return users;
		},
		list: async (callback) => {
			let data = mysql.sequelize.query(`SELECT u.name, u.lastName, u.mail, u.password, p.name FROM users u INNER JOIN permisos p ON u.id_permisos = p.id`,
			{
				type: mysql.Sequelize.QueryTypes.SELECT,
				raw: true,
				plain: false,
				logging: console.log
			}
			).then(resultados => resultados);
			// let data = await fs.readFile(db.files.users, 'utf8');
			return (data) ? data : [];
		}
	},
	products: {
		add: async (data, callback) => {
			let products;
			let productsAdd;
			products = await db.products.list();
			// products.push(data);
			// productsAdd = await fs.writeFile(db.files.products, JSON.stringify(products), 'utf8');
			productsAdd = mysql.query(`INSERT INTO products(name, description, precio, id_estado, id_user, image) VALUES('${data.name}', '${data.description}', '${data.precio}', '${data.estado}', '${data.idUser}', '${data.image}')`);
			
			products = await db.products.list();
			return products;
		},
		edit: async (data, index, callback) => {
			let products;
			let productsAdd;
			products = await db.products.list();
			products[index - 1] = data;
			productsAdd = await fs.writeFile(db.files.products, JSON.stringify(products), 'utf8');
			products = await db.products.list();
			return products;
		},
		delete: async (index, callback) => {
			let products;
			let productsDel;
			let productsAdd;
			products = await db.products.list();
			productsDel = products.filter(product => product.idArt != parseInt(index));
			productsAdd = await fs.writeFile(db.files.products, JSON.stringify(productsDel), 'utf8');
			products = await db.products.list();
			return products;
		},
		list: async (callback) => {
			let data = await fs.readFile(db.files.products, 'utf8');
			return (data) ? JSON.parse(data) : [];
		}
	}
};

// ROUTES
server.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

server.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

server.get('/signup', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'signup.html'));
});

server.get('/sell', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'sell.html'));
});

server.get('/publications', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'publications.html'));
});

// REQUEST
server.get('/user', (req, res) => {
	user_list(req, res)
})

server.post('/user/signup', (req, res) => {
	user_signup(req, res);
});

server.post('/user/login', (req, res) => {
	user_login(req, res);
})

server.get('/article', (req, res) => {
	article_get(req, res)
});

server.post('/user/:id/article', (req, res) => {
	article_set(req, res);
});

server.get('/user/:id/article', (req, res) => {
	article_edit_get(req, res);
});

server.put('/user/:id/article/:idArt', (req, res) => {
	article_edit_put(req, res);
});

server.delete('/user/:id/article/:idArt', (req, res) => {
	article_delete(req, res);
});

server.listen(3000, () => {
	console.log('Server funcionando');
});


// FUNCTIONS (MODULES)
function user_list(req, res) {
	(async () => {
		var users = await db.users.list();
		res.status(200).json(users)
	})();
}

function user_signup(req, res) {
	const {
		name,
		lastName,
		mail,
		password
	} = req.body;

	let userObj = {
		// id: 0,
		name: req.body.name,
		lastName: req.body.lastName,
		mail: req.body.mail,
		password: req.body.password,
		id_permisos: 3
	};

	// Validación formulario
	if (!name || !lastName || !mail || !password) {
		res.status(200).json({
			status: false,
			info: "Todos los campos son obligatorios"
		});
	} else {
		// Email duplicados en array
		(async () => {

			let users = await db.users.list();
			let found = users.some(user => user.mail === mail);

			if (found) {
				return res.status(200).json({
					status: false,
					info: `El email ya existe en la DB`
				});
			} else {
				// Agrega usuario
				// idUser = (users.length) ? parseInt((users[users.length - 1].id) + 1) : 1;
				// userObj.id = idUser;
				await db.users.add(userObj);
				res.status(200).json({
					status: true,
					info: `Felicidades ${req.body.name}. Ahora debes ingresar tus datos de sesión.`
				});
			}
		})()
	}
}

function user_login(req, res) {
	const {
		mail,
		password
	} = req.body;
	let valid = 0;
	let userValid = null;

	(async () => {

		let users = await db.users.list();
		let userFind = users.find(user => user.mail === mail && user.password === password);

		if (userFind) {
			valid += 1;
			userValid = userFind.id;
		}

		if (valid > 0) {
			res.status(200).json({
				status: true,
				info: "Sesion iniciada",
				ls: userValid
			});
		} else {
			res.status(200).json({
				status: false,
				info: "Los datos no coinciden",
				ls: userValid
			});
		}
	})()
}

function article_set(req, res) {
	let
		form = new formidable.IncomingForm(),
		idArticle = 0,
		imageEnd_ = '';

	(async () => {

		let products = await db.products.list();
		idArticle = (products.length) ? parseInt((products[products.length - 1].idArt) + 1) : 1;

		form.parse(req, (err, fields, files) => {
			//console.log(files);

			(async () => {

				let article = {
					// idArt: Number(idArticle),
					name: fields.name,
					description: fields.description,
					precio: fields.precio,
					estado: fields.estado,
					idUser: fields.idUser,
					image: imageEnd_
				};

				await db.products.add(article);

				res.status(200).json({
					status: true,
					info: `Se ha ingresado el articulo`
				});

			})();

		});

		form.on('fileBegin', function(name, file) {

			let
				ext = /[^.]+$/.exec(file.name)[0],
				imageEnd = (idArticle) + "." + ext.toLowerCase();
			imageEnd_ = imageEnd;
			file.path = __dirname + '/images/' + imageEnd;

		});

		form.on('file', function(name, file) {
			console.log('Uploaded ' + file.name);
		});
	})()
}

function article_edit_get(req, res) {
	(async () => {
		let	products = await db.products.list();
		const productId = products.find(product => product.idArt == req.params.id);

		if (productId) {
			res.status(200).json({
				status: true,
				articles: productId
			});
		} else {
			res.status(200).json({
				status: false,
				info: "Este producto no existe"
			});
		}
		
		// if (products.length == 0) {
		// 	res.status(200).json({
		// 		status: false,
		// 		info: "No hay productos agregados"
		// 	})
		// } else {
		// 	res.status(200).json({
		// 		status: true,
		// 		articles: products,
		// 		users: users
		// 	})
		// }
	})();
}

function article_edit_put(req, res) {
	let
		form = new formidable.IncomingForm(),
		idArticle = 0,
		imageEnd_ = '';

	(async () => {

		let products = await db.products.list();
		const productId = products.find(product => product.idArt == req.params.idArt);

		if (productId) {
			form.parse(req, (err, fields, files) => {
				(async () => {
					let article = {}

					// Si carga imagen lo reemplaza, caso contrario mantiene la misma cargada
					if (form.bytesReceived > 707) {
						article = {
							idArt: req.params.idArt,
							name: fields.name,
							description: fields.description,
							precio: fields.precio,
							estado: fields.estado,
							idUser: fields.idUser,
							image: imageEnd_
						};
					} else  {
						article = {
							idArt: req.params.idArt,
							name: fields.name,
							description: fields.description,
							precio: fields.precio,
							estado: fields.estado,
							idUser: fields.idUser,
							image: products[req.params.idArt - 1].image
						}
					}
					await db.products.edit(article, req.params.idArt);
	
					res.status(200).json({
						status: true,
						info: `Se ha modificado el producto`
					});
	
				})();
	
			});
	
			form.on('fileBegin', function(name, file) {
				if (form.bytesReceived > 707) {
					let
						ext = /[^.]+$/.exec(file.name)[0],
						imageEnd = (req.params.idArt) + "." + ext.toLowerCase();
					imageEnd_ = imageEnd;
					file.path = __dirname + '/images/' + imageEnd;
				}
			});
	
			form.on('file', function(name, file) {
				console.log('Uploaded ' + file.name);
			});

			// Send error message back to client.
			form.on('error', function (message) {
				console.log(message);
			});
		} else {
			res.status(200).json({
				status: false,
				info: "Este producto no existe"
			});
		}
	})()
}

function article_delete(req, res) {
	(async () => {
		let products = await db.products.list();
		const productId = products.find(product => product.idArt == req.params.idArt);

		if (productId) {
			await db.products.delete(req.params.idArt);

			// Borra imagen
			fs.unlink(path.join('images', productId.image), (err) => {
				if (err) {
					console.error(err)
					return
				}
			});
			res.status(200).json({
				status: true,
				info: "El producto ha sido eliminado"
			})
		} else {
			res.status(200).json({
				status: false,
				info: "El producto no puede eliminarse porque no existe o no tienes los privilegios"
			})
		}
	})();
}

function article_get(req, res) {
	(async () => {
		let
			products = await db.products.list(),
			users = await db.users.list();

		if (products.length == 0) {
			res.status(200).json({
				status: false,
				info: "No hay productos agregados"
			})
		} else {
			res.status(200).json({
				status: true,
				articles: products,
				users: users
			})
		}
	})();
}