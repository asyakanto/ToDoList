import { formatDate, escapeHtml} from './utils.js';

const dayInput = document.getElementById("day-input");
const dayList = document.getElementById("day-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
let currentDate = new Date();

function addTask() {
  const text = dayInput.value.trim();
  if (!text) return;

  const key = formatDate(currentDate);

  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
  });

  dayInput.value = "";
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
}

function render() {
  dayList.innerHTML = "";
  const dayTasks = tasks[formatDate(currentDate)] || [];

  dayTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `day__item${task.completed ? " day__item--done" : ""}`;
    li.dataset.id = task.id;

    li.innerHTML = `
    <button class="day__check btn btn--icon" data-action="toggle" data-id="${task.id}">
      <i class="${task.completed ? "fa-solid fa-check-square" : "fa-regular fa-square"}"></i>
    </button>
    <p class="day__text">${escapeHtml(task.text)}</p>
    <div class="day__actions">
      <button class="day__action-btn btn btn--icon" data-action="delete" data-id="${task.id}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
      `;
      dayList.appendChild(li);
  });
}

function handleDayListClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const key = formatDate(currentDate);

  if (!tasks[key]) return;

  if (action == "delete") {
    tasks[key] = tasks[key].filter(t => t.id !== id);
  } else if (action == "toggle") {
    const task = tasks[key].find(t => t.id === id);
    if (task) task.completed = !task.completed;
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
}

export function initDay() {
  render();
  dayInput.addEventListener("keydown", (event) => event.key === "Enter" && addTask());
  dayList.addEventListener("click", handleDayListClick);
}