const
	inputEmail = document.getElementById("inputEmail"),
	inputPassword = document.getElementById("inputPassword"),
	inputName = document.getElementById("inputName"),
	inputLastName = document.getElementById("inputLastName"),
	signupButton = document.getElementById("signupButton"),
	signupContainer = document.querySelector(".signup-container"),
	loginButton = document.getElementById("loginButton"),
	alertSuccess = document.querySelector(".alert-success"),
	alertDanger = document.querySelector(".alert-danger"),
	loginBtn = document.getElementById("loginBtn"),
	logout = document.getElementById("logout"),
	menuGuest = document.querySelector(".menu-guest"),
	menuLogged = document.querySelector(".menu-logged"),
	jumbotronGuest = document.querySelector(".jumbotron-guest"),
	jumbotronLogged = document.querySelector(".jumbotron-logged"),
	formSell = document.getElementById("form-sell"),
	sellDesc = document.getElementById("inputDescription"),
	sellStatus = document.getElementById("selectStatus"),
	sellPrice = document.getElementById("inputPrice"),
	sellImage = document.getElementById("fileImage"),
	sellButton = document.getElementById("sell-button"),
	productsList = document.getElementById("products-list");

let form_res = '';
const lsLogged = localStorage.getItem(localStorage.key("session"));

// FUNCION GLOBAL PARA FORMULARIOS
const form = async (data, endpoint) => {
	const options = {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	}

	let res = await fetch(endpoint, options);
	form_res = await res.json();

	return form_res;
}

// SIGNUP
if (signupButton) signupButton.onclick = async () => {
	data = {
		"name": inputName.value,
		"lastName": inputLastName.value,
		"mail": inputEmail.value,
		"password": inputPassword.value
	}

	const endpoint = 'http://localhost:3000/user';

	try {
		await form(data, endpoint);

		// Comprueba que el registro sea correcto
		if (await form_res.status) {
			window.location = 'login.html?success';
		} else {
			alertDanger.classList.remove("d-none");
			alertDanger.innerText = form_res.info;
			alertSuccess.classList.add("d-none");
		}
	}
	catch(error) {
		console.log(error)
	}
}

// LOGIN
if (loginButton) {
	loginButton.onclick = async () => {
		data = {
			"mail": inputEmail.value,
			"password": inputPassword.value
		}
	
		const endpoint = 'http://localhost:3000/user/login';
	
		try {
			await form(data, endpoint);
	
			// Comprueba que el login sea correcto
			if (await form_res.status) {
				// Agrega LS con sesión iniciada
				localStorage.setItem('session', form_res.ls);

				// Redirige al home
				window.location = 'index.html';
			} else {
				alertDanger.classList.remove("d-none");
				alertDanger.innerText = form_res.info;
				alertSuccess.classList.add("d-none");
			}
		}
		catch(error) {
			console.log(error)
		}
	}

	// Muestra alert de registro éxitoso
	let url = window.location.href;
	if (url.includes('?success')) {
		alertSuccess.classList.remove("d-none");
	}
}

// HOME
if (logout) {
	if (lsLogged) {
		menuLogged.classList.remove("d-none");
		jumbotronLogged.classList.remove("d-none");
	} else {
		menuGuest.classList.remove("d-none");
		jumbotronGuest.classList.remove("d-none");
	}

	logout.onclick = () => {
		// Elimina LS de sesión
		localStorage.removeItem("session");

		// Redirige al home
		window.location = 'index.html';
	}

	// Listado de productos
	const productsListFn = async () => {
		try {
			let res = await fetch('http://localhost:3000/article');
			let products_res = await res.json();

			
			if (products_res.status == true) {
				console.log(products_res);
				productsList.innerHTML = `${products_res.articles.map(product => `
					<div class="col-md-4">
						<div class="card mb-4 box-shadow">
							<img class="card-img-top" src="thumb.svg" alt="Card image cap">
							<div class="card-body">
								<h4>${product.name}</h4>
								<p class="card-text">${product.description}</p>
								<div class="my-2"><a href="" class="user-link">${products_res.users[product.idUser - 1].name} ${products_res.users[product.idUser - 1].lastName}</a></div>
								<div class="d-flex justify-content-between align-items-center">
									<h3>$${product.precio}</h3>
									<button type="button" class="btn btn-md btn-primary">Comprar</button>
								</div>
							</div>
						</div>
					</div>`).join('')}`;
			} else {
				productsList.innerHTML = `<div class="col-md-12 text-center"><h2>${products_res.info}</h2></div>`
			}
		}
		catch(error) {
			console.log(error)
		}
	}
	productsListFn();
}

// SELL
if (formSell) {
	if (lsLogged) {
		sellButton.onclick = async () => {
			const data = {
				"name": inputName.value,
				"description": sellDesc.value,
				"precio": sellPrice.value,
				"estado": "0",
				"idUser": lsLogged
			}
		
			const endpoint = `http://localhost:3000/user/${lsLogged}/article`;
			const files = sellImage.files[0]:
			const formData = new FormData();
			formData.append('image', files);
			formData.append('name', data.name);
			formData.append('description', data.description);
			formData.append('precio', data.precio);
			formData.append('estado', data.estado);
			formData.append('idUser', data.idUser);
			
			fetch(endpoint, {
				method: 'POST',
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				console.log(data)
			})
			.catch(error => {
				console.error(error)
			})

		
			// try {
			// 	await form(data, endpoint);
		
			// 	// Comprueba que la publicación sea correcta
			// 	if (await form_res.status) {
			// 		window.location = 'index.html';
			// 	} else {
			// 		alertDanger.classList.remove("d-none");
			// 		alertDanger.innerText = form_res.info;
			// 	}
			// }
			// catch(error) {
			// 	console.log(error)
			// }
		}
	} else {
		// Redirige al home
		window.location = 'login.html';
	}
}