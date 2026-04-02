// ==================Variables==================== //
import {getMonthKey, formatDisplayMonth, escapeHtml} from './utils.js';
import { addFromMonth } from './day.js';

const toPrev = document.getElementById("month-prev");
const monthTitle = document.getElementById("month-title");
const monthToggle = document.getElementById("month-toggle-done");
const toNext = document.getElementById("month-next");
const monthInput = document.getElementById("month-input");
const monthList = document.getElementById("month-list");

let hideMonthCompleted = JSON.parse(localStorage.getItem("hideMonthCompleted")) || false;
let tasks = JSON.parse(localStorage.getItem("monthTasks")) || {};

// ====================Date======================= //

let currentDate = new Date();

function isCurrentMonthReal() {
  return getMonthKey(currentDate) == getMonthKey(new Date());
}

function updateMonthTitle() {
  monthTitle.textContent = formatDisplayMonth(currentDate);

  if (!isCurrentMonthReal()){
    monthTitle.classList.add("month__title--clickable");
  } else {
    monthTitle.classList.remove("month__title--clickable");
  }
}

// ==================Controls===================== //

function goToPrevMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month - 1, 1);
  updateMonthTitle();
  render();
}

function goToCurrentMonth() {
  if (isCurrentMonthReal()) return;

  currentDate = new Date();

  updateMonthTitle();
  render();
}

function goToNextMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month + 1, 1);
  updateMonthTitle();
  render();
}

// =================Toggle button================= //

function updateToggleBtn() {
  const icon = monthToggle.querySelector("i");
  icon.className = hideMonthCompleted ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

function toggleHide() {
  hideMonthCompleted = !hideMonthCompleted;

  updateToggleBtn();
  localStorage.setItem("hideMonthCompleted", JSON.stringify(hideMonthCompleted));
  render();
}

// ================add task======================= //

function addTask() {
  let text = monthInput.value.trim();
  let priority = 2;

  if(!text) return;

  const key = getMonthKey(currentDate);
  if (!tasks[key]) tasks[key] = [];

  if (text.startsWith('1_')){
    text = text.slice(2).trim();
    priority = 1;
  } else if (text.startsWith("3_")){
    text = text.slice(2).trim();
    priority = 3;
  }

  tasks[key].push({
    id: Date.now(),
    text: text,
    priority: priority,
    completed: false,
  });

  monthInput.value = "";
  localStorage.setItem("monthTasks", JSON.stringify(tasks));
  render();

}

// ===================render====================== //


function render() {
  monthList.innerHTML = "";

  const key = getMonthKey(currentDate);
  let monthTasks = tasks[key] || [];
  if (hideMonthCompleted) {
    monthTasks = monthTasks.filter(t => !t.completed);
  }

  const firstUncompletedTasks = monthTasks.filter(t => !t.completed && t.priority==1);
  const secondUncompletedTasks = monthTasks.filter(t => !t.completed && t.priority==2);
  const thirdUncompletedTasks = monthTasks.filter(t => !t.completed && t.priority==3);
  const firstCompletedTasks = monthTasks.filter(t => t.completed && t.priority==1);
  const secondCompletedTasks = monthTasks.filter(t => t.completed && t.priority==2);
  const thirdCompletedTasks = monthTasks.filter(t => t.completed && t.priority==3);

  monthTasks = [...firstUncompletedTasks, ...secondUncompletedTasks, ...thirdUncompletedTasks, ...firstCompletedTasks, ...secondCompletedTasks, ...thirdCompletedTasks];

  if (monthTasks.length === 0){
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "month__item month__item--empty";
    emptyMessage.innerHTML = `
      <p class="month__text month__text--empty">
        ${hideMonthCompleted ? "Нет активных задач ✨" : "Нет задач на этот день 🎉"}
      </p>
    `;
    monthList.appendChild(emptyMessage);
    return;
  }

  monthTasks.forEach(task =>{
    let li = document.createElement("li");
    li.className = `month__item${task.completed ? " month__item--done" : ""}`;
    li.dataset.id = task.id;
    li.innerHTML = `
  <span class="priority priority--${task.priority}" data-action="toggle" data-id="${task.id}">${task.priority}</span>
  <p class="month__text">${escapeHtml(task.text)}</p>
  <div class="month__actions">
	<button class="month__action-btn btn btn--icon" data-action="add" aria-label="Добавить в день" data-id="${task.id}">
	  <i class="fa-solid fa-plus"></i>
	</button>
	<button class="month__action-btn btn btn--icon" data-action="delete" aria-label="Удалить" data-id="${task.id}">
	  <i class="fa-solid fa-trash"></i>
	</button>
  </div>
    `;

    monthList.appendChild(li);
  });
}

// =================list item click=============== //

function handleListClick(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const key = getMonthKey(currentDate);
  
  if (!tasks[key]) return;

  if (action === 'delete'){
    tasks[key] = tasks[key].filter(t => t.id !== id);
    if (tasks[key].length === 0) delete tasks[key];
  } else if (action === 'toggle') {
    const task = tasks[key].find(t => t.id === id);
    if (task) task.completed = !task.completed;
  } else if (action === 'add') {
    const task = tasks[key].find(t => t.id === id);
    if (task) {
      addFromMonth(task.text);
    };
  }

  localStorage.setItem("monthTasks", JSON.stringify(tasks));
  render();
}

// =================init========================== //

export function initMonth() {
  updateMonthTitle();
  updateToggleBtn()

  render();

  toPrev.addEventListener("click", goToPrevMonth);
  monthTitle.addEventListener("click", goToCurrentMonth);
  toNext.addEventListener("click", goToNextMonth);
  monthToggle.addEventListener("click", toggleHide);
  monthInput.addEventListener("keydown", (event) => event.key === "Enter" && addTask());
  monthList.addEventListener("click", handleListClick);
}