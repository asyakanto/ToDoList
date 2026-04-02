const themeButton = document.getElementById("theme-btn");
const body = document.body;
const icon = themeButton.querySelector("i");

let lightTheme = JSON.parse(localStorage.getItem("theme")) || false;

function updateTheme() {
  if (lightTheme) {
    body.classList.add("light");
    icon.className = "fa-solid fa-sun btn--icon";
  } else {
    body.classList.remove("light");
    icon.className = "fa-solid fa-moon btn--icon";
  }
}

function switchTheme() {
  lightTheme = !lightTheme;
  localStorage.setItem("theme", JSON.stringify(lightTheme));
  updateTheme();
}

export function initTheme() {
  updateTheme();
  themeButton.addEventListener("click", switchTheme);
}