document.querySelectorAll(".collapsible_course").forEach((element) => {
    element.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            return;
        }
        this.classList.toggle("active_collapsible");
        this.nextElementSibling.style.display = this.nextElementSibling.style.display === "block" ? "none" : "block"
    })
})