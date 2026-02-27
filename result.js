// result.js - result.html logic
(function () {
    "use strict";

    // ========= Shared utilities =========
    var U = window.MINISTEP_UTILS;

    var REROLL_STATS_KEY = "ministep-reroll-stats";

    var challenges = (window.MINISTEP_DATA && window.MINISTEP_DATA.challenges) || [];

    // ========= Date formatting =========
    function formatTodayLabel() {
        var d    = new Date();
        var mlist = ["1月", "2月", "3月", "4月", "5月", "6月", "7月",
                     "8月", "9月", "10月", "11月", "12月"];
        var wlist = ["日", "月", "火", "水", "木", "金", "土"];
        return mlist[d.getMonth()] + d.getDate() + "日（" + wlist[d.getDay()] + "）";
    }

    function updateTodayCount(stats) {
        var el  = document.getElementById("today-count");
        if (!el) return;
        var key = U.getTodayKey();
        var val = (stats[key] && stats[key].completed) ? stats[key].completed : 0;
        el.textContent = String(val);
    }

    // ========= Reroll stats =========
    function loadRerollStats() {
        var raw = U.safeGetItem(REROLL_STATS_KEY);
        var obj = U.safeParse(raw, {});
        return obj || {};
    }
    function saveRerollStats(obj) {
        var s = U.safeStringify(obj);
        if (s) U.safeSetItem(REROLL_STATS_KEY, s);
    }
    function getTodayRerollCount(rs) {
        var key = U.getTodayKey();
        return rs[key] || 0;
    }
    function setTodayRerollCount(rs, count) {
        var key = U.getTodayKey();
        rs[key] = count;
        saveRerollStats(rs);
    }

    // ========= I18N init =========
    if (window.I18N && typeof I18N.init === "function") {
        I18N.init();
    }

    document.addEventListener("DOMContentLoaded", function () {
        var todayDateEl = document.getElementById("today-date");
        if (todayDateEl) todayDateEl.textContent = formatTodayLabel();

        var stats = U.loadStats();
        updateTodayCount(stats);

        var payload = U.loadLatestPayload();
        if (!payload || !payload.challenge) {
            if (window.I18N) alert(I18N.t("alert_direct_link"));
            location.href = "./index.html";
            return;
        }
        var currentChallenge = payload.challenge;

        var textEl       = document.getElementById("challenge-text");
        var categoryEl   = document.getElementById("challenge-category");
        var difficultyEl = document.getElementById("challenge-difficulty");

        function renderChallenge(ch) {
            if (!ch) return;

            if (textEl) textEl.textContent = ch.text;

            if (categoryEl) {
                categoryEl.textContent = I18N.t("label_category") + U.categoryLabel(ch.category);
                categoryEl.className = "pill pill-" + ch.category;
            }

            if (difficultyEl) {
                var stars = "", emptyStars = "";
                var i;
                for (i = 0; i < ch.difficulty; i++) stars += "★";
                for (i = 0; i < 3 - ch.difficulty; i++) emptyStars += "☆";
                difficultyEl.textContent = I18N.t("label_difficulty") + stars + emptyStars;
            }
        }

        renderChallenge(currentChallenge);

        // --- X share button ---
        var shareBtn = document.getElementById("share-x-btn");
        if (shareBtn) {
            shareBtn.addEventListener("click", function () {
                if (!currentChallenge || !currentChallenge.text) {
                    if (window.I18N && I18N.t) {
                        alert(I18N.t("alert_share_missing"));
                    } else {
                        alert("No challenge to share.");
                    }
                    return;
                }

                var baseUrl = "https://ministep.net/";
                var text = "今日のMiniStepチャレンジ：\n「" + currentChallenge.text + "」";

                var intentUrl = "https://twitter.com/intent/tweet"
                    + "?text=" + encodeURIComponent(text)
                    + "&url="  + encodeURIComponent(baseUrl);

                window.open(intentUrl, "_blank", "noopener,noreferrer");
            });
        }

        // ========= Reroll state =========
        var rerollBtn   = document.getElementById("reroll-btn");
        var rerollLabel = document.getElementById("reroll-label");
        var rerollPill  = document.getElementById("reroll-pill");
        var rerollSr    = document.getElementById("reroll-pill-sr");

        function renderRerollState() {
            var rs  = loadRerollStats();
            var cnt = getTodayRerollCount(rs);
            var left = Math.max(0, 3 - cnt);

            var freshStats = U.loadStats();

            if (rerollLabel && window.I18N) {
                rerollLabel.setAttribute("data-i18n-arg", JSON.stringify({ count: cnt }));
            }
            if (rerollPill) {
                var filled = "■".repeat(Math.min(3, cnt));
                var empty  = "□".repeat(Math.max(0, 3 - cnt));
                rerollPill.textContent = filled + empty + " " + cnt + "/3";
            }
            if (rerollSr) {
                rerollSr.textContent = "残り引き直し: " + left;
            }
            if (rerollBtn) {
                rerollBtn.disabled = (cnt >= 3 || U.hasCompletedToday(freshStats));
            }
            if (window.I18N && typeof I18N.apply === "function") {
                I18N.apply();
            }
        }

        renderRerollState();

        // Back button
        var backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.addEventListener("click", function (e) {
                e.preventDefault();
                location.href = "./index.html";
            });
        }

        // Reroll button
        if (rerollBtn) {
            rerollBtn.addEventListener("click", function () {
                var statsNow = U.loadStats();
                if (U.hasCompletedToday(statsNow)) {
                    if (window.I18N) alert(I18N.t("alert_already_completed"));
                    renderRerollState();
                    return;
                }
                var rs  = loadRerollStats();
                var cnt = getTodayRerollCount(rs);
                if (cnt >= 3) {
                    if (window.I18N) alert(I18N.t("alert_reroll_limit"));
                    renderRerollState();
                    return;
                }

                var cat  = currentChallenge.category || "all";
                var next = U.pickRandomChallenge(cat, challenges);
                if (!next) return;
                currentChallenge = next;

                var newPayload = { challenge: currentChallenge, createdAt: new Date().toISOString() };
                var s = U.safeStringify(newPayload);
                if (s) U.safeSetItem(U.LATEST_KEY, s);

                setTodayRerollCount(rs, cnt + 1);
                renderChallenge(currentChallenge);
                renderRerollState();
            });
        }

        // ========= Timer, memo, map =========
        var tBtn = document.getElementById("qa-timer");
        if (tBtn) {
            tBtn.addEventListener("click", function () {
                var baseLabel = window.I18N ? I18N.t("qa_timer") : "3-min timer";
                var sec = 180;
                tBtn.disabled = true;
                tBtn.textContent = baseLabel + " (" + sec + "s)";
                var iv = setInterval(function () {
                    sec--;
                    tBtn.textContent = baseLabel + " (" + sec + "s)";
                    if (sec <= 0) {
                        clearInterval(iv);
                        tBtn.disabled = false;
                        tBtn.textContent = baseLabel;
                        if (window.I18N) alert(I18N.t("timer_done"));
                    }
                }, 1000);
            });
        }

        var mBtn = document.getElementById("qa-memo");
        if (mBtn) {
            mBtn.addEventListener("click", function () {
                window.open("https://keep.google.com/", "_blank", "noopener,noreferrer");
            });
        }

        var mapBtn = document.getElementById("qa-map");
        if (mapBtn) {
            mapBtn.addEventListener("click", function () {
                window.open("https://www.google.com/maps/search/walk+spots/", "_blank", "noopener,noreferrer");
            });
        }

        if (window.I18N && typeof I18N.apply === "function") {
            I18N.apply();
        }
    });
})();
