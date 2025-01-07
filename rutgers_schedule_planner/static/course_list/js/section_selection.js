function load_section_filters(form) {
    const container = document.getElementById("section_filters");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    container.innerHTML = form;

    container.querySelectorAll("input").forEach(element => {
        if (element.name in deselected_section_filters
            && deselected_section_filters[element.name].includes(element.value)) {
            element.checked = false;
            element.onclick = function () {
                filter_sections();
                select_section_filter(this);
            }
        }
        else {
            element.checked = true;
            element.onclick = function () {
                filter_sections();
                deselect_section_filter(this);
            }
        }
    });

    filter_sections();
}

function deselect_section_filter(element) {
    fetch("deselect_section_filter", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({
            "name": element.name,
            "value": element.value
        }),
    })
        .then(response => response.json())
        .then(data => {
            deselected_section_filters = data["deselected_section_filters"];

            element.checked = false;
            element.onclick = function () {
                filter_sections();
                select_section_filter(element);
            }
        });
}

function select_section_filter(element) {
    fetch("select_section_filter", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({
            "name": element.name,
            "value": element.value
        }),
    })
        .then(response => response.json())
        .then(data => {
            deselected_section_filters = data["deselected_section_filters"];

            element.checked = true;
            element.onclick = function () {
                filter_sections();
                deselect_section_filter(element);
            }
        });
}


function select_course(course, target) {
    fetch("select_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
    })
        .then(response => response.json())
        .then(data => {
            if (!("selected_course" in data)) {
                return;
            }
            const course = data["selected_course"];

            if (target != null) {
                target.textContent = "-";
                target.onclick = function () {
                    remove_course(course, target);
                }
            }

            selected_courses.push(course);
            selected_sections.push(new Array(course["sections"].length).fill(1));
            hidden_courses.push(0);
            schedule.push(-1);

            append_selected(course, target);
            load_section_filters(data["section_filter_form"]);
        });
}

function remove_course(course, target) {
    fetch("remove_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
    })
        .then(response => response.json())
        .then(data => {
            const index = data["index"];
            if (index == -1) {
                return;
            }

            if (target != null) {
                target.textContent = "+";
                target.onclick = function () {
                    select_course(course, target);
                }
            }

            selected_courses.splice(index, 1);
            selected_sections.splice(index, 1);
            hidden_courses.splice(index, 1);
            schedule.splice(index, 1);

            pop_selected(index);
            load_section_filters(data["section_filter_form"]);
        });
}

function hide_course(course) {
    fetch("hide_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
    })
        .then(response => response.json())
        .then(data => {
            const index = data["index"];
            if (index == -1) {
                return;
            }
            hidden_courses[index] = 1;

            const selected = document.querySelectorAll("#section_selection .selected_information")[index];
            const course_information = document.querySelectorAll("#section_selection .course_information")[index];

            selected.classList.add("user_hidden");
            selected.querySelector(".user_course").textContent = "h";
            selected.querySelector(".user_course").onclick = function () {
                show_course(course);
            }

            course_information.style.display = "none";

            load_section_filters(data["section_filter_form"]);
        })
}

function show_course(course) {
    fetch("show_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
    })
        .then(response => response.json())
        .then(data => {
            const index = data["index"];
            if (index == -1) {
                return;
            }
            hidden_courses[index] = 0;

            const selected = document.querySelectorAll("#section_selection .selected_information")[index];
            const course_information = document.querySelectorAll("#section_selection .course_information")[index];

            selected.classList.remove("user_hidden");
            selected.querySelector(".user_course").textContent = "v";
            selected.querySelector(".user_course").onclick = function () {
                hide_course(course);
            }

            course_information.style.display = "";

            load_section_filters(data["section_filter_form"]);
        })
}

function append_selected(course, target, hidden = false) {
    const course_index = selected_courses.length - 1;

    // COURSE SELECTION SIDEBAR
    const cselected_list = document.querySelector("#course_selection .selected_list");
    const cselected_information = template_selected_information.content.cloneNode(true);
    cselected_information.querySelector(".selected_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    cselected_information.querySelector(".user_course").textContent = "-";
    cselected_information.querySelector(".user_course").onclick = function () {
        remove_course(course, target);
    }
    cselected_list.appendChild(cselected_information);


    // SECTION SELECTION SIDEBAR
    const sselected_list = document.querySelector("#section_selection .selected_list");
    const sselected_information = template_selected_information.content.cloneNode(true);
    sselected_information.querySelector(".selected_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    if (!hidden) {
        sselected_information.querySelector(".user_course").textContent = "v";
        sselected_information.querySelector(".user_course").onclick = function () {
            hide_course(course);
        }
    }
    else {
        sselected_information.querySelector(".selected_information").classList.add("user_hidden");
        sselected_information.querySelector(".user_course").textContent = "h";
        sselected_information.querySelector(".user_course").onclick = function () {
            show_course(course);
        }
    }

    sselected_list.appendChild(sselected_information);


    // SECTION LIST
    const section_list = document.getElementById("section_list");
    const course_information = create_course_information(course);
    course_information.querySelector(".user_course").textContent = "v";
    course_information.querySelector(".user_course").onclick = function () {
        hide_course(course);
    }

    if (!hidden) {
        course_information.querySelector(".course_information").style.display = "";
    }
    else {
        course_information.querySelector(".course_information").style.display = "none";
    }

    // Create checkboxes
    const thead_tr = course_information.querySelector("thead tr");
    const th = document.createElement("th");
    const thead_tr_checkbox = document.createElement("input");
    thead_tr_checkbox.className = "select_all_sections";
    thead_tr_checkbox.type = "checkbox";
    thead_tr_checkbox.checked = true;
    thead_tr_checkbox.onclick = function () {
        select_all_sections(course);
    }

    th.appendChild(thead_tr_checkbox);
    thead_tr.insertBefore(th, thead_tr.firstChild);

    const section_information_list = course_information.querySelectorAll(".section_information");
    for (var i = 0; i < course["sections"].length; i++) {
        const section_index = i;
        const section_information = section_information_list[section_index];

        const td = document.createElement("td");
        const section_information_checkbox = document.createElement("input");
        section_information_checkbox.className = "select_section";
        section_information_checkbox.type = "checkbox";
        if (selected_sections[course_index][section_index] == 1) {
            section_information_checkbox.checked = true;
        }
        else {
            section_information_checkbox.checked = false;
        }
        section_information_checkbox.onclick = function () {
            select_section(course, section_index);
        }

        td.appendChild(section_information_checkbox);
        section_information.insertBefore(td, section_information.firstChild);
    }
    section_list.appendChild(course_information);

    initialize_collapsible();
}

function pop_selected(index) {
    // COURSE SELECTION SIDEBAR
    const cselected = document.querySelectorAll("#course_selection .selected_information")[index];
    while (cselected.firstChild) {
        cselected.removeChild(cselected.lastChild);
    }
    cselected.remove();


    // SECTION SELECTION SIDEBAR
    const sselected = document.querySelectorAll("#section_selection .selected_information")[index];
    while (sselected.firstChild) {
        sselected.removeChild(sselected.lastChild);
    }
    sselected.remove();


    // SECTION LIST
    const section = document.querySelectorAll("#section_list .course_information")[index];
    while (section.firstChild) {
        section.removeChild(section.lastChild);
    }
    section.remove();
}

function select_section(course, section_index) {
    const course_index = selected_courses.indexOf(course);

    fetch("select_section", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({
            "course_index": course_index,
            "section_index": section_index
        })
    })
        .then(response => response.json())
        .then(data => {
            selected_sections[course_index][section_index] = data["selected"];
        })
}

function select_all_sections(course) {
    const course_index = selected_courses.indexOf(course);
    const section_list = document.getElementById("section_list");
    const checked = section_list.querySelectorAll(".select_all_sections")[course_index].checked;

    selected_sections[course_index].fill(checked ? 1 : 0);
    section_list.querySelectorAll(".select_section").forEach(element => {
        element.checked = checked;
    })

    fetch("select_all_sections", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({
            "course_index": course_index,
            "checked": checked
        })
    })
}

function initialize_section_selection() {
    fetch("get_selected_courses", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
    })
        .then(response => response.json())
        .then(data => {
            deselected_section_filters = data["deselected_section_filters"];

            for (var i = 0; i < data["selected_courses"].length; i++) {
                const selected_course = data["selected_courses"][i];
                const selected_section = data["selected_sections"][i];
                const hidden_course = data["hidden_courses"][i];

                selected_courses.push(selected_course);
                selected_sections.push(selected_section);
                hidden_courses.push(hidden_course);

                append_selected(selected_course, null, hidden_course);
            }

            load_section_filters(data["section_filter_form"]);

            document.querySelector("#course_selection .selected_list").classList.add("finished");
        });
}
