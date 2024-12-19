function switch_tab() {
    var tab_content = document.getElementsByClassName("tab_content");
    for (i = 0; i < tab_content.length; i++) {
        tab_content[i].style.display = "none";
    }

    tab_links = document.getElementsByClassName("tab_link");
    for (i = 0; i < tab_links.length; i++) {
        tab_links[i].classList.remove("active_tab")
    }

    this.classList.add("active_tab")
    document.getElementById(this.id.replace("tab-", "")).style.display = "";
}

document.querySelectorAll(".tab_link").forEach(element => {
    element.addEventListener("click", switch_tab);
})