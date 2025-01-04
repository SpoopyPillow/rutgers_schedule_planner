// function form_values(name) {
//     return Array.from(document.querySelectorAll("input[type=checkbox][name=" + name + "]:checked"))
//         .map(function (element) {
//             return element.getAttribute("value");
//         })
// }

// function cleanup_list() {
//     Array.from(document.querySelectorAll(".course_information"))
//         .filter((course) => {
//             return course.querySelectorAll(".section_information:not([style*='display: none'])").length == 0;
//         })
//         .forEach((element) => {
//             element.style.display = "none";
//         })
// }

// function filter_courses() {
//     const courses = Array.from(document.querySelectorAll(".course_information"));
//     const sections = Array.from(document.querySelectorAll(".section_information"));

//     courses.forEach(element => {
//         element.style.display = ""
//     })
//     sections.forEach(element => {
//         element.style.display = ""
//     })

//     var filters = {};
//     filters.open_status = form_values("open_status");
//     filters.code_level = form_values("code_level");
//     filters.campus = form_values("campus");
//     filters.credits = form_values("credits");
//     filters.school = form_values("school");
//     filters.subject = form_values("subject");
//     filters.core = form_values("core");

//     sections.filter((section) => {
//         return !filters.open_status.includes(section.getAttribute("data-open_status"));
//     })
//         .forEach((element) => {
//             element.style.display = "none";
//         })

//     courses.filter((course) => {
//         return !filters.code_level.includes(course.getAttribute("data-code_level"));
//     })
//         .forEach((element) => {
//             element.style.display = "none";
//         })

//     sections.filter((section) => {
//         var section_classes = section.querySelectorAll(".section_class_information");
//         for (const section_class of section_classes) {
//             if (!filters.campus.includes(section_class.getAttribute("data-campus"))) {
//                 return true;
//             }
//         }
//         return false;
//     })
//         .forEach((element) => {
//             element.style.display = "none";
//         })

//     courses.filter((course) => {
//         return !filters.credits.includes(course.getAttribute("data-credits"));
//     })
//         .forEach((element) => {
//             element.style.display = "none";
//         })

//     courses.filter((course) => {
//         return !filters.school.includes(course.getAttribute("data-school"));
//     })
//         .forEach((element) => {
//             element.style.display = "none";
//         })

//     courses.filter((course) => {
//         return !filters.subject.includes(course.getAttribute("data-subject"));
//     })
//         .forEach((element) => {
//             element.style.display = "none";
//         })

//     courses.filter((course) => {
//         var cores = course.querySelectorAll(".core_information");
//         if (cores.length == 0 && filters.core.includes("N/A")) {
//             return false;
//         }
//         for (const core of cores) {
//             if (filters.core.includes(core.getAttribute("data-core_code"))) {
//                 return false;
//             }
//         }
//         return true;
//     })
//         .forEach((element) => {
//             element.style.display = "none";
//         })

//     cleanup_list();
// }

// document.querySelectorAll("#course_filters input").forEach(element => {
//     element.addEventListener("click", filter_courses)
// })
