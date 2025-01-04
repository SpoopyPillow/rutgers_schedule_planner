const template_course_information = document.getElementById("template_course_information");
const template_section_information = document.getElementById("template_section_information");
const template_section_class_information = document.getElementById("template_section_class_information");
const template_selected_information = document.getElementById("template_selected_information");
const template_schedule_view = document.getElementById("template_schedule_view");

var selected_courses = [];
var hidden_courses = [];
var selected_sections = [];
var deselected_section_filters = {};

var start_time = "8:00:00";
var end_time = "23:00:00";
