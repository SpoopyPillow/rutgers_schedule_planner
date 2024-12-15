var coll = document.getElementsByClassName("collapsible_course");

for (var i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", collapse_course);
}

function collapse_course() {
    this.classList.toggle("active_collapsible");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}