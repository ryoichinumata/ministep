// result.js - result.html 用ロジック
(function () {
    "use strict";

    // ========= 共通ユーティリティへのショートカット =========
    var U = window.MINISTEP_UTILS;

    var REROLL_STATS_KEY = "ministep-reroll-stats";

    var challenges = (window.MINISTEP_DATA && window.MINISTEP_DATA.challenges) || [];

    // ========= 日付フォーマット（result.html 固有） =========
    function formatTodayLabel() {
        var d    = new Date();
        var lang = window.I18N ? I18N.get() : "ja";
        if (lang === "ja") {
            var m   = d.getMonth() + 1;
            var day = d.getDate();
            var w   = "日月火水木金土".charAt(d.getDay());
            return m + "月" + day + "日（" + w + "）";
        } else {
            var mlist = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                         "Aug", "Sep", "Oct", "Nov", "Dec"];
            var wlist = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return mlist[d.getMonth()] + " " + d.getDate() + " (" + wlist[d.getDay()] + ")";
        }
    }

    function updateTodayCount(stats) {
        var el  = document.getElementById("today-count");
        if (!el) return;
        var key = U.getTodayKey();
        var val = (stats[key] && stats[key].completed) ? stats[key].completed : 0;
        el.textContent = String(val);
    }

    // ========= リロール stats =========
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

    // ========= I18N 初期化 =========
    if (window.I18N && typeof I18N.init === "function") {
        I18N.init();
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.I18N && typeof I18N.mountSwitcher === "function") {
            I18N.mountSwitcher();
        }

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
            var lang = window.I18N ? I18N.get() : "ja";

            // 英語ユーザーには text_en を使用（なければ日本語フォールバック）
            if (textEl) textEl.textContent = (lang === "en" && ch.text_en) ? ch.text_en : ch.text;

            if (categoryEl) {
                // i18n キーを使用（ハードコード廃止）
                categoryEl.textContent = I18N.t("label_category") + U.categoryLabel(ch.category);
                categoryEl.className = "pill pill-" + ch.category;
            }

            if (difficultyEl) {
                var stars = "", emptyStars = "";
                var i;
                for (i = 0; i < ch.difficulty; i++) stars += "★";
                for (i = 0; i < 3 - ch.difficulty; i++) emptyStars += "☆";
                // i18n キーを使用（ハードコード廃止）
                difficultyEl.textContent = I18N.t("label_difficulty") + stars + emptyStars;
            }
        }

        renderChallenge(currentChallenge);

        // --- X シェアボタン ---
        var shareBtn = document.getElementById("share-x-btn");
        if (shareBtn) {
            shareBtn.addEventListener("click", function () {
                if (!currentChallenge || !currentChallenge.text) {
                    if (window.I18N && I18N.t) {
                        alert(I18N.t("alert_share_missing"));
                    } else {
                        alert("シェアできるチャレンジが見つかりませんでした。");
                    }
                    return;
                }

                var lang = window.I18N ? I18N.get() : "ja";
                var baseUrl = "https://ministep.net/";
                // 英語ユーザーにはシェアテキストも英語化
                var challengeText = (lang === "en" && currentChallenge.text_en)
                    ? currentChallenge.text_en
                    : currentChallenge.text;
                var textJa = "MiniStepで今日の小さなチャレンジを引きました：\n「" + challengeText + "」";
                var textEn = "I got today's tiny challenge on MiniStep:\n\"" + challengeText + "\"";

                var text = (lang === "ja") ? textJa : textEn;

                var intentUrl = "https://twitter.com/intent/tweet"
                    + "?text=" + encodeURIComponent(text)
                    + "&url="  + encodeURIComponent(baseUrl);

                window.open(intentUrl, "_blank", "noopener,noreferrer");
            });
        }

        // ========= リロール状態 =========
        var rerollBtn   = document.getElementById("reroll-btn");
        var rerollLabel = document.getElementById("reroll-label");
        var rerollPill  = document.getElementById("reroll-pill");
        var rerollSr    = document.getElementById("reroll-pill-sr");

        function renderRerollState() {
            var rs  = loadRerollStats();
            var cnt = getTodayRerollCount(rs);
            var left = Math.max(0, 3 - cnt);

            // stale stats バグ修正: 毎回最新の stats を取得する
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
                rerollSr.textContent = (window.I18N && I18N.get() === "ja")
                    ? "引き直しは残り" + left + "回です"
                    : "Redraws left: " + left;
            }
            if (rerollBtn) {
                rerollBtn.disabled = (cnt >= 3 || U.hasCompletedToday(freshStats));
            }
            if (window.I18N && typeof I18N.apply === "function") {
                I18N.apply();
            }
        }

        renderRerollState();

        // トップへボタン
        var backBtn = document.getElementById("back-btn");
        if (backBtn) {
            backBtn.addEventListener("click", function (e) {
                e.preventDefault();
                location.href = "./index.html";
            });
        }

        // リロールボタン
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

        // ========= タイマー & メモ & マップ =========
        var tBtn = document.getElementById("qa-timer");
        if (tBtn) {
            tBtn.addEventListener("click", function () {
                var langNow   = window.I18N ? I18N.get() : "ja";
                var baseLabel = window.I18N ? I18N.t("qa_timer") : (langNow === "ja" ? "3分タイマー" : "3-min timer");
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
                var langNow = window.I18N ? I18N.get() : "ja";
                if (langNow === "ja") {
                    window.open("https://www.google.com/maps/search/%E6%95%A3%E6%AD%A9%E3%82%B3%E3%83%BC%E3%82%B9/", "_blank", "noopener,noreferrer");
                } else {
                    window.open("https://www.google.com/maps/search/walk+spots/", "_blank", "noopener,noreferrer");
                }
            });
        }

        if (window.I18N && typeof I18N.apply === "function") {
            I18N.apply();
        }
    });
})();
