$(document).ready(function () {
    $(".collapsible_course").click(function () {
        $(this).toggleClass("activate_collapsible")
        $(this).next().toggle();
    })
});
