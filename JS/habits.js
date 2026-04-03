// ==============Variables======================== //

import { formatDate } from './utils.js';

const habitInput = document.getElementById("habit-input");
const habitGrid = document.getElementById("habit-grid");

// Все цели по названию [{id, name, entries: {"2026-04-03" : true, ...}}, {...}]
let habits = JSON.parse(localStorage.getItem("habits")) || [];

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
    
    const habitButton = document.createElement('button');
    habitButton.className = "habit__delete-btn";
    habitButton.dataset.habitId = habit.id;
    habitButton.textContent = "✕";
    habitButton.addEventListener("click", deleteHabit);

    habitName.appendChild(habitSpan);
    habitName.appendChild(habitButton);
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

// ==============Init============================== //

export function initHabits() {
  render();
  habitInput.addEventListener("keydown", (event) => event.key === "Enter" && addHabit());
  habitGrid.addEventListener("click", handleClick);
}