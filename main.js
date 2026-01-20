// main.js - index.html 用ロジック
(function () {
    "use strict";

    // ========= localStorage ヘルパー =========
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

    // ========= 定数 =========
    var LATEST_KEY = "ministep-latest-challenge";
    var STATS_KEY = "ministep-stats";
    var HISTORY_KEY = "ministep-history";
    var ONBOARD_KEY = "ministep-onboarded";

    var THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

    var currentTodayChallenge = null;
    var selectedCategory = "all";

    // ========= data.js から =========
    var quotes_ja = (window.MINISTEP_DATA && window.MINISTEP_DATA.quotes_ja) || [];
    var quotes_en = (window.MINISTEP_DATA && window.MINISTEP_DATA.quotes_en) || [];
    var challenges = (window.MINISTEP_DATA && window.MINISTEP_DATA.challenges) || [];

    // ========= 日付ユーティリティ =========
    function getDayOfYear(d) {
        d = d || new Date();
        var s = new Date(d.getFullYear(), 0, 0);
        var diff = d - s;
        var oneDay = 86400000;
        return Math.floor(diff / oneDay);
    }
    function getDateKey(d) {
        var yyyy = d.getFullYear();
        var mm = ("0" + (d.getMonth() + 1)).slice(-2);
        var dd = ("0" + d.getDate()).slice(-2);
        return yyyy + "-" + mm + "-" + dd;
    }
    function getTodayKey() {
        return getDateKey(new Date());
    }
    function msUntilEndOfDay() {
        var now = new Date();
        var end = new Date(now);
        end.setHours(24, 0, 0, 0);
        var diff = end.getTime() - now.getTime();
        return diff > 0 ? diff : 0;
    }

    // ========= stats 読み書き =========
    function loadStats() {
        var raw = safeGetItem(STATS_KEY);
        var obj = safeParse(raw, {});
        return obj || {};
    }
    function saveStats(stats) {
        var s = safeStringify(stats);
        if (s) safeSetItem(STATS_KEY, s);
    }
    function computeTotalStats(stats) {
        var totalDays = 0;
        var totalCompleted = 0;
        var key;
        for (key in stats) {
            if (!stats.hasOwnProperty(key)) continue;
            var rec = stats[key];
            if (rec && typeof rec.completed === "number" && rec.completed > 0) {
                totalDays += 1;
                totalCompleted += rec.completed;
            }
        }
        return { totalDays: totalDays, totalCompleted: totalCompleted };
    }
    function hasCompletedToday() {
        var stats = loadStats();
        var key = getTodayKey();
        return !!(stats[key] && stats[key].completed >= 1);
    }

    // ========= 30日履歴 =========
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

    // ========= 今日のチャレンジ読み込み =========
    function loadLatestPayload() {
        var raw = safeGetItem(LATEST_KEY);
        var data = safeParse(raw, null);
        if (!data || !data.challenge) return null;
        return data;
    }
    function getTodayChallenge() {
        var p = loadLatestPayload();
        if (!p || !p.challenge || !p.createdAt) return null;
        var created = new Date(p.createdAt);
        if (getDateKey(created) !== getTodayKey()) return null;
        return p.challenge;
    }

    // ========= ストリーク / Summary =========
    function calculateStreak(stats) {
        var streak = 0;
        var today = new Date();
        for (var off = 0; off < 365; off++) {
            var d = new Date(today);
            d.setDate(d.getDate() - off);
            var key = getDateKey(d);
            var rec = stats[key];
            if (!rec || !rec.completed || rec.completed <= 0) break;
            streak++;
        }
        return streak;
    }
    function renderStreak() {
        var el = document.getElementById("streak-count");
        if (!el) return;
        var stats = loadStats();
        el.textContent = String(calculateStreak(stats));
    }
    function renderSummary() {
        var daysEl = document.getElementById("summary-days");
        if (!daysEl) return;
        var stats = loadStats();
        var t = computeTotalStats(stats);
        daysEl.textContent = String(t.totalDays);
    }
    function renderTodayCountSummary() {
        // 「今日の達成数」UIを消している場合もあるので、存在チェックだけ
        var el = document.getElementById("today-done-count");
        if (!el) return;
        var stats = loadStats();
        var key = getTodayKey();
        var rec = stats[key] || {};
        var count = typeof rec.completed === "number" ? rec.completed : 0;
        el.textContent = String(count);
    }

    // ========= カテゴリラベル =========
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

    // ========= 今日のチャレンジ表示 =========
    function renderTodayChallenge() {
        var emptyEl = document.getElementById("today-challenge-empty");
        var cardEl = document.getElementById("today-challenge-card");
        var textEl = document.getElementById("today-challenge-text");
        var categoryEl = document.getElementById("today-challenge-category");
        var difficultyEl = document.getElementById("today-challenge-difficulty");

        if (!emptyEl || !cardEl || !textEl || !categoryEl || !difficultyEl) return;

        var ch = getTodayChallenge();
        currentTodayChallenge = ch;

        if (!ch) {
            emptyEl.style.display = "block";
            cardEl.classList.remove("visible");
            cardEl.classList.remove("done");
            return;
        }

        emptyEl.style.display = "none";
        textEl.textContent = ch.text;

        var lang = window.I18N ? I18N.get() : "ja";
        categoryEl.textContent = (lang === "ja" ? "カテゴリ: " : "Category: ") + categoryLabel(ch.category);
        categoryEl.className = "pill pill-" + ch.category;

        var stars = "", emptyStars = "";
        var i;
        for (i = 0; i < ch.difficulty; i++) stars += "★";
        for (i = 0; i < 3 - ch.difficulty; i++) emptyStars += "☆";
        difficultyEl.textContent = (lang === "ja" ? "難易度: " : "Difficulty: ") + stars + emptyStars;

        cardEl.classList.add("visible");
    }

    // ========= Todayリング & スタンプ =========
    function updateTodayRing() {
        var stats = loadStats();
        var key = getTodayKey();
        var done = stats[key] && stats[key].completed ? stats[key].completed : 0;
        var goal = 1;
        var pct = done / goal;
        if (pct < 0) pct = 0;
        if (pct > 1) pct = 1;

        var len = 163;
        var offset = len * (1 - pct);

        var ring = document.getElementById("today-ring");
        var label = document.getElementById("today-ring-text");
        if (ring) ring.style.strokeDashoffset = String(offset);
        if (label) label.textContent = done + "/" + goal;

        var card = document.getElementById("today-challenge-card");
        if (card) card.classList.toggle("done", done >= 1);
    }

    function updateDailyLimitUI() {
        var btn = document.getElementById("today-challenge-complete");
        var note = document.getElementById("daily-limit-note");
        if (!btn || !note) return;

        var lang = window.I18N ? I18N.get() : "ja";

        if (hasCompletedToday()) {
            btn.disabled = true;
            btn.classList.add("is-disabled");
            btn.textContent = (lang === "ja" ? "今日は達成済み" : "Done for today");

            var ms = msUntilEndOfDay();
            var h = Math.floor(ms / 3600000);
            var m = Math.round((ms % 3600000) / 60000);
            note.textContent = (lang === "ja")
                ? "今日はこれでOK。次のチャレンジは約 " + h + "時間" + m + "分後。"
                : "You’re all set. Next draw in ~" + h + "h " + m + "m.";
            note.style.display = "block";
        } else {
            btn.disabled = false;
            btn.classList.remove("is-disabled");
            if (window.I18N) btn.textContent = I18N.t("mark_done");
            note.textContent = "";
            note.style.display = "none";
        }
    }

    // ========= ガチャボタンの「また明日」UI =========
    function updateDrawButtonUI() {
        var drawBtn = document.getElementById("draw-btn");
        if (!drawBtn) return;

        var labelSpan = drawBtn.querySelector("[data-i18n]");
        var completed = hasCompletedToday();

        if (completed) {
            drawBtn.disabled = true;
            drawBtn.classList.add("is-disabled");
            if (labelSpan) {
                labelSpan.setAttribute("data-i18n", "draw_disabled");
                labelSpan.removeAttribute("data-i18n-arg");
            }
        } else {
            drawBtn.disabled = false;
            drawBtn.classList.remove("is-disabled");
            if (labelSpan) {
                labelSpan.setAttribute("data-i18n", "draw");
                labelSpan.removeAttribute("data-i18n-arg");
            }
        }

        if (window.I18N && typeof I18N.apply === "function") {
            I18N.apply();
        }
    }

    // ========= 完了処理 =========
    function addCompletionForToday(ch) {
        if (!ch) return false;
        if (hasCompletedToday()) {
            if (window.I18N) {
                alert(I18N.get() === "ja"
                    ? "今日は達成済みです。また明日。"
                    : "Already completed today. See you tomorrow!");
            }
            updateDailyLimitUI();
            updateDrawButtonUI();
            return false;
        }
        var stats = loadStats();
        var key = getTodayKey();
        if (!stats[key]) stats[key] = { completed: 0, items: [] };
        if (!Array.isArray(stats[key].items)) stats[key].items = [];
        stats[key].completed += 1;
        stats[key].items.push({
            text: ch.text,
            category: ch.category,
            completedAt: new Date().toISOString()
        });
        saveStats(stats);
        renderStreak();
        renderSummary();
        renderTodayCountSummary();
        updateTodayRing();
        updateDailyLimitUI();
        // ★ 達成したら、ガチャボタンも「また明日」に
        updateDrawButtonUI();
        return true;
    }

    // ========= ガチャ（30日重複なし） =========
    function pickRandomChallenge(category) {
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

    // ========= お祝いモーダル簡易版 & トースト =========
    function confettiLite() {
        var root = document.createElement("div");
        root.className = "confetti";
        for (var i = 0; i < 32; i++) {
            var s = document.createElement("span");
            s.style.left = (Math.random() * 100) + "%";
            s.style.animationDelay = (Math.random() * 200) + "ms";
            root.appendChild(s);
        }
        document.body.appendChild(root);
        setTimeout(function () {
            if (root && root.parentNode) root.parentNode.removeChild(root);
        }, 1200);
    }

    function showToast(msg) {
        var el = document.getElementById("toast");
        if (!el) return;
        el.textContent = msg;
        el.classList.add("show");
        if (showToast._t) clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
            el.classList.remove("show");
        }, 1800);
    }

    function showIntroIfNeeded() {
        var overlay = document.getElementById("intro-overlay");
        var btn = document.getElementById("intro-start");
        if (!overlay || !btn) return;
        var has = safeGetItem(ONBOARD_KEY) === "true";
        if (!has) overlay.classList.add("show");

        btn.addEventListener("click", function () {
            safeSetItem(ONBOARD_KEY, "true");
            overlay.classList.remove("show");
        });
        document.addEventListener("keydown", function (e) {
            if (overlay.classList.contains("show") && e.key === "Escape") {
                safeSetItem(ONBOARD_KEY, "true");
                overlay.classList.remove("show");
            }
        });
    }

    // ========= I18N 初期化 =========
    if (window.I18N && typeof I18N.init === "function") {
        I18N.init();
    }

    // ========= DOMContentLoaded =========
    document.addEventListener("DOMContentLoaded", function () {
        if (window.I18N && typeof I18N.mountSwitcher === "function") {
            I18N.mountSwitcher();
        }

        showIntroIfNeeded();

        // 今日のひとこと
        var lang = window.I18N ? I18N.get() : "ja";
        var qs = (lang === "ja") ? quotes_ja : quotes_en;
        if (qs.length) {
            var qi = getDayOfYear() % qs.length;
            var q = qs[qi];
            var qt = document.getElementById("daily-quote");
            var qa = document.getElementById("daily-quote-author");
            if (qt) qt.textContent = (lang === "ja" ? "「" : "“") + q.text + (lang === "ja" ? "」" : "”");
            if (qa) qa.textContent = (lang === "ja" ? "― " : "— ") + q.author;
        }

        renderStreak();
        renderSummary();
        renderTodayCountSummary();
        renderTodayChallenge();
        updateTodayRing();
        updateDailyLimitUI();
        // ★ 初期表示時点でも、すでに達成済みなら「また明日」に
        updateDrawButtonUI();

        setInterval(function () {
            updateTodayRing();
            updateDailyLimitUI();
            updateDrawButtonUI();
        }, 60000);

        // 達成ボタン
        var completeBtn = document.getElementById("today-challenge-complete");
        if (completeBtn) {
            completeBtn.addEventListener("click", function () {
                if (!currentTodayChallenge) {
                    if (window.I18N) alert(I18N.t("alert_no_today"));
                    return;
                }
                if (addCompletionForToday(currentTodayChallenge)) {
                    var overlay = document.getElementById("congrats-overlay");
                    if (overlay) overlay.classList.add("show");
                    var stats = loadStats();
                    var s = calculateStreak(stats);
                    if (window.I18N) showToast(I18N.t("toast_streak", { n: s }));
                }
            });
        }

        // モーダル OK
        var modalOverlay = document.getElementById("congrats-overlay");
        var closeBtn = document.getElementById("congrats-close");
        if (closeBtn && modalOverlay) {
            closeBtn.addEventListener("click", function () {
                modalOverlay.classList.remove("show");
                confettiLite();
            });
            modalOverlay.addEventListener("click", function (e) {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove("show");
                    confettiLite();
                }
            });
        }

        // カテゴリ選択
        var categoryList = document.getElementById("category-list");
        if (categoryList) {
            categoryList.addEventListener("click", function (ev) {
                var target = ev.target || ev.srcElement;
                var chip = target.closest ? target.closest(".category-chip") : null;
                if (!chip) return;
                selectedCategory = chip.getAttribute("data-category") || "all";
                var chips = categoryList.querySelectorAll(".category-chip");
                for (var i = 0; i < chips.length; i++) {
                    chips[i].classList.remove("selected");
                }
                chip.classList.add("selected");
            });
        }

        // ガチャボタン（※当日達成済みなら updateDrawButtonUI 側で disable）
        var drawBtn = document.getElementById("draw-btn");
        if (drawBtn) {
            drawBtn.addEventListener("click", function () {
                if (hasCompletedToday()) {
                    // 念のためガード（UI的には押せない想定）
                    updateDrawButtonUI();
                    return;
                }
                var ch = pickRandomChallenge(selectedCategory);
                if (!ch) return;
                var payload = { challenge: ch, createdAt: new Date().toISOString() };
                var s = safeStringify(payload);
                if (s) safeSetItem(LATEST_KEY, s);
                location.href = "./result.html";
            });
        }

        if (window.I18N && typeof I18N.apply === "function") {
            I18N.apply();
        }
    });
})();