function select_course() {
    const course_data = {
        "school": this.getAttribute("data-school"),
        "subject": this.getAttribute("data-subject"),
        "code": this.getAttribute("data-code"),
        "supplement_code": this.getAttribute("data-supplement_code"),
        "campus_code": this.getAttribute("data-campus_code")
    }

    fetch("select_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(course_data),
    })
        .then(response => response.json())
        .then(data => console.log(data))
}

function remove_course() {
    fetch("remove_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(),
    })
}

document.querySelectorAll(".select_course").forEach(button => {
    button.onclick = select_course;
})

document.querySelectorAll(".remove_course").forEach(button => {
    button.onclick = remove_course;
})