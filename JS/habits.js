// ==============Variables======================== //

import { formatDate } from './utils.js';

const habitInput = document.getElementById("habit-input");
const habitGrid = document.getElementById("habit-grid");
const habitAddBtn = document.getElementById("habit-addTask");
const habitEditBtn = document.getElementById("habit-edit-btn");

// Все цели по названию [{id, name, entries: {"2026-04-03" : true, ...}}, {...}]
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let isRedactinHabits = JSON.parse(localStorage.getItem("isRedactinHabits")) || false;

// ==============Days logic======================== //

/**
 * Определяет количество отображаемых дней в зависимости от ширины экрана
 * @returns {number} 5 для мобильных (<700px), 7 для планшетов и ПК
 */
function getNumberOfDays() {
  return window.innerWidth < 700 ? 5 : 7;
}

/**
 * Возвращает массив дат для отображения (последние N дней)
 * @returns {Date[]} массив объектов Date
 */
function getDayList() {
  const days = [];
  const today = new Date();
  const dayCount = getNumberOfDays();
  
  for (let i = dayCount - 1; i >= 0; i--) {
    let day = new Date();
    day.setDate(today.getDate() - i);
    days.push(day);
  }
  return days;
}

// ==============Render============================ //

function render() {
  const days = getDayList();
  const daycount = getNumberOfDays();

  habitGrid.innerHTML = '';

  // Настройка сетки: первая колонка фиксированной ширины, остальные равномерно
  habitGrid.style.gridTemplateColumns = `minmax(100px, 150px) repeat(${daycount}, 1fr)`;

  // Если нет привычек - показываем сообщение
  if (habits.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "habit__empty";
    emptyMessage.textContent = "Добавьте привычку🎀";
    emptyMessage.addEventListener("click", () => habitInput.focus());
    habitGrid.appendChild(emptyMessage);
    return;
  }

  // Пустая ячейка в левом верхнем углу
  const emptyBlock = document.createElement("div");
  emptyBlock.classList.add("habit__day-header");
  habitGrid.appendChild(emptyBlock);

  // Заголовки дней (числа)
  for (let i = 0; i < daycount; i++) {
    const habitTitle = document.createElement("div");
    habitTitle.classList.add("habit__day-header");
    habitTitle.textContent = days[i].getDate();
    habitGrid.appendChild(habitTitle);
  }

  // Отображаем каждую привычку и ячейки для дней
  habits.forEach(habit => {
    // Блок с названием привычки и кнопкой удаления
    const habitName = document.createElement("div");
    habitName.className = "habit__name";

    const habitSpan = document.createElement("span");
    habitSpan.textContent = habit.name;
    habitSpan.classList.add("habitSpan");
    habitName.appendChild(habitSpan);

    if (isRedactinHabits) {
      const habitButton = document.createElement('button');
      habitButton.className = "habit__delete-btn";
      habitButton.dataset.habitId = habit.id;
      habitButton.textContent = "✕";
      habitButton.addEventListener("click", deleteHabit);
      habitName.appendChild(habitButton);

      habitSpan.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        editHabit(habit, habitSpan);
      })
    };

    habitGrid.appendChild(habitName);


    // Ячейки для каждого дня
    for (let i = 0; i < daycount; i++) {
      const day = days[i];
      const formatedDay = formatDate(day);

      const habitCell = document.createElement('div');
      const isDone = habit.entries?.[formatedDay] || false;
      habitCell.classList.add('habit__cell');
      if (isDone) habitCell.classList.add("habit__cell--done");
      habitCell.dataset.habitId = habit.id;
      habitCell.dataset.date = formatedDay;

      habitGrid.appendChild(habitCell);
    }
  });
}
// ==============Add habit========================= //

function editHabit (habit, element){
  const originalText = habit.name;
  const originalElement = element;

  if (originalElement) {
    const input = document.createElement("div");
    input.className = "edit-input input";
    input.contentEditable = "true";
    input.textContent=originalText;

    originalElement.replaceWith(input);
    input.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(input);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);


    input.addEventListener("blur", () =>{
      const newName = input.textContent.trim();
      if(newName && newName!==originalText){
        habit.name = newName;
        localStorage.setItem("habits", JSON.stringify(habits));
      }
      render();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        input.blur()
      } else if(event.key === "Escape") {
        render();
      }
    });
  }
}

// ==============Add habit========================= //

function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return;

  habits.push({
    id: Date.now(),
    name: name,
    entries: {},
  });

  habitInput.value = "";
  localStorage.setItem("habits", JSON.stringify(habits));
  render();
}

// ==============Delete habit====================== //

function deleteHabit(event) {
  const btn = event.target.closest("button");
  if (!btn) return;

  const ID = Number(btn.dataset.habitId);
  habits = habits.filter(h => h.id !== ID);

  localStorage.setItem("habits", JSON.stringify(habits));
  render();
}

// ==============Toggle habit done================= //

function handleClick(event) {
  const cell = event.target.closest(".habit__cell");
  if (!cell) return;

  const ID = Number(cell.dataset.habitId);
  const date = cell.dataset.date;

  const habit = habits.find(h => h.id === ID);
  if (habit) {
    if (!habit.entries) habit.entries = {};
    habit.entries[date] = !habit.entries[date];
    localStorage.setItem("habits", JSON.stringify(habits));
    render();
  }
}

// ==============Redacting Mode==================== //

function turnRedactingMode() {
  isRedactinHabits = !isRedactinHabits;
  updateRedactingicon()

  localStorage.setItem("isRedactinHabits", JSON.stringify(isRedactinHabits));
  render();
}

function updateRedactingicon() {
  const icon = habitEditBtn.querySelector("i");
  if (isRedactinHabits) {
    icon.className = "fa-solid fa-times";
    habitEditBtn.classList.add("habit__edit-btn--active");
  } else {
    icon.className = "fa-solid fa-pencil";
    habitEditBtn.classList.remove("habit__edit-btn--active");
  }
}

// ==============Init============================== //

export function initHabits() {
  render();
  habitInput.addEventListener("keydown", (event) => event.key === "Enter" && addHabit());
  habitGrid.addEventListener("click", handleClick);
  habitAddBtn.addEventListener("click", addHabit);
  habitEditBtn.addEventListener("click", turnRedactingMode);
  updateRedactingicon()
}