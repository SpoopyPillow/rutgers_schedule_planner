function form_json(id) {
    const form = new FormData(document.getElementById(id));
    return Object.fromEntries(Array.from(form.keys()).map(key => [key, form.getAll(key).length > 1 ? form.getAll(key) : form.get(key)]))
}

function display_courses() {
    let container = document.getElementById(course_list);

    const form_data = {
        "student_form": form_json("student_form"),
        "course_search_form": form_json("course_search_form"),
        "course_filter_form": form_json("course_filter_form")
    }

    for (const [key, value] of Object.entries(form_data["course_filter_form"])) {
        console.log(key, value);
    }

    fetch("display_courses", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(form_data),
    })
        .then(response => response.json())
        .then(data => console.log(data));
}

document.getElementById("test_display_courses").addEventListener("click", display_courses);
display_courses()