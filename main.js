// === localStorage 安全ラッパー ===
function safeGetItem(key) { try { return window.localStorage.getItem(key) } catch (e) { return null } }
function safeSetItem(key, val) { try { window.localStorage.setItem(key, val); return true } catch (e) { return false } }
function safeParse(json, fallback) { try { var v = JSON.parse(json); return (v !== undefined && v !== null) ? v : fallback } catch (e) { return fallback } }
function safeStringify(obj) { try { return JSON.stringify(obj) } catch (e) { return null } }

// ===== 日替わりひとこと =====
var quotes = [
    { text: "大きな変化も、はじめは小さな一歩から。", author: "MiniStep" },
    { text: "今日の小さな前進は、未来の自分から見ると大きな一歩です。", author: "MiniStep" },
    { text: "完璧じゃなくていいから、3ミリだけ前に進んでみよう。", author: "MiniStep" },
    { text: "気分が乗らない日の一歩こそ、いちばん価値が高い。", author: "MiniStep" },
    { text: "何もしないで責めるより、少しだけやって自分をほめてみよう。", author: "MiniStep" },
    { text: "昨日より一つだけ行動できたら、それは十分すぎる成長です。", author: "MiniStep" },
    { text: "がんばれない日があってもいい。止まらなければ、それでOK。", author: "MiniStep" },
    { text: "自分を変えるのは、大きな決意よりも、毎日のちいさな選択。", author: "MiniStep" },
    { text: "今できることを、できるぶんだけ。ゆるく続くのがいちばん強い。", author: "MiniStep" },
    { text: "やる気が出ないときは、やる気がいらないくらい小さく始めてみよう。", author: "MiniStep" },
    { text: "一歩踏み出した自分にだけ見える景色が、必ずどこかにあります。", author: "MiniStep" },
    { text: "他人とくらべる時間を、昨日の自分をねぎらう時間に変えてみよう。", author: "MiniStep" },
    { text: "進んでいないように見える日も、止まらなければ道の途中です。", author: "MiniStep" },
    { text: "「たったこれだけ」じゃなくて、「今日ちゃんとここまでやった」に言いかえてみよう。", author: "MiniStep" },
    { text: "三日坊主は、三回くり返せば十二日続いた人になります。", author: "MiniStep" },
    { text: "誰かのすごい一歩より、自分のちいさく確かな一歩を大事にしよう。", author: "MiniStep" },
    { text: "変わっていないようで、ちゃんと少しずつ変わっています。", author: "MiniStep" },
    { text: "心が折れそうなときは、今日の小さな喜びを三つ探してみてください。", author: "MiniStep" },
    { text: "「また明日がある」と思えることも、立派な希望の一つです。", author: "MiniStep" },
    { text: "大丈夫。ゆっくりでいいから、一緒に進んでいきましょう。", author: "MiniStep" },

    // 著名人（意訳）
    { text: "困難の中にこそ、成長のチャンスが隠れています。", author: "アルベルト・アインシュタイン" },
    { text: "失敗は成功の反対ではなく、成功の一部なのです。", author: "アルベルト・アインシュタイン" },
    { text: "未来を予測するいちばん確実な方法は、自分でそれをつくることです。", author: "ピーター・ドラッカー" },
    { text: "一歩踏み出す勇気があれば、あとは自然と続いていきます。", author: "ヘレン・ケラー" },
    { text: "成功とは、熱意を失わずに失敗から失敗へと進み続けることです。", author: "ウィンストン・チャーチル" },
    { text: "ゆっくり進んでもかまわない。ただ、止まらなければいいのです。", author: "孔子" },
    { text: "千里の道も一歩から。大きな旅は小さな歩みから始まります。", author: "老子" },
    { text: "あなたが世界に見たい変化そのものに、あなた自身がなりなさい。", author: "マハトマ・ガンジー" },
    { text: "幸せとは、何を持っているかより、何に気づいているかです。", author: "オードリー・ヘプバーン" },
    { text: "夢を見ることができれば、それは実現することもできます。", author: "ウォルト・ディズニー" },
    { text: "失敗を恐れて何もしないことが、いちばん大きな失敗です。", author: "ウォルト・ディズニー" },
    { text: "あなたの時間は限られている。他人の人生を生きている暇はありません。", author: "スティーブ・ジョブズ" },
    { text: "心の声に従う勇気を持ちなさい。それはあなたが本当になりたいものを知っています。", author: "スティーブ・ジョブズ" },
    { text: "成功の秘訣は、始めること。そして続けることです。", author: "マーク・トウェイン" },
    { text: "20年後に悔やむのは、やったことよりもやらなかったことです。", author: "マーク・トウェイン" },
    { text: "失敗してもかまわない。そこから何を学ぶかがいちばん大切です。", author: "本田宗一郎" },
    { text: "チャレンジして失敗することを恐れるな。何もしないことを恐れよ。", author: "本田宗一郎" },
    { text: "努力は必ずしも報われない。しかし、成長には必ずつながる。", author: "稲盛和夫" },
    { text: "一日一日の積み重ねが、やがてとてつもない差になって現れます。", author: "稲盛和夫" },
    { text: "幸せな人生は、大きなことではなく小さな喜びの積み重ねです。", author: "ノーマン・ピール" },
    { text: "ポジティブな考え方は、問題を消しはしないが、向き合う力をくれます。", author: "ノーマン・ピール" },
    { text: "小さな親切が、誰かにとって大きな支えになることがあります。", author: "マザー・テレサ" },
    { text: "大きなことはできなくても、小さなことを大きな愛をこめて行いましょう。", author: "マザー・テレサ" },
    { text: "弱さを見せることは、負けることではなくつながることです。", author: "ブレネー・ブラウン" },
    { text: "勇気とは、怖さがなくなることではなく、それでも一歩踏み出すこと。", author: "ブレネー・ブラウン" },
    { text: "人生は10%が出来事、90%がそれにどう反応するかです。", author: "チャールズ・R・スウィンドル" },
    { text: "あなたができることを、あるもので、今いる場所で始めなさい。", author: "セオドア・ルーズベルト" },
    { text: "「できる」と信じることで、もう半分は達成しています。", author: "セオドア・ルーズベルト" },
    { text: "チャンスは準備をしている人の前にだけ、静かに現れます。", author: "オプラ・ウィンフリー" },
    { text: "過去を変えることはできないが、これからの物語は書き換えられます。", author: "オプラ・ウィンフリー" },
    { text: "自信は、できたことの積み重ねから静かに生まれます。", author: "ブレネー・ブラウン" }
];

// ===== ガチャ候補 =====
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

var LATEST_KEY = "ministep-latest-challenge";
var STATS_KEY = "ministep-stats";
var HISTORY_KEY = "ministep-history";
var THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
var ONBOARD_KEY = "ministep-onboarded";

var historyExpanded = false;
var currentTodayChallenge = null;
var selectedCategory = "all";

// --- 日付系 ---
function getDayOfYear(d) { d = d || new Date(); var s = new Date(d.getFullYear(), 0, 0); var diff = d - s; var oneDay = 86400000; return Math.floor(diff / oneDay) }
function getDateKey(d) { var yyyy = d.getFullYear(); var mm = ('0' + (d.getMonth() + 1)).slice(-2); var dd = ('0' + d.getDate()).slice(-2); return yyyy + "-" + mm + "-" + dd }
function getTodayKey() { return getDateKey(new Date()) }

// --- stats ---
function loadStats() { var raw = safeGetItem(STATS_KEY); var obj = safeParse(raw, {}); return obj || {} }
function saveStats(stats) { var s = safeStringify(stats); if (s) safeSetItem(STATS_KEY, s) }
function computeTotalStats(stats) { var totalDays = 0, totalCompleted = 0; Object.keys(stats).forEach(function (k) { var rec = stats[k]; if (rec && typeof rec.completed === "number" && rec.completed > 0) { totalDays += 1; totalCompleted += rec.completed } }); return { totalDays: totalDays, totalCompleted: totalCompleted } }
function formatTimeHM(iso) { if (!iso) return ""; var d = new Date(iso); var hh = ('0' + d.getHours()).slice(-2); var mm = ('0' + d.getMinutes()).slice(-2); return hh + ":" + mm }

// --- history ---
function loadHistory() { var raw = safeGetItem(HISTORY_KEY); var arr = safeParse(raw, []); return Array.isArray(arr) ? arr : [] }
function saveHistory(h) { var s = safeStringify(h); if (s) safeSetItem(HISTORY_KEY, s) }
function pruneHistoryTo30Days(h) { var now = Date.now(); return h.filter(function (it) { if (!it || !it.drawnAt) return false; var t = new Date(it.drawnAt).getTime(); if (isNaN(t)) return false; return now - t < THIRTY_DAYS_MS }) }

// --- LATEST ---
function loadLatestPayload() { var raw = safeGetItem(LATEST_KEY); var data = safeParse(raw, null); return (data && data.challenge) ? data : null }
function getTodayChallenge() { var p = loadLatestPayload(); if (!p || !p.challenge || !p.createdAt) return null; var c = new Date(p.createdAt); return (getDateKey(c) === getTodayKey()) ? p.challenge : null }

// --- UI描画 ---
function renderTodayHistory() {
    var countEl = document.getElementById("today-done-count");
    var listEl = document.getElementById("today-history-list");
    var toggleBtn = document.getElementById("today-history-toggle");
    if (!countEl || !listEl || !toggleBtn) return;

    var stats = loadStats();
    var key = getTodayKey();
    var rec = stats[key] || {};
    var items = Array.isArray(rec.items) ? rec.items : [];
    var count = (typeof rec.completed === "number" ? rec.completed : 0) || items.length || 0;
    countEl.textContent = count;
    listEl.innerHTML = "";

    if (items.length === 0) {
        var li = document.createElement("li"); li.className = "empty"; li.textContent = "まだチャレンジは達成していません。"; listEl.appendChild(li); toggleBtn.hidden = true; return;
    }
    var showAll = historyExpanded || items.length <= 2;
    var visible = showAll ? items : items.slice(0, 2);
    for (var i = 0; i < visible.length; i++) {
        var it = visible[i];
        var li = document.createElement("li");
        var t1 = document.createElement("span"); t1.className = "time"; t1.textContent = formatTimeHM(it.completedAt);
        var t2 = document.createElement("span"); t2.textContent = it.text;
        li.appendChild(t1); li.appendChild(t2); listEl.appendChild(li);
    }
    if (items.length > 2) { toggleBtn.hidden = false; toggleBtn.textContent = showAll ? "閉じる" : "残り" + (items.length - 2) + "件を表示" } else { toggleBtn.hidden = true }
}

function calculateStreak(stats) {
    var streak = 0; var today = new Date();
    for (var off = 0; off < 365; off++) {
        var d = new Date(today); d.setDate(d.getDate() - off);
        var key = getDateKey(d); var rec = stats[key];
        if (!rec || !rec.completed || rec.completed <= 0) break;
        streak++;
    }
    return streak;
}
function renderStreak() { var el = document.getElementById("streak-count"); if (!el) return; var stats = loadStats(); el.textContent = calculateStreak(stats) }
function renderSummary() {
    var daysEl = document.getElementById("summary-days");
    var totalEl = document.getElementById("summary-total");
    if (!daysEl || !totalEl) return;
    var stats = loadStats(); var t = computeTotalStats(stats);
    daysEl.textContent = t.totalDays; totalEl.textContent = t.totalCompleted;
}

function renderTodayChallenge() {
    var emptyEl = document.getElementById("today-challenge-empty");
    var cardEl = document.getElementById("today-challenge-card");
    var textEl = document.getElementById("today-challenge-text");
    var categoryEl = document.getElementById("today-challenge-category");
    var difficultyEl = document.getElementById("today-challenge-difficulty");
    if (!emptyEl || !cardEl || !textEl || !categoryEl || !difficultyEl) return;

    var ch = getTodayChallenge();
    currentTodayChallenge = ch;
    if (!ch) { emptyEl.style.display = "block"; cardEl.classList.remove("visible"); return; }

    emptyEl.style.display = "none";
    textEl.textContent = ch.text;
    var map = { outside: "外に出る", communication: "人と話したい", self: "じぶん時間", relax: "ゆっくりしたい", refresh: "リフレッシュ", focus: "がんばりたい" };
    categoryEl.textContent = "カテゴリ: " + (map[ch.category] || ch.category);
    var stars = Array(ch.difficulty + 1).join("★"); var empty = Array(3 - ch.difficulty + 1).join("☆");
    difficultyEl.textContent = "難易度: " + stars + empty;
    cardEl.classList.add("visible");
}

/* 進捗リング（今日の達成 0/1 を可視化） */
function updateTodayRing() {
    var stats = loadStats(); var key = getTodayKey();
    var done = (stats[key] && stats[key].completed) || 0, goal = 1;
    var pct = Math.max(0, Math.min(1, done / goal));
    var len = 163, offset = len * (1 - pct);
    var ring = document.getElementById("today-ring");
    var label = document.getElementById("today-ring-text");
    if (ring) { ring.style.strokeDashoffset = offset; }
    if (label) { label.textContent = done + "/" + goal; }
}

// --- 完了処理 ---
function addCompletionForToday(ch) {
    if (!ch) return;
    var stats = loadStats(); var key = getTodayKey();
    if (!stats[key]) stats[key] = { completed: 0, items: [] };
    if (!Array.isArray(stats[key].items)) stats[key].items = stats[key].items ? [].concat(stats[key].items) : [];
    stats[key].completed += 1;
    stats[key].items.push({ text: ch.text, category: ch.category, completedAt: new Date().toISOString() });
    saveStats(stats); renderStreak(); renderSummary(); renderTodayHistory(); updateTodayRing();
}

// --- 30日重複回避つきランダム選定 ---
function pickRandomChallenge(category) {
    var pool = challenges;
    if (category && category !== "all") { pool = challenges.filter(function (c) { return c.category === category }) }
    if (!pool.length) { alert("そのカテゴリのチャレンジがまだありません 🙇‍♀️"); return null; }
    var hist = pruneHistoryTo30Days(loadHistory()); saveHistory(hist);
    var recent = {};
    for (var i = 0; i < hist.length; i++) {
        recent[hist[i].text] = 1;
    }
    var filtered = pool.filter(function (c) { return !recent[c.text] }); if (filtered.length === 0) filtered = pool;
    if (filtered.length === 0) { alert("チャレンジ候補がまだ登録されていません。"); return null; }
    var idx = Math.floor(Math.random() * filtered.length); var chosen = filtered[idx];
    hist.push({ text: chosen.text, category: chosen.category, drawnAt: new Date().toISOString() }); saveHistory(hist);
    return chosen;
}

// === 共有（Xテキスト） ===
function buildTweetText(challenge, stats) {
    var streak = calculateStreak(stats);
    var totals = computeTotalStats(stats);
    var totalCompleted = totals.totalCompleted;
    var lines = [];
    lines.push("MiniStep で今日の一歩を達成！");
    lines.push("「" + challenge.text + "」");
    lines.push("連続" + streak + "日目 / 累計" + totalCompleted + "件");
    lines.push("#MiniStep #今日の一歩");
    var text = lines.join("\n");
    if (text.length > 270) {
        var over = text.length - 270 + 1;
        var short = challenge.text.slice(0, Math.max(0, challenge.text.length - over)) + "…";
        lines[1] = "「" + short + "」";
        text = lines.join("\n");
    }
    return text;
}
function openTweetIntent(text) {
    var urlParam = ""; // 公開URLがあればここに
    var hashtags = "MiniStep,今日の一歩";
    var intent = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text)
        + (urlParam ? "&url=" + encodeURIComponent(urlParam) : "")
        + "&hashtags=" + encodeURIComponent(hashtags);
    window.open(intent, "_blank", "noopener,noreferrer");
}

// === 共有（画像生成） ===
function roundRect(ctx, x, y, w, h, r) { var rr = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr); ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath() }
function drawMultiline(ctx, text, box) {
    var chars = text.split(""), lines = [], line = "", i;
    for (i = 0; i < chars.length; i++) {
        var t = line + chars[i];
        if (ctx.measureText(t).width > box.w) {
            lines.push(line); line = chars[i];
            if (lines.length >= box.maxLines - 1) break;
        } else { line = t }
    }
    if (line) lines.push(line);
    if (lines.length > box.maxLines) lines = lines.slice(0, box.maxLines);
    if (lines.length === box.maxLines) {
        var last = lines[box.maxLines - 1];
        while (ctx.measureText(last + "…").width > box.w && last.length > 0) { last = last.slice(0, -1) }
        lines[box.maxLines - 1] = last + "…";
    }
    for (i = 0; i < lines.length; i++) { ctx.fillText(lines[i], box.x, box.y + i * box.line); }
}
function formatShareDate(d) {
    var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
    var w = "日月火水木金土"[d.getDay()];
    return y + "/" + m + "/" + dd + " (" + w + ")";
}
function drawShareImageOnCanvas(canvas, challenge, stats) {
    var ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;

    // 背景グラデ
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#f97316"); g.addColorStop(1, "#fb923c"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 薄い円パターン
    ctx.globalAlpha = .12; ctx.fillStyle = "#fff";
    for (var i = 0; i < 12; i++) { var r = 40 + Math.random() * 100, x = Math.random() * W, y = Math.random() * H; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() }
    ctx.globalAlpha = 1;

    // 白カード
    var pad = 64, cardR = 28; ctx.fillStyle = "#fff"; roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, cardR); ctx.fill();

    // 見出し・サブ
    ctx.fillStyle = "#111827"; ctx.font = "700 48px system-ui,-apple-system,Segoe UI,sans-serif"; ctx.fillText("MiniStep 今日の一歩", pad + 36, pad + 90);
    var streak = calculateStreak(stats), totals = computeTotalStats(stats), dateStr = formatShareDate(new Date());
    ctx.font = "500 26px system-ui,-apple-system,Segoe UI,sans-serif"; ctx.fillStyle = "#6b7280";
    ctx.fillText("連続 " + streak + "日 / 累計 " + totals.totalCompleted + "件　" + dateStr, pad + 36, pad + 140);

    // 本文
    ctx.fillStyle = "#111827"; ctx.font = "700 54px system-ui,-apple-system,Segoe UI,sans-serif";
    var box = { x: pad + 36, y: pad + 210, w: W - (pad + 36) - (pad + 36), line: 68, maxLines: 4 };
    drawMultiline(ctx, "「" + challenge.text + "」", box);

    // ハッシュタグ
    ctx.font = "600 28px system-ui,-apple-system,Segoe UI,sans-serif"; ctx.fillStyle = "#9ca3af";
    ctx.fillText("#MiniStep  #今日の一歩", pad + 36, H - pad - 36);

    // 絵文字
    ctx.font = "64px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji'";
    ctx.fillText("✨", W - pad - 90, pad + 90);
}
function buildShareImageBlob(challenge) {
    return new Promise(function (resolve, reject) {
        try {
            var canvas = document.getElementById("share-canvas");
            if (!canvas) return reject(new Error("canvas not found"));
            drawShareImageOnCanvas(canvas, challenge, loadStats());
            canvas.toBlob(function (blob) { if (!blob) return reject(new Error("toBlob failed")); resolve(blob); }, "image/png", 0.95);
        } catch (e) { reject(e) }
    });
}
function shareOrDownloadImage(blob, caption) {
    var fileSupported = (typeof window.File === "function");
    if (fileSupported) {
        try {
            var file = new File([blob], "ministep.png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file], text: caption }).catch(function () { });
                return;
            }
        } catch (e) { /* fallthrough to download */ }
    }
    // フォールバック: ダウンロード
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "ministep.png";
    document.body.appendChild(a); a.click();
    setTimeout(function () {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert("画像を保存しました。Xの投稿画面で画像を添付してください。");
    }, 0);
}


// === DOMContentLoaded ===
document.addEventListener("DOMContentLoaded", function () {
    var drawBtn = document.getElementById("draw-btn");
    var categoryList = document.getElementById("category-list");
    var historyToggleBtn = document.getElementById("today-history-toggle");
    var todayCompleteBtn = document.getElementById("today-challenge-complete");

    // お祝いモーダル
    var overlay = document.getElementById("congrats-overlay");
    var messageEl = document.getElementById("congrats-message");
    var closeBtn = document.getElementById("congrats-close");
    var praise = ["今日のMiniStep、おつかれさまです。ちゃんと一歩、前に進めましたね 👣", "ナイスチャレンジ！その小さな一歩が、未来の自分のネタになります 😊", "ちゃんと行動できた自分を、少しだけ誇ってあげてください。", "やると決めて、ほんとうにやった人だけが押せるボタンです。すばらしい！", "静かだけど、たしかな一歩。MiniStep、いい感じです 🙌"];
    function openCongrats() { if (!overlay || !messageEl) return; var i = Math.floor(Math.random() * praise.length); messageEl.textContent = praise[i]; overlay.classList.add("show") }
    function closeCongrats() { if (!overlay) return; overlay.classList.remove("show") }
    if (closeBtn && overlay) { closeBtn.addEventListener("click", closeCongrats); overlay.addEventListener("click", function (e) { if (e.target === overlay) closeCongrats() }) }

    // 初回チュートリアル
    var introOverlay = document.getElementById("intro-overlay");
    var introStartBtn = document.getElementById("intro-start");
    function showIntro() { if (!introOverlay) return; var has = safeGetItem(ONBOARD_KEY) === "true"; if (!has) { introOverlay.classList.add("show") } }
    if (introStartBtn && introOverlay) {
        introStartBtn.addEventListener("click", function () { safeSetItem(ONBOARD_KEY, "true"); introOverlay.classList.remove("show") });
        document.addEventListener("keydown", function (e) { if (introOverlay.classList.contains("show") && e.key === "Escape") { safeSetItem(ONBOARD_KEY, "true"); introOverlay.classList.remove("show") } });
    }
    showIntro();

    // 今日のひとこと
    var qi = getDayOfYear() % quotes.length; var tq = quotes[qi];
    var qt = document.getElementById("daily-quote"); var qa = document.getElementById("daily-quote-author");
    if (qt && tq) qt.textContent = "「" + tq.text + "」";
    if (qa && tq) qa.textContent = "― " + tq.author;

    renderStreak(); renderSummary(); renderTodayHistory(); renderTodayChallenge(); updateTodayRing();

    if (historyToggleBtn) { historyToggleBtn.addEventListener("click", function () { historyExpanded = !historyExpanded; renderTodayHistory() }) }
    if (todayCompleteBtn) { todayCompleteBtn.addEventListener("click", function () { if (!currentTodayChallenge) { alert("今日のチャレンジが見つかりません。先にガチャを引いてください。"); return; } addCompletionForToday(currentTodayChallenge); openCongrats(); }) }

    // カテゴリ選択
    if (categoryList) {
        categoryList.addEventListener("click", function (ev) {
            var chip = ev.target.closest(".category-chip"); if (!chip) return;
            var cat = chip.getAttribute("data-category") || "all"; selectedCategory = cat;
            var chips = categoryList.querySelectorAll(".category-chip");
            for (var i = 0; i < chips.length; i++) { chips[i].classList.remove("selected") }
            chip.classList.add("selected");
        })
    }

    // ガチャ
    if (drawBtn) {
        drawBtn.addEventListener("click", function () {
            var ch = pickRandomChallenge(selectedCategory); if (!ch) return;
            var payload = { challenge: ch, createdAt: new Date().toISOString() };
            var s = safeStringify(payload); if (s) safeSetItem(LATEST_KEY, s);
            location.href = "./result.html";
        })
    }

    // Xテキスト共有
    var shareBtn = document.getElementById("congrats-share-x");
    if (shareBtn) {
        shareBtn.addEventListener("click", function () {
            var statsNow = loadStats();
            var p = loadLatestPayload(); var ch = currentTodayChallenge || (p && p.challenge);
            if (!ch) { alert("シェアできるチャレンジが見つかりませんでした。"); return; }
            var text = buildTweetText(ch, statsNow); openTweetIntent(text);
        })
    }

    // 画像共有
    var shareImgBtn = document.getElementById("congrats-share-img");
    if (shareImgBtn) {
        shareImgBtn.addEventListener("click", function () {
            var p = loadLatestPayload(); var ch = currentTodayChallenge || (p && p.challenge);
            if (!ch) { alert("シェアできるチャレンジが見つかりませんでした。"); return; }
            var streak = calculateStreak(loadStats()); var totals = computeTotalStats(loadStats());
            var caption = "MiniStep で今日の一歩を達成！\n" + "「" + ch.text + "」\n" + "連続" + streak + "日目 / 累計" + totals.totalCompleted + "件\n#MiniStep #今日の一歩";
            buildShareImageBlob(ch).then(function (blob) { shareOrDownloadImage(blob, caption) }).catch(function (err) { console.error(err); alert("画像の作成に失敗しました。もう一度お試しください。") });
        })
    }
});
