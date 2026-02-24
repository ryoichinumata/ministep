// utils.js - main.js / result.js 共通ユーティリティ
(function (global) {
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
    var LATEST_KEY  = "ministep-latest-challenge";
    var STATS_KEY   = "ministep-stats";
    var HISTORY_KEY = "ministep-history";
    var THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

    // ========= 日付ユーティリティ =========
    function getDateKey(d) {
        var yyyy = d.getFullYear();
        var mm = ("0" + (d.getMonth() + 1)).slice(-2);
        var dd = ("0" + d.getDate()).slice(-2);
        return yyyy + "-" + mm + "-" + dd;
    }
    function getTodayKey() {
        return getDateKey(new Date());
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
    function hasCompletedToday(stats) {
        stats = stats || loadStats();
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

    // ========= カテゴリラベル =========
    function categoryLabel(cat) {
        if (!window.I18N) return cat;
        var map = {
            all:           window.I18N.t("cat_all"),
            outside:       window.I18N.t("cat_outside"),
            communication: window.I18N.t("cat_communication"),
            self:          window.I18N.t("cat_self"),
            relax:         window.I18N.t("cat_relax"),
            refresh:       window.I18N.t("cat_refresh"),
            focus:         window.I18N.t("cat_focus")
        };
        return map[cat] || cat;
    }

    // ========= ガチャ（30日重複なし） =========
    // challenges: MINISTEP_DATA.challenges 配列を呼び出し元から渡す
    function pickRandomChallenge(category, challenges) {
        var pool = challenges;
        if (category && category !== "all") {
            pool = challenges.filter(function (c) { return c.category === category; });
        }
        if (!pool || pool.length === 0) {
            if (window.I18N) alert(window.I18N.t("alert_no_category"));
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
            if (window.I18N) alert(window.I18N.t("alert_no_candidates"));
            return null;
        }
        var idx = Math.floor(Math.random() * filtered.length);
        var chosen = filtered[idx];
        hist.push({ text: chosen.text, category: chosen.category, drawnAt: new Date().toISOString() });
        saveHistory(hist);
        return chosen;
    }

    global.MINISTEP_UTILS = {
        safeGetItem:          safeGetItem,
        safeSetItem:          safeSetItem,
        safeParse:            safeParse,
        safeStringify:        safeStringify,
        LATEST_KEY:           LATEST_KEY,
        STATS_KEY:            STATS_KEY,
        HISTORY_KEY:          HISTORY_KEY,
        THIRTY_DAYS_MS:       THIRTY_DAYS_MS,
        getDateKey:           getDateKey,
        getTodayKey:          getTodayKey,
        loadStats:            loadStats,
        saveStats:            saveStats,
        hasCompletedToday:    hasCompletedToday,
        loadHistory:          loadHistory,
        saveHistory:          saveHistory,
        pruneHistoryTo30Days: pruneHistoryTo30Days,
        loadLatestPayload:    loadLatestPayload,
        categoryLabel:        categoryLabel,
        pickRandomChallenge:  pickRandomChallenge
    };
})(window);
