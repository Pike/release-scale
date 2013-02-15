/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var empirical, tries, dices, retries;

function throwDices() {
    var i, row, cell, j, d, pass, result, prevresult;
    function _td(_d) {
        var __d = -1;  // -1 equals "hide cell"
        if (_d === 1) {
            __d = Math.floor(Math.random()*6) + 1;
            if (__d ===  1) pass = false;
        }
        return __d;
    }
    var output = $("#output");
    $("tr", output).remove();
    tries += 0.01;
    prevresult = new Array(dices);
    prevresult = $.map(prevresult, function(){return 1});
    pass = false;
    for (j=0; j <= retries; ++j) {
        pass = true;
        result = $.map(prevresult, _td);
        if (pass) empirical[j] += 1;
        row = $("<tr>");
        $("<th>").text((empirical[j]/tries).toFixed(1)).appendTo(row);
        for (i=0; i < dices; ++i) {
            d = result[i];
            cell = $("<td>");
            if (d > 0) {
                cell.text(d);
                if (d === 1) {cell.addClass('text-error');}
            }
            row.append(cell);
        }
        output.append(row);
        prevresult = result;
    }
}

function resetExperiment() {
    dices = Number($("#dices").val());
    retries = Number($("#retries").val());
    empirical = new Array(retries+1);
    $("#output > tr").remove();
    tries = 0;
    for (var i=0; i<=retries; ++i) {
        empirical[i] = 0;
    }
    throwDices();
}

$(".trigger").change(resetExperiment);
$("#throw").click(throwDices);
$(function () {
    // parse params, update form, and updateUI;
    if (document.location.search.length > 1) {
        var segs = document.location.search.substr(1).split('&');
        for (var i=0, ii=segs.length; i<ii; ++i) {
            var pair = segs[i].split('=');
            $('#' + pair[0]).val(pair[1]);
        }
    }
    resetExperiment();
});
