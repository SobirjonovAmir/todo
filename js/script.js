const form = document.forms.todo
const change_form = document.forms.change
const todo_box = document.querySelector(".todo-box")
const input = form.querySelector("input")
const change_input = change_form.querySelector("input")
const modal = document.querySelector(".modal-bg")
const close_btn = document.querySelector(".close")
const paginationContainer = document.querySelector('#pagination-container');
let todos = []
let globalId

form.onsubmit = (event) => {
	event.preventDefault()
	const currentDate = new Date();
	const hours = currentDate.getHours();
	const minutes = currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes()
	const currentTime = hours + ":" + minutes
	let todo = {
		id: Math.random(),
		completed: false,
		time: currentTime,
	}

	let fm = new FormData(event.target)
	fm.forEach((value, key) => {
		todo[key] = value
	})

	if (!todo.task) {
		return
	}
	getFetch()
		.then(data => {
			data.push(todo)
		})
	paginateTodos(pageSize)
	input.value = ""
}


async function getFetch() {
	const res = await fetch("https://jsonplaceholder.typicode.com/todos");
	const data = await res.json();
	return data;
}

async function paginateTodos(pageSize) {
	const todos = await getFetch();
	const totalTodos = todos.length;
	const totalPages = Math.ceil(totalTodos / pageSize);

	let currentPage = 5;
	let startIndex = 0;
	let endIndex = Math.min(startIndex + pageSize, totalTodos);


	while (startIndex < totalTodos) {
		const currentTodos = todos.slice(startIndex, endIndex);

		currentTodos.forEach(todo => {
			reload(todo)
		});

		currentPage++;
		startIndex = endIndex;
		endIndex = Math.min(startIndex + pageSize, totalTodos);
	}

	for (let i = 1; i <= totalPages; i++) {
		const pageButton = document.createElement('button');
		pageButton.innerText = i;
		pageButton.onclick = () => {
			todo_box.innerHTML = '';

			const startIndex = (i - 1) * pageSize;
			const endIndex = Math.min(startIndex + pageSize, totalTodos);
			const currentTodos = todos.slice(startIndex, endIndex);
			currentTodos.forEach(todo => {
				reload(todo)
			});
		};

		paginationContainer.appendChild(pageButton);
	}
}

const pageSize = 20;
paginateTodos(pageSize);



function reload(item) {
	const box_item = document.createElement("div")
	const item_title = document.createElement("p")
	const item_sub_title = document.createElement("span")
	const delete_btn = document.createElement("span")
	const close_img = document.createElement("img")
	const change_btn = document.createElement("span")
	const change_img = document.createElement("img")

	box_item.classList.add("box-item")
	item_title.classList.add("item-title")
	item_sub_title.classList.add("item-sub-title")
	delete_btn.classList.add("delete-btn")
	change_btn.classList.add("change-btn")

	item_title.title = "click to cross out text"
	item_title.textContent = item.title
	item_sub_title.textContent = item.time
	close_img.src = "img/img.svg"
	change_img.src = "img/pencil.png"

	todo_box.append(box_item)
	change_btn.append(change_img)
	delete_btn.append(close_img)
	box_item.append(item_title, item_sub_title, delete_btn, change_btn)


	delete_btn.onclick = () => {
		let check = confirm(`Вы уверены что хотите удалить ?`);
		if (check) {
			getFetch()
				.then(data => {
					data == data.filter(el => el.id !== item.id)
				})
			box_item.classList.add('delete-anim')
			setTimeout(() => {
				box_item.remove()
			}, 500);
		}
	}


	if (item.isDone) {
		item_title.classList.add("active")
	} else {
		item_title.classList.remove("active")
	}

	item_title.onclick = () => {
		if (!item.isDone) {
			item.isDone = true
			item_title.classList.add("active")
		} else {
			item.isDone = false
			item_title.classList.remove("active")
		}
	}

	change_btn.onclick = () => {
		modal.style.display = "flex"
		change_input.value = item.title
		globalId = item.id

	}
	close_btn.onclick = () => {
		close()
	}
}

function close() {
	change_form.classList.add("close-anim")
	setTimeout(() => {
		modal.style.display = "none"
		change_form.classList.remove("close-anim")
	}, 500);
	getFetch()
		.then(data => {
			reload(data);
		})
	change_input.value = ""
}

change_form.onsubmit = (event) => {
	event.preventDefault()
	let finded;
	getFetch()
		.then(data => {
			finded = data.find(el => el.id === globalId)
		})
	console.log(finded);
	finded.title = change_input.value
	close()
}