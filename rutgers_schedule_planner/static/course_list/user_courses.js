// function select_course() {
//     let container = document.getElementById("selected_courses");

//     const course_data = {
//         "school": this.getAttribute("data-school"),
//         "subject": this.getAttribute("data-subject"),
//         "code": this.getAttribute("data-code"),
//         "supplement_code": this.getAttribute("data-supplement_code"),
//         "campus_code": this.getAttribute("data-campus_code")
//     }

//     fetch("select_course", {
//         "method": "POST",
//         "headers": {
//             "X-CSRFToken": getCookie("csrftoken"),
//         },
//         "body": JSON.stringify(course_data),
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (!("selected_course" in data)) {
//                 return;
//             }
//             course = data["selected_course"]
//             let div = document.createElement("div");
//             let code = document.createElement("span");
//             div.appendChild(code);

//             code.textContent = course["school"] + ":" + course["subject"] + ":" + course["code"];

//             container.appendChild(div);
//         });
// }

// function remove_course() {
//     fetch("remove_course", {
//         "method": "POST",
//         "headers": {
//             "X-CSRFToken": getCookie("csrftoken"),
//         },
//         "body": JSON.stringify(),
//     })
// }

// function initialize_select_course() {
//     document.querySelectorAll(".select_course").forEach(button => {
//         button.onclick = select_course;
//     })
// }

// function initialize_remove_course() {
//     document.querySelectorAll(".remove_course").forEach(button => {
//         button.onclick = remove_course;
//     })
// }

// initialize_remove_course();