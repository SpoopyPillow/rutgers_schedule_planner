$(document).ready(function () {
    $(".collapsible_course").click(function () {
        $(this).toggleClass("active_collapsible");
        $(this).next().toggle();
    })
});
