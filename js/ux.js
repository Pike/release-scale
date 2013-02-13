/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*globals google*/

var worker = new Worker("js/math.js");
worker.onmessage = function(event) {
    console.log(event);
};

function showTable(matrix, locale_counts) {
    var i, ii, row, j, jj, datatable;
    var heads = $("#output > thead");
    // clean up prior mess
    $("th", heads).remove();
    $("#output > tbody > tr").remove();
    // build up table, head in first
    heads.append("<th>");
    for (i=0, ii=locale_counts.length; i<ii; ++i) {
        $("<th>").append(locale_counts[i]).appendTo(heads);
    }
    for (j=0, jj=matrix.length; j<jj; ++j) {
        row = $("<tr>");
        $("<th>").text(j).appendTo(row);
        row.append($.map(locale_counts, function(_, i) {
           return $("<td>").text(Number(matrix[j][locale_counts[i]]*100).toFixed(1));
        }));
        row.appendTo("#output > tbody");
    }
    datatable = [['locales', 'no freeze']];
    for (i=1, ii=matrix.length; i<ii; ++i) {
        datatable[0].push(i + ' freeze' + (i>1 ? 's' : ''));
    }
    for (i=1, ii=matrix[0].length; i<ii; ++i) {
        datatable.push([i].concat(matrix.map(function(a,b){
            return a[i]*100;
        })));
    }
    var data = google.visualization.arrayToDataTable(datatable);
    new google.visualization.LineChart(document.getElementById('visualization')).
            draw(data, {curveType: "function",
                        width: 940, height: 500,
                        vAxis: {maxValue: 100}}
                );
}

function updateUI() {
    var likely = Number($("#likely").val())/100.0;
    var locale_counts = $("#locales").val().split(/,\s*/).map(Number);
    var maxloc = locale_counts[locale_counts.length - 1];
    var freezes = Number($("#freezes").val());
    worker.postMessage({likely: likely, cycles: freezes, maxloc: maxloc});
    worker.onmessage = function(event) {
        showTable(event.data, locale_counts);
    };
}

google.setOnLoadCallback(updateUI);
$(".trigger").change(updateUI);
