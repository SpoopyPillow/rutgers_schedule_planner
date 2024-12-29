function initalize_collapsible() {
    document.querySelectorAll(".collapsible").forEach((element) => {
        element.onclick = function (event) {
            if (event.target.tagName === "BUTTON") {
                return;
            }
            this.classList.toggle("active_collapsible");
            this.nextElementSibling.style.display = this.nextElementSibling.style.display === "block" ? "none" : "block";
        }
    });
}
