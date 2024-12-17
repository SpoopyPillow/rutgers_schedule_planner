$(".collapsible_course").click(function (e) {
    if($(e.target).is("button")){
        return;
    }
    $(this).toggleClass("active_collapsible");
    $(this).next().toggle();
})
