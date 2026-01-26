// result.js - result.html 用ロジック
(function () {
    "use strict";

    function safeGetItem(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeSetItem(key, val) {
        try { window.localStorage.setItem(key, val); return true; } catch (e) { return false; }
    }
    function safeParse(json, fallback) {
        try {
            var v = JSON.parse(json);
            return (v !== undefined && v !== null) ? v : fallback;
        } catch (e) { return fallback; }
    }
    function safeStringify(obj) {
        try { return JSON.stringify(obj); } catch (e) { return null; }
    }

    var LATEST_KEY = "ministep-latest-challenge";
    var STATS_KEY = "ministep-stats";
    var HISTORY_KEY = "ministep-history";
    var REROLL_STATS_KEY = "ministep-reroll-stats";

    var THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

    var challenges = (window.MINISTEP_DATA && window.MINISTEP_DATA.challenges) || [];

    function getDateKey(d) {
        var yyyy = d.getFullYear();
        var mm = ("0" + (d.getMonth() + 1)).slice(-2);
        var dd = ("0" + d.getDate()).slice(-2);
        return yyyy + "-" + mm + "-" + dd;
    }
    function getTodayKey() {
        return getDateKey(new Date());
    }

    function formatTodayLabel() {
        var d = new Date();
        var lang = window.I18N ? I18N.get() : "ja";
        if (lang === "ja") {
            var m = d.getMonth() + 1;
            var day = d.getDate();
            var w = "日月火水木金土".charAt(d.getDay());
            return m + "月" + day + "日（" + w + "）";
        } else {
            var mlist = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                "Aug", "Sep", "Oct", "Nov", "Dec"];
            var wlist = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return mlist[d.getMonth()] + " " + d.getDate() + " (" + wlist[d.getDay()] + ")";
        }
    }

    function loadStats() {
        var raw = safeGetItem(STATS_KEY);
        var obj = safeParse(raw, {});
        return obj || {};
    }
    function hasCompletedToday(stats) {
        stats = stats || loadStats();
        var key = getTodayKey();
        return !!(stats[key] && stats[key].completed >= 1);
    }
    function updateTodayCount(stats) {
        var el = document.getElementById("today-count");
        if (!el) return;
        var key = getTodayKey();
        var val = (stats[key] && stats[key].completed) ? stats[key].completed : 0;
        el.textContent = String(val);
    }

    function loadLatestPayload() {
        var raw = safeGetItem(LATEST_KEY);
        var data = safeParse(raw, null);
        if (!data || !data.challenge) return null;
        return data;
    }

    function loadHistory() {
        var raw = safeGetItem(HISTORY_KEY);
        var arr = safeParse(raw, []);
        return Array.isArray(arr) ? arr : [];
    }
    function saveHistory(hist) {
        var s = safeStringify(hist);
        if (s) safeSetItem(HISTORY_KEY, s);
    }
    function pruneHistoryTo30Days(hist) {
        var now = Date.now();
        var result = [];
        for (var i = 0; i < hist.length; i++) {
            var it = hist[i];
            if (!it || !it.drawnAt) continue;
            var t = new Date(it.drawnAt).getTime();
            if (isNaN(t)) continue;
            if (now - t < THIRTY_DAYS_MS) result.push(it);
        }
        return result;
    }

    function loadRerollStats() {
        var raw = safeGetItem(REROLL_STATS_KEY);
        var obj = safeParse(raw, {});
        return obj || {};
    }
    function saveRerollStats(obj) {
        var s = safeStringify(obj);
        if (s) safeSetItem(REROLL_STATS_KEY, s);
    }
    function getTodayRerollCount(rs) {
        var key = getTodayKey();
        return rs[key] || 0;
    }
    function setTodayRerollCount(rs, count) {
        var key = getTodayKey();
        rs[key] = count;
        saveRerollStats(rs);
    }

    function categoryLabel(cat) {
        if (!window.I18N) return cat;
        var map = {
            all: I18N.t("cat_all"),
            outside: I18N.t("cat_outside"),
            communication: I18N.t("cat_communication"),
            self: I18N.t("cat_self"),
            relax: I18N.t("cat_relax"),
            refresh: I18N.t("cat_refresh"),
            focus: I18N.t("cat_focus")
        };
        return map[cat] || cat;
    }

    function pickRandomChallengeWithHistory(category) {
        var pool = challenges;
        if (category && category !== "all") {
            pool = challenges.filter(function (c) { return c.category === category; });
        }
        if (!pool || pool.length === 0) {
            if (window.I18N) alert(I18N.t("alert_no_category"));
            return null;
        }

        var hist = pruneHistoryTo30Days(loadHistory());
        saveHistory(hist);

        var recent = {};
        for (var i = 0; i < hist.length; i++) {
            recent[hist[i].text] = 1;
        }
        var filtered = pool.filter(function (c) { return !recent[c.text]; });
        if (filtered.length === 0) filtered = pool;
        if (filtered.length === 0) {
            if (window.I18N) alert(I18N.t("alert_no_candidates"));
            return null;
        }

        var idx = Math.floor(Math.random() * filtered.length);
        var chosen = filtered[idx];
        hist.push({
            text: chosen.text,
            category: chosen.category,
            drawnAt: new Date().toISOString()
        });
        saveHistory(hist);
        return chosen;
    }

    if (window.I18N && typeof I18N.init === "function") {
        I18N.init();
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.I18N && typeof I18N.mountSwitcher === "function") {
            I18N.mountSwitcher();
        }

        var todayDateEl = document.getElementById("today-date");
        if (todayDateEl) todayDateEl.textContent = formatTodayLabel();

        var stats = loadStats();
        updateTodayCount(stats);

        var payload = loadLatestPayload();
        if (!payload || !payload.challenge) {
            if (window.I18N) alert(I18N.t("alert_direct_link"));
            location.href = "./index.html";
            return;
        }
        var currentChallenge = payload.challenge;

        var textEl = document.getElementById("challenge-text");
        var categoryEl = document.getElementById("challenge-category");
        var difficultyEl = document.getElementById("challenge-difficulty");

        function renderChallenge(ch) {
            if (!ch) return;
            var lang = window.I18N ? I18N.get() : "ja";

            if (textEl) textEl.textContent = ch.text;

            if (categoryEl) {
                categoryEl.textContent = (lang === "ja" ? "カテゴリ: " : "Category: ") + categoryLabel(ch.category);
                categoryEl.className = "pill pill-" + ch.category;
            }

            if (difficultyEl) {
                var stars = "", emptyStars = "";
                var i;
                for (i = 0; i < ch.difficulty; i++) stars += "★";
                for (i = 0; i < 3 - ch.difficulty; i++) emptyStars += "☆";
                difficultyEl.textContent = (lang === "ja" ? "難易度: " : "Difficulty: ") + stars + emptyStars;
            }
        }

        renderChallenge(currentChallenge);

        renderChallenge(currentChallenge);

        // --- Xシェアボタン ---
        var shareBtn = document.getElementById("share-x-btn");
        if (shareBtn) {
            shareBtn.addEventListener("click", function () {
                if (!currentChallenge || !currentChallenge.text) {
                    // i18nで用意済み
                    if (window.I18N && I18N.t) {
                        alert(I18N.t("alert_share_missing"));
                    } else {
                        alert("シェアできるチャレンジが見つかりませんでした。");
                    }
                    return;
                }

                var lang = window.I18N ? I18N.get() : "ja";
                var baseUrl = "https://ministep.jp/";
                var textJa = "MiniStepで今日の小さなチャレンジを引きました：\n「" + currentChallenge.text + "」";
                var textEn = "I got today’s tiny challenge on MiniStep:\n\"" + currentChallenge.text + "\"";

                var text = (lang === "ja") ? textJa : textEn;

                var intentUrl = "https://twitter.com/intent/tweet"
                    + "?text=" + encodeURIComponent(text)
                    + "&url=" + encodeURIComponent(baseUrl);

                window.open(intentUrl, "_blank", "noopener,noreferrer");
            });
        }

        // reroll 状態
        var rerollBtn = document.getElementById("reroll-btn");
        var rerollLabel = document.getElementById("reroll-label");
        var rerollPill = document.getElementById("reroll-pill");
        var rerollSr = document.getElementById("reroll-pill-sr");

        function renderRerollState() {
            var rs = loadRerollStats();
            var cnt = getTodayRerollCount(rs);
            var left = 3 - cnt;
            if (left < 0) left = 0;

            if (rerollLabel && window.I18N) {
                rerollLabel.setAttribute("data-i18n-arg", JSON.stringify({ count: cnt }));
            }
            if (rerollPill) {
                var filled = "■".repeat(Math.min(3, cnt));
                var empty = "□".repeat(Math.max(0, 3 - cnt));
                rerollPill.textContent = filled + empty + " " + cnt + "/3";
            }
            if (rerollSr) {
                rerollSr.textContent = (window.I18N && I18N.get() === "ja")
                    ? "引き直しは残り" + left + "回です"
                    : "Redraws left: " + left;
            }
            if (rerollBtn) {
                rerollBtn.disabled = (cnt >= 3 || hasCompletedToday(stats));
            }
            if (window.I18N && typeof I18N.apply === "function") {
                I18N.apply();
            }
        }

        renderRerollState();

        // トップへボタン（ここが今回のポイント）
        var backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.addEventListener("click", function (e) {
                e.preventDefault();
                location.href = "./index.html";
            });
        }

        // reroll
        if (rerollBtn) {
            rerollBtn.addEventListener("click", function () {
                var statsNow = loadStats();
                if (hasCompletedToday(statsNow)) {
                    if (window.I18N) alert(I18N.t("alert_already_completed"));
                    renderRerollState();
                    return;
                }
                var rs = loadRerollStats();
                var cnt = getTodayRerollCount(rs);
                if (cnt >= 3) {
                    if (window.I18N) alert(I18N.t("alert_reroll_limit"));
                    renderRerollState();
                    return;
                }

                var cat = currentChallenge.category || "all";
                var next = pickRandomChallengeWithHistory(cat);
                if (!next) return;
                currentChallenge = next;

                var newPayload = { challenge: currentChallenge, createdAt: new Date().toISOString() };
                var s = safeStringify(newPayload);
                if (s) safeSetItem(LATEST_KEY, s);

                setTodayRerollCount(rs, cnt + 1);
                renderChallenge(currentChallenge);
                renderRerollState();
            });
        }

        // タイマー & メモ & マップ
        var tBtn = document.getElementById("qa-timer");
        if (tBtn) {
            tBtn.addEventListener("click", function () {
                var langNow = window.I18N ? I18N.get() : "ja";
                var baseLabel = I18N ? I18N.t("qa_timer") : (langNow === "ja" ? "3分タイマー" : "3-min timer");
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
                window.open("https://keep.google.com/", "_blank");
            });
        }

        var mapBtn = document.getElementById("qa-map");
        if (mapBtn) {
            mapBtn.addEventListener("click", function () {
                var langNow = window.I18N ? I18N.get() : "ja";
                if (langNow === "ja") {
                    window.open("https://www.google.com/maps/search/%E6%95%A3%E6%AD%A9%E3%82%B3%E3%83%BC%E3%82%B9/", "_blank");
                } else {
                    window.open("https://www.google.com/maps/search/walk+spots/", "_blank");
                }
            });
        }

        if (window.I18N && typeof I18N.apply === "function") {
            I18N.apply();
        }
    });
})();