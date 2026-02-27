// completed.js - completed.html logic
(function () {
    "use strict";

    var U = window.MINISTEP_UTILS;

    // Build challenge lookup: text -> challenge object (for difficulty display)
    var challengeMap = {};
    if (window.MINISTEP_DATA && window.MINISTEP_DATA.challenges) {
        var chs = window.MINISTEP_DATA.challenges;
        for (var i = 0; i < chs.length; i++) {
            challengeMap[chs[i].text] = chs[i];
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function parseDateKey(key) {
        var parts = key.split("-");
        return new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10)
        );
    }

    function formatDate(dateKey) {
        var d = parseDateKey(dateKey);
        var mlist = ["1月", "2月", "3月", "4月", "5月", "6月",
                     "7月", "8月", "9月", "10月", "11月", "12月"];
        return d.getFullYear() + "年" + mlist[d.getMonth()] + d.getDate() + "日";
    }

    if (window.I18N && typeof I18N.init === "function") {
        I18N.init();
    }

    document.addEventListener("DOMContentLoaded", function () {
        var stats = U.loadStats();

        // Collect all completed items with their date keys
        var allItems = [];
        var key;
        for (key in stats) {
            if (!stats.hasOwnProperty(key)) continue;
            var rec = stats[key];
            if (!rec || !Array.isArray(rec.items)) continue;
            for (var i = 0; i < rec.items.length; i++) {
                var item = rec.items[i];
                if (item && item.text) {
                    allItems.push({
                        dateKey:     key,
                        text:        item.text,
                        category:    item.category || "outside",
                        completedAt: item.completedAt || key
                    });
                }
            }
        }

        // Sort by dateKey descending (newest first)
        allItems.sort(function (a, b) {
            return b.dateKey.localeCompare(a.dateKey);
        });

        var listEl  = document.getElementById("completed-list");
        var emptyEl = document.getElementById("completed-empty");
        var countEl = document.getElementById("completed-count");

        if (countEl) countEl.textContent = String(allItems.length);

        if (allItems.length === 0) {
            if (emptyEl) emptyEl.style.display = "block";
            if (listEl)  listEl.style.display  = "none";
            return;
        }

        if (emptyEl) emptyEl.style.display = "none";

        for (var j = 0; j < allItems.length; j++) {
            var it = allItems[j];

            // Look up difficulty from challenges data
            var ch = challengeMap[it.text];
            var diffHtml = "";
            if (ch && ch.difficulty) {
                var stars = "", emptyStars = "";
                var k;
                for (k = 0; k < ch.difficulty; k++)       stars     += "\u2605";
                for (k = 0; k < 3 - ch.difficulty; k++)  emptyStars += "\u2606";
                diffHtml = "<span class=\"difficulty completed-card-difficulty\">" + stars + emptyStars + "</span>";
            }

            var catLabel = U.categoryLabel(it.category);

            var card = document.createElement("div");
            card.className = "completed-card";
            card.innerHTML =
                "<div class=\"completed-card-header\">" +
                    "<span class=\"completed-card-date\">\u2705 " + escapeHtml(formatDate(it.dateKey)) + "</span>" +
                    diffHtml +
                "</div>" +
                "<p class=\"completed-card-text\">" + escapeHtml(it.text) + "</p>" +
                "<div class=\"completed-card-meta\">" +
                    "<span class=\"pill pill-" + escapeHtml(it.category) + "\">" + escapeHtml(catLabel) + "</span>" +
                "</div>";

            listEl.appendChild(card);
        }

        if (window.I18N && typeof I18N.apply === "function") {
            I18N.apply();
        }
    });
})();
