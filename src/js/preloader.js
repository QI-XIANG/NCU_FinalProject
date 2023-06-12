/*載入中圖示*/
let preloader = document.querySelector("#preloader");
let footer = document.querySelector(".footer");
let controls = document.querySelector(".controls");
let table_container = document.querySelector(".table-container");
if (preloader) {
    window.addEventListener("load", () => {
        preloader.remove();
        footer.style.opacity = "1.0";
        controls.style.opacity = "1.0";
        table_container.style.opacity = "1.0";
    });
}