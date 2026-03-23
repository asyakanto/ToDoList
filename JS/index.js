const dayInput = document.getElementById("day-input");
const dayList = document.getElementById("day-list");
const toggleBtn = document.getElementById("day-toggle-done");

let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
let currentDate = new Date();


function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addTask(){
  key = formatDate(currentDate);
  text = dayInput.value.trim();

  if(!text){return}

  dayInput.value = "";

  if(!tasks[key]){
    tasks[key]= [];
  }

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
  })
  
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
}

function render(){
  const storedTasks = localStorage.getItem("tasks");
  tasks = JSON.parse(storedTasks) || {};

  dayList.innerHTML = "";

  const dayTasks = tasks[formatDate(currentDate)] || [];

  dayTasks.forEach(task => {
    const li = document.createElement("li")
    li.className = "day__item"

    if(task.completed){
      li.classList.add("day__item--done")
    }

    li.dataset.id = task.id
    li.dataset.completed = task.completed

    li.innerHTML = `
          <button class="day__check btn btn--icon" data-action="toggle" aria-label="Вернуть в активные" data-id="${task.id}">
            <i class="${task.completed ? "fa-solid fa-check-square" : "fa-regular fa-square"}"></i>
          </button>
          <p class="day__text">${task.text}</p>
          <div class="day__actions">
            <button class="day__action-btn btn btn--icon" data-action="delete" aria-label="Удалить" data-id="${task.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
    `
    dayList.appendChild(li)  
  }
  )
}

dayInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter"){
    addTask();
  }
})

dayList.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  const key = formatDate(currentDate);

  if (action === "delete") {
    tasks[key] = tasks[key].filter(t => t.id !== id);
  }

  if (action === "toggle") {
    const task = tasks[key].find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
    }
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
});

render()