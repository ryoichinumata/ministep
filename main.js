// main.js - index.html 用ロジック
(function () {
    "use strict";

    // ========= Element.closest polyfill =========
    if (typeof Element !== "undefined" && !Element.prototype.closest) {
        Element.prototype.closest = function (sel) {
            var el = this;
            while (el && el.nodeType === 1) {
                var matches = el.matches || el.msMatchesSelector;
                if (matches && matches.call(el, sel)) return el;
                el = el.parentElement || el.parentNode;
            }
            return null;
        };
    }

    // ========= 共通ユーティリティへのショートカット =========
    var U = window.MINISTEP_UTILS;

    // ========= 定数 =========
    var ONBOARD_KEY = "ministep-onboarded";

    // ========= モジュールスコープ変数 =========
    var currentTodayChallenge = null;
    var selectedCategory = "all";
    var toastTimer = null;  // showToast._t パターンを廃止しモジュール変数で管理

    // ========= data.js から =========
    var quotes_ja  = (window.MINISTEP_DATA && window.MINISTEP_DATA.quotes_ja)  || [];
    var quotes_en  = (window.MINISTEP_DATA && window.MINISTEP_DATA.quotes_en)  || [];
    var challenges = (window.MINISTEP_DATA && window.MINISTEP_DATA.challenges) || [];

    // ========= 日付ユーティリティ（main.js 固有） =========
    // getDayOfYear: DST を避けるため月・日から直接算出
    function getDayOfYear(d) {
        d = d || new Date();
        var monthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var m = d.getMonth();
        var doy = monthDays[m] + d.getDate();
        // うるう年補正（3月以降）
        if (m >= 2) {
            var y = d.getFullYear();
            if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) doy += 1;
        }
        return doy;
    }

    function msUntilEndOfDay() {
        var now = new Date();
        var end = new Date(now);
        end.setHours(24, 0, 0, 0);
        var diff = end.getTime() - now.getTime();
        return diff > 0 ? diff : 0;
    }

    // ========= stats 集計（main.js 固有） =========
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

    // ========= 今日のチャレンジ取得 =========
    function getTodayChallenge() {
        var p = U.loadLatestPayload();
        if (!p || !p.challenge || !p.createdAt) return null;
        var created = new Date(p.createdAt);
        if (U.getDateKey(created) !== U.getTodayKey()) return null;
        return p.challenge;
    }

    // ========= ストリーク計算 =========
    // 今日未達成の場合は昨日からカウント開始（当日未達成でも前日の連続が 0 にならない）
    function calculateStreak(stats) {
        var streak = 0;
        var today = new Date();
        var todayKey = U.getDateKey(today);
        var completedToday = !!(stats[todayKey] && stats[todayKey].completed >= 1);
        var startOffset = completedToday ? 0 : 1;
        for (var off = startOffset; off < 365; off++) {
            var d = new Date(today);
            d.setDate(d.getDate() - off);
            var key = U.getDateKey(d);
            var rec = stats[key];
            if (!rec || !rec.completed || rec.completed <= 0) break;
            streak++;
        }
        return streak;
    }

    // ========= 表示更新 =========
    function renderStreak() {
        var el = document.getElementById("streak-count");
        if (!el) return;
        var stats = U.loadStats();
        el.textContent = String(calculateStreak(stats));
    }
    function renderSummary() {
        var daysEl = document.getElementById("summary-days");
        if (!daysEl) return;
        var stats = U.loadStats();
        var t = computeTotalStats(stats);
        daysEl.textContent = String(t.totalDays);
    }
    function renderTodayCountSummary() {
        var el = document.getElementById("today-done-count");
        if (!el) return;
        var stats = U.loadStats();
        var key = U.getTodayKey();
        var rec = stats[key] || {};
        var count = typeof rec.completed === "number" ? rec.completed : 0;
        el.textContent = String(count);
    }

    // ========= 今日のチャレンジ表示 =========
    function renderTodayChallenge() {
        var emptyEl     = document.getElementById("today-challenge-empty");
        var cardEl      = document.getElementById("today-challenge-card");
        var textEl      = document.getElementById("today-challenge-text");
        var categoryEl  = document.getElementById("today-challenge-category");
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

        var lang = window.I18N ? I18N.get() : "ja";
        // 英語ユーザーには text_en を使用（なければ日本語フォールバック）
        textEl.textContent = (lang === "en" && ch.text_en) ? ch.text_en : ch.text;

        // i18n キーを使用（ハードコード廃止）
        categoryEl.textContent = I18N.t("label_category") + U.categoryLabel(ch.category);
        categoryEl.className = "pill pill-" + ch.category;

        var stars = "", emptyStars = "";
        var i;
        for (i = 0; i < ch.difficulty; i++) stars += "★";
        for (i = 0; i < 3 - ch.difficulty; i++) emptyStars += "☆";
        difficultyEl.textContent = I18N.t("label_difficulty") + stars + emptyStars;

        cardEl.classList.add("visible");
    }

    // ========= Today リング & スタンプ =========
    function updateTodayRing() {
        var stats = U.loadStats();
        var key = U.getTodayKey();
        var done = stats[key] && stats[key].completed ? stats[key].completed : 0;
        var goal = 1;
        var pct = done / goal;
        // pct < 0 のケースは存在しないため削除済み
        if (pct > 1) pct = 1;

        var len = 163;
        var offset = len * (1 - pct);

        var ring  = document.getElementById("today-ring");
        var label = document.getElementById("today-ring-text");
        if (ring)  ring.style.strokeDashoffset = String(offset);
        if (label) label.textContent = done + "/" + goal;

        var card = document.getElementById("today-challenge-card");
        if (card) card.classList.toggle("done", done >= 1);
    }

    function updateDailyLimitUI() {
        var btn  = document.getElementById("today-challenge-complete");
        var note = document.getElementById("daily-limit-note");
        if (!btn || !note) return;

        var lang = window.I18N ? I18N.get() : "ja";

        if (U.hasCompletedToday()) {
            btn.disabled = true;
            btn.classList.add("is-disabled");
            btn.textContent = (lang === "ja" ? "今日は達成済み" : "Done for today");

            var ms = msUntilEndOfDay();
            var h  = Math.floor(ms / 3600000);
            var m  = Math.round((ms % 3600000) / 60000);
            note.textContent = (lang === "ja")
                ? "今日はこれでOK。次のチャレンジは約 " + h + "時間" + m + "分後。"
                : "You're all set. Next draw in ~" + h + "h " + m + "m.";
            note.style.display = "block";
        } else {
            btn.disabled = false;
            btn.classList.remove("is-disabled");
            if (window.I18N) btn.textContent = I18N.t("mark_done");
            note.textContent = "";
            note.style.display = "none";
        }
    }

    // ========= ガチャボタン UI =========
    function updateDrawButtonUI() {
        var drawBtn = document.getElementById("draw-btn");
        if (!drawBtn) return;

        var labelSpan = drawBtn.querySelector("[data-i18n]");
        var completed = U.hasCompletedToday();

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
        if (U.hasCompletedToday()) {
            if (window.I18N) {
                alert(I18N.get() === "ja"
                    ? "今日は達成済みです。また明日。"
                    : "Already completed today. See you tomorrow!");
            }
            updateDailyLimitUI();
            updateDrawButtonUI();
            return false;
        }
        var stats = U.loadStats();
        var key = U.getTodayKey();
        if (!stats[key]) stats[key] = { completed: 0, items: [] };
        if (!Array.isArray(stats[key].items)) stats[key].items = [];
        stats[key].completed += 1;
        stats[key].items.push({
            text: ch.text,
            category: ch.category,
            completedAt: new Date().toISOString()
        });
        U.saveStats(stats);
        renderStreak();
        renderSummary();
        renderTodayCountSummary();
        updateTodayRing();
        updateDailyLimitUI();
        updateDrawButtonUI();
        return true;
    }

    // ========= お祝いモーダル & トースト =========
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
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove("show");
        }, 1800);
    }

    function showIntroIfNeeded() {
        var overlay = document.getElementById("intro-overlay");
        var btn     = document.getElementById("intro-start");
        if (!overlay || !btn) return;
        var has = U.safeGetItem(ONBOARD_KEY) === "true";
        if (!has) overlay.classList.add("show");

        btn.addEventListener("click", function () {
            U.safeSetItem(ONBOARD_KEY, "true");
            overlay.classList.remove("show");
        });
        document.addEventListener("keydown", function (e) {
            if (overlay.classList.contains("show") && e.key === "Escape") {
                U.safeSetItem(ONBOARD_KEY, "true");
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
        var qs   = (lang === "ja") ? quotes_ja : quotes_en;
        if (qs.length) {
            var qi = getDayOfYear() % qs.length;
            var q  = qs[qi];
            var qt = document.getElementById("daily-quote");
            var qa = document.getElementById("daily-quote-author");
            if (qt) qt.textContent = (lang === "ja" ? "「" : "\u201c") + q.text + (lang === "ja" ? "」" : "\u201d");
            if (qa) qa.textContent = (lang === "ja" ? "― " : "— ") + q.author;
        }

        renderStreak();
        renderSummary();
        renderTodayCountSummary();
        renderTodayChallenge();
        updateTodayRing();
        updateDailyLimitUI();
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
                    var stats = U.loadStats();
                    var s = calculateStreak(stats);
                    if (window.I18N) showToast(I18N.t("toast_streak", { n: s }));
                }
            });
        }

        // モーダル OK
        var modalOverlay = document.getElementById("congrats-overlay");
        var closeBtn     = document.getElementById("congrats-close");
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

        // カテゴリ選択（.closest は上部の polyfill でサポート済み）
        var categoryList = document.getElementById("category-list");
        if (categoryList) {
            categoryList.addEventListener("click", function (ev) {
                var target = ev.target || ev.srcElement;
                var chip = target.closest(".category-chip");
                if (!chip) return;
                selectedCategory = chip.getAttribute("data-category") || "all";
                var chips = categoryList.querySelectorAll(".category-chip");
                for (var i = 0; i < chips.length; i++) {
                    chips[i].classList.remove("selected");
                }
                chip.classList.add("selected");
            });
        }

        // ガチャボタン（当日達成済みなら updateDrawButtonUI 側で disable）
        var drawBtn = document.getElementById("draw-btn");
        if (drawBtn) {
            drawBtn.addEventListener("click", function () {
                if (U.hasCompletedToday()) {
                    // 念のためガード（UI 的には押せない想定）
                    updateDrawButtonUI();
                    return;
                }
                var ch = U.pickRandomChallenge(selectedCategory, challenges);
                if (!ch) return;
                var payload = { challenge: ch, createdAt: new Date().toISOString() };
                var s = U.safeStringify(payload);
                if (s) U.safeSetItem(U.LATEST_KEY, s);
                location.href = "./result.html";
            });
        }

        if (window.I18N && typeof I18N.apply === "function") {
            I18N.apply();
        }
    });
})();
