// === localStorage 安全ラッパー ===
function safeGetItem(key) { try { return window.localStorage.getItem(key) } catch (e) { return null } }
function safeSetItem(key, val) { try { window.localStorage.setItem(key, val); return true } catch (e) { return false } }
function safeParse(json, fallback) { try { var v = JSON.parse(json); return (v !== undefined && v !== null) ? v : fallback } catch (e) { return fallback } }
function safeStringify(obj) { try { return JSON.stringify(obj) } catch (e) { return null } }

// === 定数 ===
var LATEST_KEY = "ministep-latest-challenge";
var STATS_KEY = "ministep-stats";
var HISTORY_KEY = "ministep-history";
var THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
var REROLL_STATS_KEY = "ministep-reroll-stats";

// ガチャ候補（index と同一に保つ）
var challenges = [
    { text: "いつもと違う道でコンビニかスーパーに行ってみる", category: "outside", difficulty: 1 },
    { text: "外に出て、空を見上げて深呼吸を3回するだけ散歩をする", category: "outside", difficulty: 1 },
    { text: "近所で「ちょっとだけ気になっていた場所」を1か所だけ見に行ってみる", category: "outside", difficulty: 2 },
    { text: "職場や学校ですれ違った人に、いつもよりはっきりあいさつする", category: "communication", difficulty: 1 },
    { text: "最近連絡していない友だちに、スタンプ1つでもいいのでメッセージを送る", category: "communication", difficulty: 2 },
    { text: "お店の人や配達員さんに、いつもより一言多く「ありがとうございます」と伝える", category: "communication", difficulty: 2 },
    { text: "今日あった「ちょっと良かったこと」を3つ、紙かメモアプリに書き出す", category: "self", difficulty: 1 },
    { text: "寝る前に、明日の自分への一言メッセージをメモする", category: "self", difficulty: 1 },
    { text: "今の気持ちを「一言日記」として、1行だけメモしてみる", category: "self", difficulty: 1 },
    { text: "スマホを5分だけ置いて、好きな飲み物をゆっくり味わう", category: "relax", difficulty: 1 },
    { text: "お風呂に入る前に、深呼吸を3回してから湯船につかる", category: "relax", difficulty: 1 },
    { text: "好きな音楽を1曲だけ、何もせずにじっくり聴く", category: "relax", difficulty: 1 },
    { text: "コンビニで「初めて買うお菓子 or 飲み物」を1つ選ぶ", category: "refresh", difficulty: 1 },
    { text: "5分だけストレッチをする（首・肩・背中など気持ちいいところ）", category: "refresh", difficulty: 1 },
    { text: "窓を開けて外の空気を30秒だけ深呼吸する", category: "refresh", difficulty: 1 },
    { text: "「やらなきゃ」と思っていたことを1つだけ、3分だけやってみる", category: "focus", difficulty: 2 },
    { text: "机の上かカバンの中を、1か所だけ片付ける", category: "focus", difficulty: 1 },
    { text: "今日中に終わらせたいことを1つだけ紙やメモアプリに書き出す", category: "focus", difficulty: 1 }
];

// === 日付関数（“今日”のズレを避けるため常に同ロジックを使用） ===
function getDateKey(d) { var yyyy = d.getFullYear(); var mm = ('0' + (d.getMonth() + 1)).slice(-2); var dd = ('0' + d.getDate()).slice(-2); return yyyy + "-" + mm + "-" + dd }
function getTodayKey() { return getDateKey(new Date()) }
function formatTodayLabel() { var d = new Date(); var m = d.getMonth() + 1; var date = d.getDate(); var w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()]; return m + "月" + date + "日（" + w + "）" }

// === ストレージ系 ===
function loadStats() { var raw = safeGetItem(STATS_KEY); var obj = safeParse(raw, {}); return obj || {} }
function updateTodayCount(stats) { var el = document.getElementById("today-count"); if (!el) return; var key = getTodayKey(); var val = (stats[key] && stats[key].completed) ? stats[key].completed : 0; el.textContent = val }

function loadLatestPayload() { var raw = safeGetItem(LATEST_KEY); var data = safeParse(raw, null); return (data && data.challenge) ? data : null }

function loadHistory() { var raw = safeGetItem(HISTORY_KEY); var arr = safeParse(raw, []); return Array.isArray(arr) ? arr : [] }
function saveHistory(h) { var s = safeStringify(h); if (s) safeSetItem(HISTORY_KEY, s) }
function pruneHistoryTo30Days(h) { var now = Date.now(); return h.filter(function (it) { if (!it || !it.drawnAt) return false; var t = new Date(it.drawnAt).getTime(); if (isNaN(t)) return false; return now - t < THIRTY_DAYS_MS }) }

// 引き直し（/日 切替）
function loadRerollStats() { var raw = safeGetItem(REROLL_STATS_KEY); var obj = safeParse(raw, {}); return obj || {} }
function saveRerollStats(data) { var s = safeStringify(data); if (s) safeSetItem(REROLL_STATS_KEY, s) }
function getTodayRerollCount(rs) { var key = getTodayKey(); return rs[key] || 0 }
function setTodayRerollCount(rs, count) { var key = getTodayKey(); rs[key] = count; saveRerollStats(rs) }

// === ランダム選定（30日重複回避） ===
function pickRandomChallengeWithHistory(category) {
    var pool = challenges;
    if (category && category !== "all") { pool = pool.filter(function (c) { return c.category === category }) }
    if (!pool.length) { alert("そのカテゴリのチャレンジがまだありません 🙇‍♀️"); return null; }

    var hist = pruneHistoryTo30Days(loadHistory()); saveHistory(hist);
    var recent = {};
    for (var i = 0; i < hist.length; i++) {
        recent[hist[i].text] = 1; // ← 崩れ修正済み
    }

    var filtered = pool.filter(function (c) { return !recent[c.text] });
    if (filtered.length === 0) filtered = pool;

    var idx = Math.floor(Math.random() * filtered.length);
    var chosen = filtered[idx];

    // 本日の抽選履歴に追加（重複回避用）
    hist.push({ text: chosen.text, category: chosen.category, drawnAt: new Date().toISOString() });
    saveHistory(hist);

    return chosen;
}

// === 起動処理 ===
document.addEventListener("DOMContentLoaded", function () {
    // ヘッダの「今日」表示
    var todayDateEl = document.getElementById("today-date");
    if (todayDateEl) todayDateEl.textContent = formatTodayLabel();

    // 統計
    var stats = loadStats();
    updateTodayCount(stats);

    // 直リンク/リロード保護：indexからのpayloadがない場合は戻す
    var payload = loadLatestPayload();
    if (!payload || !payload.challenge) {
        alert("まだガチャが引かれていません。最初のページでガチャを引いてください！");
        location.href = "./index.html";
        return;
    }
    var currentChallenge = payload.challenge;

    // DOM参照
    var textEl = document.getElementById("challenge-text");
    var categoryEl = document.getElementById("challenge-category");
    var difficultyEl = document.getElementById("challenge-difficulty");
    var backBtn = document.getElementById("back-btn");
    var rerollBtn = document.getElementById("reroll-btn");
    var rerollCountEl = document.getElementById("reroll-count");
    var cardEl = document.getElementById("challenge-card");

    function renderChallenge(ch) {
        if (!ch) return;
        if (textEl) textEl.textContent = ch.text;
        var map = { outside: "外に出る", communication: "人と話したい", self: "じぶん時間", relax: "ゆっくりしたい", refresh: "リフレッシュ", focus: "がんばりたい" };
        if (categoryEl) categoryEl.textContent = "カテゴリ: " + (map[ch.category] || ch.category);
        if (difficultyEl) {
            var stars = Array(ch.difficulty + 1).join("★");
            var empty = Array(3 - ch.difficulty + 1).join("☆");
            difficultyEl.textContent = "難易度: " + stars + empty;
        }
    }

    function renderRerollState() {
        var rs = loadRerollStats();
        var cnt = getTodayRerollCount(rs);
        if (rerollCountEl) rerollCountEl.textContent = cnt;
        if (rerollBtn) rerollBtn.disabled = (cnt >= 3);
    }

    // 初期描画
    renderChallenge(currentChallenge);
    renderRerollState();
    if (cardEl) cardEl.classList.add("visible");

    // イベント：戻る
    if (backBtn) {
        backBtn.addEventListener("click", function () { location.href = "./index.html"; });
    }

    // イベント：引き直し（1日3回）
    if (rerollBtn) {
        rerollBtn.addEventListener("click", function () {
            var rs = loadRerollStats();
            var cnt = getTodayRerollCount(rs);
            if (cnt >= 3) {
                alert("今日の引き直しは3回までです。");
                renderRerollState();
                return;
            }
            var cat = currentChallenge && currentChallenge.category ? currentChallenge.category : "all";
            var next = pickRandomChallengeWithHistory(cat);
            if (!next) return;

            currentChallenge = next;
            // LATESTを上書き（indexの当日カード/共有に反映）
            var newPayload = { challenge: currentChallenge, createdAt: new Date().toISOString() };
            var s = safeStringify(newPayload);
            if (s) safeSetItem(LATEST_KEY, s);

            setTodayRerollCount(rs, cnt + 1);
            renderChallenge(currentChallenge);
            renderRerollState();
        });
    }
});
