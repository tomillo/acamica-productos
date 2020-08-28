const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const path = require('path');

const server = express();

server.use(bodyParser.json());

let arrayUser = [];
let arrayArticle = [];
let idUser = 1;
let idArticle = 1;

server.get('/user' , (req,res) => {
	res.status(200).json(arrayUser)
})

server.post('/user' , (req,res) => {
	const {name, lastName, mail, password } = req.body;

	let userObj = {
		id: idUser,
		name: req.body.name,
		lastName: req.body.lastName,
		mail: req.body.mail,
		password: req.body.password
	};
	
	// Validación formulario
	if (!name || !lastName || !mail || !password) {
		res.status(200).json({
			status: false,
			info: "Todos los campos son obligatorios"
		});
	} else {
		// Email duplicados en array
		const found = arrayUser.some(user => user.mail === mail)
		if (found) {
			return res.status(200).json({
				status: false,
				info: `El email ya existe en la DB`
			});
		} else {
			// Agrega usuario
			arrayUser.push(userObj);
			idUser++;
			
			res.status(200).json({
				status: true,
				info: `Felicidades ${req.body.name}. Ahora debes ingresar tus datos de sesión.`
			});
		}
	}
});
server.post('/user/login', (req,res) => {
	const { mail, password } = req.body;
	let valid = 0;
	let userValid = null;
	
	arrayUser.filter((user) => {
		console.log(user.name);
		let cond = user.mail === mail && user.password === password;
		if (cond) {
			valid += 1;
			userValid = user.id;
		}
	});
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
})

server.post('/user/:id/article' , (req,res) => {
	var form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
		res.status(200).json({
			status: true,
			info: `Se ha ingresado el articulo`
		});
	});

    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/images/' + file.name;
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
	// const {name, description, precio, estado, image, idUser} = req.body;

	// if (!name || !description || !precio || !estado || !image) {
	// 	res.status(200).json({
	// 		status: false,
	// 		info: "Faltan ingresar datos para crear el articulo"
	// 	});
	// } else {
	// 	let article = {
	// 		idArt: idArticle,
	// 		name: req.body.name,
	// 		description: req.body.description,
	// 		precio: req.body.precio,
	// 		estado: req.body.estado,
	// 		image: req.body.image,
	// 		idUser: req.body.idUser
	// 	};
	// 	idArticle++;
	// 	arrayArticle.push(article);
	// 	let paramsId = req.params.id;
	// 	let findId = arrayUser.find(function(user){
	// 		return (user.id == paramsId)
	// 	})
	// 	if(findId.article){
	// 		findId.article.push(article);
	// 	}else{
	// 		findId.article = [article]
	// 	}
	// 	let newObject = {
	// 		id: paramsId,
	// 		name: findId.name,
	// 		lastName: findId.lastName,
	// 		mail: findId.mail,
	// 		password: findId.password,
	// 		article : findId.article
	// 	}
	// 	let indexUser = arrayUser.indexOf(findId);
	// 	arrayUser.splice(indexUser, 1, newObject);

	// 	res.status(200).json({
	// 		status: true,
	// 		info: `Se ha ingresado el articulo ${req.body.name}`
	// 	});
	// }
})
server.get('/article' , (req,res) => {
	if (arrayArticle.length == 0) {
		res.status(200).json({
			status: false,
			info: "No hay productos agregados"
		})
	} else {
		res.status(200).json({
			status: true,
			articles: arrayArticle,
			users: arrayUser
		})
	}
})
server.listen(3000, () => {
	console.log('Server funcionando')
});
// {
//     "id": "1",
//     "name": "Jose",
//     "lastName": "Bortoletto",
//     "mail":"123@gmail.com",
//     "password":"1123"
// }
// {
//     "id": "1",
//     "name": "Mouse",
//     "description": "periferico",
//     "precio":"1000",
//     "estado":"publicado",
//     "image":"https://resource.logitechg.com/w_659,c_limit,f_auto,q_auto:best,f_auto,dpr_2.0/content/dam/gaming/en/products/pro-mouse/promouse-hero.png?v=1"
// }