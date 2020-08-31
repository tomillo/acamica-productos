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
	selectStatus_Act = document.getElementById("status-0"),
	selectStatus_Sell = document.getElementById("status-1"),
	sellButton = document.getElementById("sell-button"),
	productsList = document.getElementById("products-list"),
	home = document.getElementById("home"),
	publications = document.getElementById("publications"),
	publicationsTableCon = document.querySelector(".table"),
	publicationsTable = document.getElementById("publications-table"),
	publicationsEdit = document.getElementById("modal-edit"),
	publicationsBtn_edit = document.getElementsByClassName('btn-edit'),
	publicationsBtn_save = document.querySelector('.btn-save'),
	publicationsBtn_remove = document.getElementsByClassName('btn-delete'),
	publicationsBtn_removeCon = document.querySelector('.btn-delete-confirm');

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
if (signupButton) {
	if (lsLogged) {
		// Redirige al home
		window.location = '/';
	} else {
		signupButton.onclick = async () => {
			data = {
				"name": inputName.value,
				"lastName": inputLastName.value,
				"mail": inputEmail.value,
				"password": inputPassword.value
			}
		
			const endpoint = 'http://localhost:3000/user/signup';
		
			try {
				await form(data, endpoint);
		
				// Comprueba que el registro sea correcto
				if (await form_res.status) {
					window.location = 'login?success';
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
	}
}

// LOGIN
if (loginButton) {
	if (lsLogged) {
		// Redirige al home
		window.location = '/';
	} else {
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
					window.location = '/';
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
}

// HOME
if (home) {
	if (lsLogged) {
		jumbotronLogged.classList.remove("d-none");
	} else {
		jumbotronGuest.classList.remove("d-none");
	}

	logout.onclick = () => {
		// Elimina LS de sesión
		localStorage.removeItem("session");

		// Redirige al home
		window.location = '/';
	}

	// Listado de productos
	const productsListFn = async () => {
		try {
			let res = await fetch('http://localhost:3000/article');
			let products_res = await res.json();

			
			if (products_res.status == true) {
				productsList.innerHTML = `${products_res.articles.map(product => `
					<div class="col-md-4">
						<div class="card mb-4 box-shadow">
							<div class="hit-image-container">
								<img class="hit-image" src="images/${product.image}" alt="${product.name}">
							</div>
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
			const files = sellImage.files[0];
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
				// Comprueba que la publicación sea correcta
				if (data.status) {
					window.location = '/';
				} else {
					alertDanger.classList.remove("d-none");
					alertDanger.innerText = data.info;
				}
			})
			.catch(error => {
				console.error(error)
			})
		}
	} else {
		// Redirige al login
		window.location = 'login';
	}
}

// PUBLICATIONS
if (publications) {
	if (lsLogged) {
		let productsById = ""
		let dataArticle_id = "";
		const publicationsList = async () => {
			try {
				let res = await fetch('http://localhost:3000/article');
				let products_res = await res.json();

				if (products_res.status == true) {
					productsById = products_res.articles.filter(product => product.idUser === lsLogged);


					let table = '';
					for (let i = 0; i < productsById.length; i++) {
						let status = productsById[i].estado == 0 ? "Publicado" : "Vendido";

						table += `<tr>
							<th scope="row">${productsById[i].idArt}</th>
							<td style="width:124px"><img class="img-thumbnail" src="images/${productsById[i].image}" alt="${productsById[i].name}" style="object-fit:cover;min-width:100px;height:100px;"></td>
							<td>${productsById[i].name}</td>
							<td>$${productsById[i].precio}</td>
							<td>${status}</td>
							<td>
								<a class="btn btn-secondary btn-sm btn-edit" data-toggle="modal" data-target="#modal-edit" data-article="${productsById[i].idArt}" title="Editar">
									<span class="oi oi-pencil"></span>
								</a>
								<a class="btn btn-danger btn-sm btn-delete" data-toggle="modal" data-target="#modal-delete" data-article="${productsById[i].idArt}" title="Eliminar">
									<span class="oi oi-trash"></span>
								</a>
							</td>
						</tr>`
					}
					publicationsTable.innerHTML = table;
					
					// EDIT
					// Detecta ID del producto y pega valores en los input
					(() => {
						for(var i = 0; i < publicationsBtn_edit.length; i++){
							publicationsBtn_edit[i].onclick = function(){
								let productArray = products_res.articles.find(product => product.idArt == this.dataset.article);

								dataArticle_id = this.dataset.article;

								inputName.value = productArray.name;
								sellDesc.value = productArray.description;
								sellPrice.value = productArray.precio;
								productArray.estado == 0 ? selectStatus_Act.selected = true : selectStatus_Sell.selected = true;
							}
						}
					})();

					// PUT
					publicationsBtn_save.onclick = async () => {
						const data = {
							"name": inputName.value,
							"description": sellDesc.value,
							"precio": sellPrice.value,
							"estado": sellStatus.value,
							"idUser": lsLogged
						}
					
						const endpoint = `http://localhost:3000/user/${lsLogged}/article/${dataArticle_id}`;
						
						const files = sellImage.files[0];
						const formData = new FormData();
						formData.append('image', files);
						formData.append('name', data.name);
						formData.append('description', data.description);
						formData.append('precio', data.precio);
						formData.append('estado', data.estado);
						formData.append('idUser', data.idUser);
						
						fetch(endpoint, {
							method: 'PUT',
							body: formData
						})
						.then(response => response.json())
						.then(data => {
							// Comprueba que la edición sea correcta
							if (data.status) {
								window.location = '/publications';
							} else {
								alertDanger.classList.remove("d-none");
								alertDanger.innerText = data.info;
							}
						})
						.catch(error => {
							console.error(error)
						})
					}

					// DELETE
					// Detecta ID del producto
					(() => {
						for(var i = 0; i < publicationsBtn_remove.length; i++){
							publicationsBtn_remove[i].onclick = function(){
								dataArticle_id = this.dataset.article;
							}
						}
					})();

					publicationsBtn_removeCon.onclick = async () => {
						const options = {
							method: 'DELETE'
						};
					
						let deleteProd = await fetch(`http://localhost:3000/user/${lsLogged}/article/${dataArticle_id}`, options);
						delete_res = await deleteProd.json();

						// Comprueba el estado de la eliminación
						if (await delete_res.status) {
							alertSuccess.innerText = delete_res.info
							alertSuccess.classList.remove("d-none");
							$('#modal-delete').modal('hide');

							// Refresca tabla de productos
							publicationsList();
							// Limpia tabla al borrar el último producto
							publicationsTableFn(1);
						} else {
							alertDanger.innerText = delete_res.info
							alertDanger.classList.remove("d-none");
						}
					}
				} else {
					publicationsTableFn(0);
				}
			}
			catch(error) {
				console.log(error)
			}
		}

		publicationsList();

		// Mensaje para no mostrar la tabla vacía
		const publicationsTableFn = (number) => {
			if (productsById.length === number) {
				return publicationsTableCon.innerHTML = `
					<div class="text-center">
						<span class="oi oi-heart iconic-lg"></span>
						<h5 class="mb-3">No tienes publicaciones agregadas.</h5>
						<a class="btn btn-primary btn-lg" href="/sell">Vender</a>
					</div>
				`;
			}
		}
	} else {
		// Redirige al login
		window.location = 'login';
	}
}


// MENU
if (home || publications) {
	if (lsLogged) {
		menuLogged.classList.remove("d-none");
	} else {
		menuGuest.classList.remove("d-none");
	}
}