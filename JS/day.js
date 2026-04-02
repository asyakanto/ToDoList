// ==============Variables======================== //

import {formatDate, escapeHtml, formatDisplayDate} from './utils.js';

const dayInput = document.getElementById("day-input");
const dayList = document.getElementById("day-list");
const toggleBtn = document.getElementById("day-toggle-done");
const toNext = document.getElementById("day-next");
const dayTitle = document.getElementById("day-title");
const toPrev = document.getElementById("day-prev");

let hideCompleted = JSON.parse(localStorage.getItem("hideCompleted")) || false;
let tasks = JSON.parse(localStorage.getItem("dayTasks")) || {};

// ==============Date============================= //

function getCurrentRealDate() {
  let now = new Date();
  if (now.getHours() < 2){
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return yesterday;
  }
  return now;
}

let currentDate = getCurrentRealDate();

function isCurrentDateReal() {
  return formatDate(currentDate) === formatDate(getCurrentRealDate());
}

function updateDayTitle() {
  dayTitle.textContent = formatDisplayDate(currentDate);

  if (!isCurrentDateReal()) {
    dayTitle.classList.add("day__title--clickable");
  } else {
    dayTitle.classList.remove("day__title--clickable");
  }
}

// =================Controls====================== //

function goToPrevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDayTitle();
  render();
}

function goToToday() {
  if (isCurrentDateReal()) return;

  currentDate = getCurrentRealDate();

  updateDayTitle();
  render();
}

function goToNextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDayTitle();
  render();
}

// ================Toggle btn===================== //

function updateToggleBtn () {
  const icon = toggleBtn.querySelector("i");
  icon.className = hideCompleted ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

function toggleHide() {
  hideCompleted = !hideCompleted;
  localStorage.setItem("hideCompleted", JSON.stringify(hideCompleted));

  updateToggleBtn();
  render();
}

// =================add task====================== //

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
  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

// ================render========================= //

function render() {
  dayList.innerHTML = "";

  const key = formatDate(currentDate);
  let dayTasks = tasks[key] || [];

  if(hideCompleted) {
    dayTasks = dayTasks.filter(t => !t.completed);
  }
  const completedTasks = dayTasks.filter(t => t.completed);
  const unCompletedTasks = dayTasks.filter(t => !t.completed);
  dayTasks = [...unCompletedTasks, ...completedTasks];

  if (dayTasks.length === 0){
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "day__item day__item--empty";
    emptyMessage.innerHTML = `
      <p class="day__text day__text--empty">
        ${hideCompleted ? "Нет активных задач ✨" : "Нет задач на этот день 🎉"}
      </p>
    `;
    dayList.appendChild(emptyMessage);
    return;
  }

  dayTasks.forEach(task => {
    let li = document.createElement("li");
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
  })
}

// ===============list item clicks================ //

function handleListClick (event) {
  const btn = event.target.closest("button");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const key = formatDate(currentDate);

  if (!tasks[key]) return;

  if (action === "delete") {
    tasks[key] = tasks[key].filter(t => t.id !== id);
    if (tasks[key].length === 0) delete tasks[key];
  } else if (action === 'toggle') {
    const task = tasks[key].find(t => t.id === id);
    if (task) task.completed = !task.completed;
  }

  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

// ===================Add from months============= //

export function addFromMonth (text) {
  const key = formatDate(currentDate);
  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
  })

  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

// =================init========================== //


export function initDay() {
  updateDayTitle();
  updateToggleBtn();

  render();

  dayInput.addEventListener("keydown", (event) => event.key === "Enter" && addTask());
  toPrev.addEventListener('click', goToPrevDay);
  dayTitle.addEventListener("click", goToToday);
  toNext.addEventListener("click", goToNextDay);
  toggleBtn.addEventListener('click', toggleHide);
  dayList.addEventListener("click", handleListClick);
}