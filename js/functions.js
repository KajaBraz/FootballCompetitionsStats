// TODO - consider removing one of the following global variables: datas and all_charts

function switch_to(type) {
    Object.keys(all_charts).forEach(id => {
        all_charts[id].destroy();
        all_charts[id] = new Chart(
            document.getElementById(id).getContext("2d"),
            create_chart(id, labels[id], datas[id]["values"], datas[id]["full"], type)
        );
    });
}

// TODO - create new chart instead of modifying the existing one; this will prevent duplicating colours 
function modify_one_goal(checkbox, title) {
    all_charts[title].data.labels = checkbox.checked ?
        one_goal_labels : no_one_goal_labels;
    all_charts[title].data.datasets[0].data = checkbox.checked ?
        one_goal_datas : no_one_goal_datas;
    labels[title] = all_charts[title].data.labels;
    datas[title]["values"] = all_charts[title].data.datasets[0].data;
    all_charts[title].update();
}

function modify_chart_by_cnt(input_elem, title, data_obj) {
    let cnt_str = input_elem.value;

    if (!isNaN(cnt_str)) {
        var cnt = Number(cnt_str);
    }

    let new_data = filter_object_by_cnt(data_obj, cnt);
    let new_chart_labels = new_data[0];
    let new_chart_values = new_data[1];

    all_charts[title].data.labels = new_chart_labels;
    all_charts[title].data.datasets[0].data = new_chart_values;

    labels[title] = all_charts[title].data.labels;
    datas[title]["values"] = all_charts[title].data.datasets[0].data;

    all_charts[title].update();
}

function filter_object_by_cnt(obj, cnt) {
    var new_chart_labels = [];
    var new_chart_values = [];

    for (const [key, value] of Object.entries(obj)) {
        if (typeof (value) === "object") {
            if (value.length >= cnt) {
                new_chart_labels.push(key);
                new_chart_values.push(value.length);
            }
        } else {
            if (value >= cnt) {
                new_chart_labels.push(key);
                new_chart_values.push(value);
            }
        }
    }
    return [new_chart_labels, new_chart_values]
}

function create_chart(title, labels, datas, full_data, type) {
    // TODO - the previous method creates a bug when only a few items are displayed in the chart (colours difficult to distinguish)
    // Apply the fix to create a new chart instead of modifying it each time when its size changes (e.g., from 50 to 5) to prevent a narrow colour range
    // let step = 360 / full_data.length;
    // let coloursHues = datas.map((elem, index) => `hsla(${index * step}, 100%, 50%, 0.25`);
    let coloursHues = generate_colours(datas.length, 300);

    // TODO - temp solution not to display the chart's title for the 2024 page (the titles there are separate html elements)
    let is_2024 = document.getElementsByTagName("title")[0].innerHTML.includes("2024");

    let new_chart = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                data: datas,
                backgroundColor: coloursHues
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: type == "bar" ? false : true,
                    position: "bottom",
                    maxHeight: 200
                },
                title: {
                    display: is_2024 ? false : true,
                    text: title,
                    font: { size: 20 }
                },
                tooltip: {
                    titleMarginBottom: 10,
                    titleFont: { size: 14, weight: "bolder" },
                    footerFont: { size: 12, weight: "lighter" },
                    callbacks: {
                        afterLabel: (context) => {
                            return parse_tooltip_text(full_data, context.label)
                        }
                        // footer: (context)=> {
                        //     return parse_tooltip_text(full_data, context[0].label)
                        // }
                    }
                }
            }
        }
    }

    if (type == "bar") {
        new_chart.options.scales = {
            y: {
                ticks: { precision: 0 }
            }
        }
    }

    return new_chart;
}

function generate_colours(n, max_hue = 360, saturation = 100, lightness = 50, alpha = 0.25) {
    var hues = [...Array(n)].map(_ => get_random_int(max_hue));
    var hue_check = [false, null, null]
    var i, j;

    while (!hue_check[0]) {
        hue_check = verify_colour_hues(hues, 45)
        i = hue_check[1];
        j = hue_check[2];
        update_hues(hues, i, j, max_hue);
    }

    return hues.map((hue) => `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha}`);
}

function verify_colour_hues(hues, min_diff) {
    for (i = 0; i < hues.length - 1; i++) {
        if (Math.abs(hues[i] - hues[i + 1]) < min_diff) {
            return [false, i, i + 1]
        }
    }
    return [true, null, null]
}

function update_hues(hues_array, i, j, max_hue) {
    hues_array[i] = get_random_int(max_hue);
    hues_array[j] = get_random_int(max_hue);
}

function get_random_int(max_int) {
    return Math.floor(Math.random() * (max_int + 1))
}

function parse_tooltip_text(full_data, label) {
    if (full_data) {
        let rows = 20;
        let all_names = full_data[label];
        let players_in_row_num = Math.ceil(all_names.length / rows)
        let display_names = [];
        for (let i = 0; i < rows + 1; i++) {
            var new_row = all_names.slice(i * players_in_row_num, i * players_in_row_num + players_in_row_num);
            // if (new_row.length > 0){
            //     new_row[0] = `    ${new_row[0]}`
            // }
            display_names.push(new_row.join("  -  "));
        }
        return display_names.join("\n");
    }
}

function append_canvas(title, labels, datas, full_data, parent_id = "container", type = "bar") {
    let canvas = document.createElement("canvas");
    canvas.width = "1500";
    canvas.height = "600";
    canvas.id = title;
    document.getElementById(parent_id).appendChild(canvas);
    let chart = new Chart(canvas, create_chart(title, labels, datas, full_data, type));
    all_charts[title] = chart;
}

function fill_init(title, label_fill, data_fill, append_to_elem_id = "container", full_data = NaN) {
    labels[title] = label_fill;
    datas[title] = { "values": data_fill, "full": full_data };
    append_canvas(title, labels[title], data_fill, full_data, append_to_elem_id);
}

function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function parse_player_info_country(player_data, name_key, country_key) {
    return `${player_data[name_key]} (${player_data[country_key].slice(0, 3).toUpperCase()})`;
}

function parse_player_info_goals(player_data, name_key, goal_key, country_key = "", club_key = "", score_type = "goal") {
    let goal_num = player_data[goal_key];
    let goal_str = goal_num > 1 ? `${score_type}s` : score_type;
    let national_team = country_key != "" ? player_data[country_key].slice(0, 3).toUpperCase() : "";
    let brackets_text = national_team != "" ? `${goal_num} ${goal_str} for ${national_team}` : `${goal_num} ${goal_str}`;
    let club_info_str = club_key ? `${player_data[club_key]}; ` : "";
    return `${player_data[name_key]} (${club_info_str}${brackets_text})`;
}

function parse_player_info_attr(player_data, name_key, attr_key, goal_key, country_key = "", score_type = "goal") {
    let goal_num = player_data[goal_key];
    let goal_str = goal_num > 1 ? `${score_type}s` : score_type;
    let national_team = country_key != "" ? player_data[country_key].slice(0, 3).toUpperCase() : "";
    let extra_bracket_info = national_team != "" ? `${goal_num} ${goal_str} for ${national_team}` : `${goal_num} ${goal_str}`;

    if (attr_key == "age") {
        attr_str = `${player_data[attr_key]} years`;
    } else if (attr_key == "height") {
        var height = player_data[attr_key];
        height = height < 100 ? height *= 100 : height;
        attr_str = `${height} cm`;
    }
    return `${player_data[name_key]} (${attr_str}; ${extra_bracket_info})`;
}

function assign_label(label_type, labels, value) {
    let num_patterns = {
        age: /\d+/g,
        height: /[\d+\.]+/g
    };

    let ranges = new Object();
    labels.forEach(label => {
        ranges[label] = label.match(num_patterns[label_type]);
    });

    for (const [range, [r1, r2]] of Object.entries(ranges)) {
        if (value >= r1 && value <= r2) {
            return range;
        }
    }
    return ""
}
