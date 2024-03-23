const rows = document.querySelectorAll(".clickable-row");

for (let row of rows) {
  row.addEventListener("click", (e) => {
    row.nextElementSibling.classList.toggle("hide-row");
  });
}
