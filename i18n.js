// i18n.js - 日本語専用辞書
(function (global) {
    "use strict";

    var dict = {
        app_title: "MiniStep – 小さなチャレンジガチャ",
        subtitle_brand: "小さな挑戦ガチャ",
        subtitle: "ボタンをタップして今日のチャレンジを1つ引こう。結果は次のページに表示されます。",

        daily_quote_label: "今日の名言",
        streak_label: "連続記録",
        summary_days_label: "達成日数",
        summary_total_label: "合計チャレンジ",
        today_count_label: "今日の達成数",
        micro_coach: "小さく始めよう。どんな一歩でも前進。",
        unit_day: "日",
        unit_item: "個",
        unit_times: "回",

        today_challenge: "今日のチャレンジ",
        empty_state_not_drawn: "まだ今日のチャレンジを引いていません。",
        filter_label: "気分で選ぶ：",

        cat_all: "なんでも",
        cat_outside: "外に出る",
        cat_communication: "人と話す",
        cat_self: "自分時間",
        cat_relax: "リラックス",
        cat_refresh: "気分転換",
        cat_focus: "集中",

        draw: "今日のチャレンジを引く",
        draw_disabled: "明日またね",

        badge_today_only: "本日限り",
        mark_done: "✅ 達成した",
        stamp_done: "達成",

        congrats_title: "🎉 おめでとう！",
        congrats_ok: "OK",
        toast_streak: "🎉 {n}日連続達成！すごいペース！",

        alert_no_category: "このカテゴリのチャレンジはまだありません 🙇",
        alert_no_candidates: "チャレンジ候補がまだ登録されていません。",
        alert_no_today: "今日のチャレンジがありません。先に引いてください。",
        alert_direct_link: "まだ引いていません。最初のページで引いてください！",
        alert_share_missing: "シェアするチャレンジがありません。",
        alert_img_saved: "画像を保存しました。Xの投稿に添付してください。",
        alert_img_error: "画像の作成に失敗しました。もう一度試してください。",
        alert_reroll_limit: "1日3回まで引き直せます。",
        alert_already_completed: "今日のチャレンジはもう達成済みです！頑張りすぎないで。また明日！",

        reroll: "← 引き直す",
        reroll_limit: "本日の引き直し: {count} / 3",
        back_title: "ホームに戻る",
        back_sub: "今日のカードとして表示されます（ホームで達成をタップ）。",
        back_hint: "このチャレンジは今日のホームカードに表示されます。完了したらそこで達成をタップ。",
        qa_timer: "⏱ 3分タイマー",
        qa_memo: "📝 メモを開く",
        qa_map: "🧭 近くを散歩",
        timer_done: "3分経ちました。よくできました！",

        share_x: "𝕏でシェア",

        intro_start: "はじめる",

        label_category:   "カテゴリ: ",
        label_difficulty:  "難易度: "
    };

    function t(key, params) {
        var s = dict[key] || key;
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

    function get() { return "ja"; }

    function init() {
        try {
            document.documentElement.setAttribute("lang", "ja");
        } catch (e) { }
        apply();
    }

    global.I18N = {
        init: init,
        get: get,
        set: function () {},
        t: t,
        apply: apply,
        mountSwitcher: function () {}
    };
})(window);
