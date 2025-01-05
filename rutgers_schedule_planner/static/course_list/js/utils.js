function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function form_json(id) {
    const form = new FormData(document.getElementById(id));
    return Object.fromEntries(Array.from(form.keys()).map(key => [key, form.getAll(key)]));
}

function time_to_minutes(time) {
    const split = time.split(":").map(element => Number(element));
    return split[0] * 60 + split[1] + split[2] / 60;
}

function time_to_percent(time) {
    const time_minutes = time_to_minutes(time);
    const start_minutes = time_to_minutes(start_time);
    const end_minutes = time_to_minutes(end_time);

    return (time_minutes - start_minutes) / (end_minutes - start_minutes) * 100;
}
