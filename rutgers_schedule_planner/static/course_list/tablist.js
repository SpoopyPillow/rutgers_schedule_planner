function switch_tab() {
    var tab_content = document.querySelectorAll(".tab_content");
    for (i = 0; i < tab_content.length; i++) {
        tab_content[i].classList.remove("active_content")
    }

    tab_links = document.querySelectorAll(".tab_link");
    for (i = 0; i < tab_links.length; i++) {
        tab_links[i].classList.remove("active_tab")
    }

    this.classList.add("active_tab")
    document.getElementById(this.id.replace("tab-", "")).classList.add("active_content");
}
