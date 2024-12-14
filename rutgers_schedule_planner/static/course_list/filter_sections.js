function filter_sections() {
    var sections = document.getElementsByClassName("section_information");
    var filters = {};

    var form_open_status = document.getElementsByName("open_status");
    filters.open_status = []
    for (var i = 0; i < form_open_status.length; i++) {
        if (form_open_status[i].checked) {
            filters.open_status.push(form_open_status[i].getAttribute("value"));
        }
    }

    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];

        var open_status = section.getAttribute("data-open_status");
        if (filters.open_status.includes(open_status)) {
            section.style.display = "block";
        }
        else {
            section.style.display = "none";
        }
    }
}

filter_sections();