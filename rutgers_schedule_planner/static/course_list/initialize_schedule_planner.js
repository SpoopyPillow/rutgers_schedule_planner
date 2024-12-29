function waitForFinish(selector) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element.classList.contains("finished")) {
                clearInterval(interval);
                resolve(element);
            }
        }, 10);
    });
}

const template_course_information = document.getElementById("template_course_information");
const template_section_information = document.getElementById("template_section_information");
const template_section_class_information = document.getElementById("template_section_class_information");
const template_selected_information = document.getElementById("template_selected_information");

initialize_section_selection();

document.querySelectorAll(".tab_link").forEach(element => {
    element.addEventListener("click", switch_tab);
});

document.getElementById("test_display_courses").addEventListener("click", load_courses);

waitForFinish("#selected_list").then((element) => {
    load_courses();
});