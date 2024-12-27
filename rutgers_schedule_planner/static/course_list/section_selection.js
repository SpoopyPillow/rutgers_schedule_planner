function update_section_filters(form) {
    const container = document.getElementById("section_filters");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    container.innerHTML = form;
}

function update_section_selection() {
    fetch("update_section_selection", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(),
    })
        .then(response => response.json())
        .then(data => {
            if (!("selected_courses" in data)) {
                return;
            }
            const courses = data["selected_courses"];
            const form = data["section_filter_form"];

            update_section_filters(form);
        });
}

update_section_selection();