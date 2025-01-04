function waitForElement(selector) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }
        }, 10);
    });
}

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

initialize_section_selection();

document.querySelectorAll(".tab_link").forEach(element => {
    element.addEventListener("click", switch_tab);
});

document.getElementById("test_display_courses").addEventListener("click", load_courses);

waitForFinish("#course_selection .selected_list").then((element) => {
    load_courses();
    filter_sections();

    load_schedule_view();
    waitForElement("#schedule_builder .schedule_view").then((element) => {
        console.log(selected_courses);
        check_valid_sections([[0, 10], [1, 4], [2, 5]]);
    });
});
