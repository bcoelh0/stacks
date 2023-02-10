var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function () {
    this.classList.toggle("active");
    this.querySelector("img").classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
}

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (!openDropdown.classList.contains("hidden")) {
        openDropdown.classList.add("hidden");
      }
    }
  }
};

function dropdown(e) {
  e.target.nextElementSibling.classList.toggle("hidden");
}

const nav = document.getElementById("nav");
nav.querySelector("#button").addEventListener("click", function () {
  nav.querySelector("#modal").classList.toggle("active");
  document.body.classList.toggle("overflow-hidden");
});

function toggleModal(id) {
  document.getElementById(id).classList.toggle("hidden");
}
