function switch_to(type) {
    Object.keys(all_charts).forEach(id => {
        all_charts[id].destroy();
        all_charts[id] = new Chart(
            document.getElementById(id).getContext("2d"),
            createChart(id, labels[id], datas[id], type)
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
    datas[title] = all_charts[title].data.datasets[0].data;
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
    datas[title] = all_charts[title].data.datasets[0].data;
    all_charts[title].update();
}

function filter_object_by_cnt(obj, cnt) {
    var new_chart_labels = [];
    var new_chart_values = [];
    for (const [key, value] of Object.entries(obj)) {
        if (value >= cnt) {
            new_chart_labels.push(key);
            new_chart_values.push(value);
        }
    }
    return [new_chart_labels, new_chart_values]
}

function createChart(title, labels, datas, type) {
    // TODO - the previous method creates a bug when only a few items are displayed in the chart (colours difficult to distinguish)
    // Apply the fix to create a new chart instead of modifying it each time when its size changes (e.g., from 50 to 5) to prevent a narrow colour range
    // let step = 360 / datas.length;
    // let colorsHue = datas.map((elem, index) => `hsla(${index * step}, 100%, 50%, 0.25`);
    let colorsHue = datas.map((_elem, _index) => `hsla(${Math.floor(Math.random() * 361)}, 100%, 50%, 0.3`);

    // TODO - temp solution not to display the chart's title for the 2024 page (the titles there are separate html elements)
    if (document.getElementsByTagName("title")[0].innerHTML == "Clubs and Leagues") {
        title = '';
    }
    return {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                data: datas,
                backgroundColor: colorsHue
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
                    display: true,
                    text: title,
                    font: {
                        size: 20
                    }
                }
            }
        }
    };
}

function appendCanvas(title, labels, datas, parent_id = "container", type = "bar") {
    let canvas = document.createElement('canvas');
    canvas.width = "1500";
    canvas.height = "600";
    canvas.id = title;
    document.getElementById(parent_id).appendChild(canvas);
    let chart = new Chart(canvas, createChart(title, labels, datas, type));
    all_charts[title] = chart;
}

function fill_init(title, label_fill, data_fill, append_to_elem_id = "container") {
    labels[title] = label_fill;
    datas[title] = data_fill;
    appendCanvas(title, labels[title], datas[title], append_to_elem_id);
}

function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
