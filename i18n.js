// i18n.js - language detection & simple dictionary
(function (global) {
    var SUPPORTED = ["ja", "en"];
    var KEY = "ministep-lang";

    var dict = {
        ja: {
            app_title: "MiniStep – 小さな挑戦ガチャ",
            subtitle_brand: "小さな挑戦ガチャ",
            subtitle: "ボタンを押すと、今日やってみる「ちいさなチャレンジ」が1つ出てきます。結果は次のページで表示されます。",

            daily_quote_label: "今日のひとこと",
            streak_label: "連続達成日数",
            summary_days_label: "これまでの達成した日",
            summary_total_label: "累計チャレンジ数",
            today_count_label: "今日の達成数",
            micro_coach: "できる範囲でOK。まずは“小さく”やってみよう。",
            unit_day: "日",
            unit_item: "件",
            unit_times: "回",

            today_challenge: "今日のチャレンジ",
            empty_state_not_drawn: "まだガチャを引いていません。",
            filter_label: "気分でえらぶ：",

            cat_all: "なんでも",
            cat_outside: "外に出る",
            cat_communication: "人と話したい",
            cat_self: "じぶん時間",
            cat_relax: "ゆっくりしたい",
            cat_refresh: "リフレッシュ",
            cat_focus: "がんばりたい",

            draw: "ガチャを引く",
            // ★ 当日達成済みのときのガチャボタン文言
            draw_disabled: "また明日",

            badge_today_only: "本日限定",
            mark_done: "✅ 達成した！",
            stamp_done: "達成",

            congrats_title: "🎉 Congratulation！",
            congrats_ok: "OK",
            toast_streak: "🎉 連続 {n} 日。いいペース！",

            alert_no_category: "そのカテゴリのチャレンジがまだありません 🙇‍♀️",
            alert_no_candidates: "チャレンジ候補がまだ登録されていません。",
            alert_no_today: "今日のチャレンジが見つかりません。先にガチャを引いてください。",
            alert_direct_link: "まだガチャが引かれていません。最初のページでガチャを引いてください！",
            alert_share_missing: "シェアできるチャレンジが見つかりませんでした。",
            alert_img_saved: "画像を保存しました。Xの投稿画面で画像を添付してください。",
            alert_img_error: "画像の作成に失敗しました。もう一度お試しください。",
            alert_reroll_limit: "今日の引き直しは3回までです。",
            alert_already_completed: "今日のチャレンジは達成しています！あまり頑張りすぎないでください。明日またチャレンジしよう。",

            // result.html 用
            reroll: "← もう一回ガチャ",
            reroll_limit: "今日の引き直し：{count} / 3 回",
            back_title: "トップへ",
            back_sub: "今日のカードに表示されます（達成はトップで）。",
            back_hint: "このチャレンジは今日のトップに表示されます。達成したらトップで「✅ 達成した！」を押してください。",
            qa_timer: "⏱ 3分タイマー",
            qa_memo: "📝 メモを開く",
            qa_map: "🧭 近くを歩く",
            timer_done: "3分経ちました。おつかれさま！",

            share_x: "𝕏 にシェア",

            intro_start: "はじめる",

            label_category:  "カテゴリ: ",
            label_difficulty: "難易度: "
        },

        en: {
            app_title: "MiniStep – Tiny Challenge Gacha",
            subtitle_brand: "Tiny challenge gacha",
            subtitle: "Tap the button to draw one tiny challenge for today. The result is shown on the next page.",

            daily_quote_label: "Daily quote",
            streak_label: "Streak",
            summary_days_label: "Days completed",
            summary_total_label: "Total challenges",
            today_count_label: "Today’s count",
            micro_coach: "Start tiny. Any small step counts.",
            unit_day: "days",
            unit_item: "items",
            unit_times: "times",

            today_challenge: "Today’s challenge",
            empty_state_not_drawn: "You haven’t drawn today.",
            filter_label: "Choose by mood:",

            cat_all: "Anything",
            cat_outside: "Go outside",
            cat_communication: "Talk to someone",
            cat_self: "Me time",
            cat_relax: "Relax",
            cat_refresh: "Refresh",
            cat_focus: "Focus",

            draw: "Draw today’s challenge",
            // ★ 当日達成済みのときのガチャボタン文言
            draw_disabled: "Come back tomorrow",

            badge_today_only: "Today only",
            mark_done: "✅ Mark done",
            stamp_done: "Done",

            congrats_title: "🎉 Congratulations!",
            congrats_ok: "OK",
            toast_streak: "🎉 {n}-day streak. Great pace!",

            alert_no_category: "No challenges in this category yet 🙇‍♀️",
            alert_no_candidates: "No challenge candidates are registered yet.",
            alert_no_today: "No challenge for today. Please draw first.",
            alert_direct_link: "No draw yet. Please draw on the first page!",
            alert_share_missing: "No challenge to share.",
            alert_img_saved: "Image saved. Attach it in your X post.",
            alert_img_error: "Failed to create image. Please try again.",
            alert_reroll_limit: "Up to 3 redraws per day.",
            alert_already_completed: "You already completed today’s challenge! Don’t push yourself too hard. Come back tomorrow.",

            reroll: "← Draw again",
            reroll_limit: "Redraws today: {count} / 3",
            back_title: "Back to Home",
            back_sub: "It will be shown as today’s card (mark done on Home).",
            back_hint: "This challenge will appear on the Home card today. Mark it done there when you finish.",
            qa_timer: "⏱ 3-min timer",
            qa_memo: "📝 Open memo",
            qa_map: "🧭 Nearby walk",
            timer_done: "3 minutes passed. Nice job!",

            share_x: "Share on 𝕏",

            intro_start: "Get started",

            label_category:   "Category: ",
            label_difficulty:  "Difficulty: "
        }
    };

    // detect() はブラウザ言語のみを参照する（localStorage の確認は get() 側で行う）
    function detect() {
        var langs = [];
        if (navigator.languages && navigator.languages.length) {
            langs = navigator.languages;
        } else if (navigator.language) {
            langs = [navigator.language];
        } else {
            langs = ["en"];
        }
        var i;
        for (i = 0; i < langs.length; i++) {
            var tag = (langs[i] || "").toLowerCase();
            var base = tag.split("-")[0];
            if (SUPPORTED.indexOf(base) !== -1) return base;
        }

        try {
            var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
            if (tz === "Asia/Tokyo") return "ja";
        } catch (e2) { }

        return "en";
    }

    function get() {
        try {
            var saved = localStorage.getItem(KEY);
            if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
        } catch (e) { }
        return detect();
    }

    function t(key, params) {
        var lang = get();
        var table = dict[lang] || dict.en;
        var s = table[key] || dict.en[key] || key;
        if (params) {
            var k;
            for (k in params) {
                if (!params.hasOwnProperty(k)) continue;
                var re = new RegExp("\\{" + k + "\\}", "g");
                s = s.replace(re, String(params[k]));
            }
        }
        return s;
    }

    function apply() {
        try {
            var list = document.querySelectorAll("[data-i18n]");
            var i;
            for (i = 0; i < list.length; i++) {
                var el = list[i];
                var key = el.getAttribute("data-i18n");
                var arg = el.getAttribute("data-i18n-arg");
                var params = null;
                if (arg) {
                    try { params = JSON.parse(arg); } catch (e) { params = null; }
                }
                el.textContent = t(key, params);
            }
        } catch (e) { }
    }

    function set(lang) {
        if (SUPPORTED.indexOf(lang) === -1) return;
        try {
            localStorage.setItem(KEY, lang);
        } catch (e) { }
        try {
            document.documentElement.setAttribute("lang", lang);
        } catch (e2) { }
        apply();
    }

    function init() {
        set(get());
    }

    function mountSwitcher() {
        if (document.getElementById("lang-switcher")) return;
        var host = document.createElement("div");
        host.id = "lang-switcher";
        host.innerHTML =
            '<button type="button" aria-label="Change language" title="Language" class="lang-btn">EN / JA</button>' +
            '<div class="lang-menu" hidden>' +
            '<button data-lang="en">English</button>' +
            '<button data-lang="ja">日本語</button>' +
            "</div>";
        document.body.appendChild(host);

        var btn = host.querySelector(".lang-btn");
        var menu = host.querySelector(".lang-menu");
        btn.addEventListener("click", function () {
            menu.hidden = !menu.hidden;
        });
        menu.addEventListener("click", function (e) {
            var target = e.target || e.srcElement;
            if (!target || !target.getAttribute) return;
            var lang = target.getAttribute("data-lang");
            if (!lang) return;
            set(lang);
            menu.hidden = true;
        });
        document.addEventListener("click", function (e) {
            if (!host.contains(e.target)) menu.hidden = true;
        });
    }

    global.I18N = {
        init: init,
        get: get,
        set: set,
        t: t,
        apply: apply,
        mountSwitcher: mountSwitcher
    };
})(window);