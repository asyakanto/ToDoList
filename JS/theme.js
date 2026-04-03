// ==============Variables======================== //

const themeButton = document.getElementById("theme-btn");
const body = document.body;
const icon = themeButton.querySelector("i");

// Загружаем сохраненную тему (false = темная по умолчанию)
let lightTheme = JSON.parse(localStorage.getItem("theme")) || false;

// ==============Update theme====================== //

/**
 * Обновляет внешний вид в зависимости от текущей темы
 * Добавляет/удаляет класс light у body и меняет иконку
 */
function updateTheme() {
  if (lightTheme) {
    // Светлая тема: добавляем класс light, иконка солнца
    body.classList.add("light");
    icon.className = "fa-solid fa-sun btn--icon";
  } else {
    // Темная тема: убираем класс light, иконка луны
    body.classList.remove("light");
    icon.className = "fa-solid fa-moon btn--icon";
  }
}

// ==============Switch theme====================== //

/**
 * Переключает тему: меняет состояние lightTheme,
 * сохраняет выбор в localStorage и обновляет интерфейс
 */
function switchTheme() {
  lightTheme = !lightTheme;
  localStorage.setItem("theme", JSON.stringify(lightTheme));
  updateTheme();
}

// ==============Init============================== //

export function initTheme() {
  updateTheme();
  themeButton.addEventListener("click", switchTheme);
}