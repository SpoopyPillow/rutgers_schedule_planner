function form_json(id) {
    const form = new FormData(document.getElementById(id));
    return Object.fromEntries(Array.from(form.keys()).map(key => [key, form.getAll(key)]));
}

function form_unselected(id) {
    const form = document.getElementById(id);
    
    const unchecked = {};
    for (const input of form.querySelectorAll("input")) {
        if (input.checked) {
            continue;
        }

        const name = input.getAttribute("name");
        const value = input.getAttribute("value");
        if (!(name in unchecked)) {
            unchecked[name] = [];
        }
        unchecked[name].push(value);
    }

    return unchecked;
}

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
