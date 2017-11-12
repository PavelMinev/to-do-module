var ModuleToDo = (function() {
	var ModuleToDo = {};
	ModuleToDo.init = function(element) {
		var app_block = '<div class="task-body"><h1>ToDo list</h1><div class="task-body__input"><h2>Новая</h2><ul class="task-body__input-items"><li>Задача:</li><li><input id="task" type="text" placeholder="Надо сделать..."></li><li>Срок:</li><li><input id="date" type="text" placeholder="01.01.2018"></li><li><button id="add-task">Добавить</button></li><li><button id="delete-tasks">Удалить</button></li></ul></div><div class="task-body__list"><h2>Список задач</h2><div class="task-body__container"><ul class="task-body__items"></ul></div><div class="task-body__filter"><h2><small>Фильтр:</small></h2><ul class="task-body__filter-data"><li class="task-body__filter-items task-body__filter-items--active" data-id="1">Все</li><li class="task-body__filter-items" data-id="2">Сделанные</li><li class="task-body__filter-items" data-id="3">На завтра</li><li class="task-body__filter-items" data-id="4">На неделю</li><li class="task-body__filter-items" data-id="5">Не сделанные</li></ul></div></div><div style="clear: both;"></div></div>';
		// Для добавления в блок с атрибутом class="element" или id="element"
		if (element.indexOf("#") === 0) { // если id задан через #: ModuleToDo.init("#element")
			document.getElementById(element.substring(1,element.length)).innerHTML = app_block;
		} else if (element.indexOf(".") === 0) { // если class задан через .: ModuleToDo.init(".element")
			document.querySelectorAll(element)[0].innerHTML = app_block;
		} else { // воспринимаем остальное, как id: ModuleToDo.init("element")
			document.getElementById(element).innerHTML = app_block;
		};

		var todoList = []; // массив списка дел
		var filter = 1; // фильтр по умолчанию

		// если в LocalStorage уже есть список:
		if (localStorage.getItem("toDo") != undefined) {
			todoList = JSON.parse(localStorage.getItem("toDo"));
			out();
		};

		document.getElementById("add-task").onclick = function(){
			var task = escapeHtml(document.getElementById("task").value);
			var errors = "";
			if (task === "") { // если ничего не введено
				errors += "Введите текст задачи! ";
			};
			var date = document.getElementById("date").value;
			// регулярное выражение для даты deadline:
			var re = /^(((0[1-9]|[12]\d|3[01])\.(0[13578]|1[02])\.((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\.(0[13456789]|1[012])\.((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\.02\.((19|[2-9]\d)\d{2}))|(29\.02\.((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
			var OK = re.exec(date);
			if (OK) { // если дата валидна
				var temp = {}; // временный объект
				temp.todo = task;
				temp.date = date;
				temp.check = false; // не выполнено по умолчанию
				var i =todoList.length;
				todoList[i] = temp; // записываем в массив списка дел
				filter = 1; // при добавлении сбрасываем фильтр на "Все"
				out(); // Выводим список дел
				localStorage.setItem("toDo", JSON.stringify(todoList)); // перезаписываем массив списка дел в LocalStorage
				document.getElementById("task").value = ""; // сбрасываем input задачи
				document.getElementById("date").value = ""; // сбрасываем input срока
			} else {
				errors += "Введите дату в формате дд.мм.гггг!";
				alert(errors);
			}
		};


		var li = document.querySelectorAll(".task-body__filter-items");
		function filterChangeState() {
			for (var i = 0; i < li.length; i++) {
				if (parseInt(li[i].dataset.id) === filter) {
					li[i].className = "task-body__filter-items task-body__filter-items--active";
				} else {
					li[i].className = "task-body__filter-items";
				}
			}			
		};
		for (var i = 0; i < li.length; i++) {
			li[i].onclick = function() {
				filter = parseInt(this.dataset.id); // при клике на элемент фильтра меняем значение переменной filter
				filterChangeState();
				out(); // выводим список дел с учётом фильтра
			};			
		}

		function out() {
			var out = "";
			for (var key in todoList) {
				var checkBox = "";
				var toDoTask = todoList[key].todo;
				if (todoList[key].check === true) {checkBox = " checked"; toDoTask = "<strike>" + toDoTask + "</strike>"};
				if (filter === 1) {
					// Все
					out += "<li class=\"task-body__item\"><span class=\"delete-sign\" data-id=\"" + key + "\">x</span><input class=\"task-body__checkbox\" data-id=\"" + key + "\" type=\"checkbox\"" + checkBox + " id=\"item_" + key + "\"><label for=\"item_" + key + "\"><p><small>" + todoList[key].date + "</small></p><p>" + toDoTask + "</p></label></li>";
				} else if (filter === 2 && todoList[key].check === true) {
					// Сделанные
					out += "<li class=\"task-body__item\"><span class=\"delete-sign\" data-id=\"" + key + "\">x</span><input class=\"task-body__checkbox\" data-id=\"" + key + "\" type=\"checkbox\"" + checkBox + " id=\"item_" + key + "\"><label for=\"item_" + key + "\"><p><small>" + todoList[key].date + "</small></p><p>" + toDoTask + "</p></label></li>";
				} else if (filter === 3) {
					// На завтра
					var today = new Date();
					var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000)); // время завтрашнего дня в мс
					var dayTomorrow = tomorrow.getDate(); // извлекаем из мс день
					var monthTomorrow = tomorrow.getMonth() + 1; // извлекаем из мс месяц; в js месяц отсчитывается с нуля
					var yearTomorrow = tomorrow.getFullYear();  // извлекаем из мс год
					var date = dayTomorrow + "." + monthTomorrow + "." + yearTomorrow;
					if (date === todoList[key].date) { //сравниваем каждую дату из списка с датой завтрашнего дня
						out += "<li class=\"task-body__item\"><span class=\"delete-sign\" data-id=\"" + key + "\">x</span><input class=\"task-body__checkbox\" data-id=\"" + key + "\" type=\"checkbox\"" + checkBox + " id=\"item_" + key + "\"><label for=\"item_" + key + "\"><p><small>" + todoList[key].date + "</small></p><p>" + toDoTask + "</p></label></li>";
					}
				} else if (filter === 4) {
					//На неделю
					var today = new Date();
					var nextWeekDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // дата дня, которыый наступит через неделю
					nextWeekDate = nextWeekDate.getTime();
					var date = todoList[key].date;
					var dateFormatted = date.split(".");
					dateFormatted = new Date(dateFormatted[2] + "-" + dateFormatted[1] + "-" + dateFormatted[0]);
					if (dateFormatted.getTime() <= nextWeekDate && dateFormatted.getTime() >= today.getTime()) { // аналогично, но здесь оставляем в мс и сравниваем даты
						out += "<li class=\"task-body__item\"><span class=\"delete-sign\" data-id=\"" + key + "\">x</span><input class=\"task-body__checkbox\" data-id=\"" + key + "\" type=\"checkbox\"" + checkBox + " id=\"item_" + key + "\"><label for=\"item_" + key + "\"><p><small>" + todoList[key].date + "</small></p><p>" + toDoTask + "</p></label></li>";
					}
				} else if (filter === 5 && todoList[key].check === false) { // все не сделанные дела
					out += "<li class=\"task-body__item\"><span class=\"delete-sign\" data-id=\"" + key + "\">x</span><input class=\"task-body__checkbox\" data-id=\"" + key + "\" type=\"checkbox\"" + checkBox + " id=\"item_" + key + "\"><label for=\"item_" + key + "\"><p><small>" + todoList[key].date + "</small></p><p>" + toDoTask + "</p></label></li>";
				}
			};
			document.getElementsByClassName("task-body__items")[0].innerHTML = out;
		}

		
		// Зададим обработчик click на все чекбоксы отображаемых элементов списка дел
		var ul = document.querySelector(".task-body__items");
		ul.onmouseup = function(e){
			var id = e.target.closest("li").getElementsByTagName("input")[0].dataset.id;
			console.log(e.target.closest("li").getElementsByTagName("input")[0].dataset.id);
			if (e.target.closest("label") === e.target.closest("li").getElementsByTagName("label")[0] || e.target === e.target.closest("li").getElementsByTagName("input")[0]) {
				if (id !== undefined) {
					(todoList[id].check) ? todoList[id].check = false : todoList[id].check = true;
					localStorage.setItem("toDo", JSON.stringify(todoList));
					out();
				};
			};				
		};
		// Зададим обработчик mouseover и mouseleave на все отображаемые элементы списка дел
		ul.onmouseover = function(e) {
			var li = e.target.closest("li");
			if (li) {
				li.firstElementChild.classList.add("delete-sign--visible");
				li.firstElementChild.onclick = function() {
					var temp = [];
					var j = 0;
					for (var k = 0; k < todoList.length; k++) {
						if (k !== parseInt(this.dataset.id)) {
							temp[j] = todoList[k];
							j++;
						};
					};
					todoList = temp;
					out();
					localStorage.setItem("toDo", JSON.stringify(todoList));
				};
				li.onmouseleave = function() {
					li.firstElementChild.classList.remove("delete-sign--visible");
				};
			}
		};

		function escapeHtml(text) { // заменяет все html-теги в строке на кодовые значения
			var map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
			};
			return text.replace(/[&<>"']/g, function(m) { return map[m]; });
		}

		document.getElementById("delete-tasks").onclick = function(){ // удаляем весь список дел
			document.getElementsByClassName("task-body__items")[0].innerHTML = "";
			todoList = [];
			localStorage.clear();
			out();
		};

	};

	return ModuleToDo;

})();