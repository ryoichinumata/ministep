// i18n.js - English-only dictionary
(function (global) {
    "use strict";

    var dict = {
        app_title: "MiniStep – Tiny Challenge Gacha",
        subtitle_brand: "Tiny challenge gacha",
        subtitle: "Tap the button to draw one tiny challenge for today. The result is shown on the next page.",

        daily_quote_label: "Daily quote",
        streak_label: "Streak",
        summary_days_label: "Days completed",
        summary_total_label: "Total challenges",
        today_count_label: "Today's count",
        micro_coach: "Start tiny. Any small step counts.",
        unit_day: "days",
        unit_item: "items",
        unit_times: "times",

        today_challenge: "Today's challenge",
        empty_state_not_drawn: "You haven't drawn today.",
        filter_label: "Choose by mood:",

        cat_all: "Anything",
        cat_outside: "Go outside",
        cat_communication: "Talk to someone",
        cat_self: "Me time",
        cat_relax: "Relax",
        cat_refresh: "Refresh",
        cat_focus: "Focus",

        draw: "Draw today's challenge",
        draw_disabled: "Come back tomorrow",

        badge_today_only: "Today only",
        mark_done: "✅ Mark done",
        stamp_done: "Done",

        congrats_title: "🎉 Congratulations!",
        congrats_ok: "OK",
        toast_streak: "🎉 {n}-day streak. Great pace!",

        alert_no_category: "No challenges in this category yet 🙇",
        alert_no_candidates: "No challenge candidates are registered yet.",
        alert_no_today: "No challenge for today. Please draw first.",
        alert_direct_link: "No draw yet. Please draw on the first page!",
        alert_share_missing: "No challenge to share.",
        alert_img_saved: "Image saved. Attach it in your X post.",
        alert_img_error: "Failed to create image. Please try again.",
        alert_reroll_limit: "Up to 3 redraws per day.",
        alert_already_completed: "You already completed today's challenge! Don't push yourself too hard. Come back tomorrow.",

        reroll: "← Draw again",
        reroll_limit: "Redraws today: {count} / 3",
        back_title: "Back to Home",
        back_sub: "It will be shown as today's card (mark done on Home).",
        back_hint: "This challenge will appear on the Home card today. Mark it done there when you finish.",
        qa_timer: "⏱ 3-min timer",
        qa_memo: "📝 Open memo",
        qa_map: "🧭 Nearby walk",
        timer_done: "3 minutes passed. Nice job!",

        share_x: "Share on 𝕏",

        intro_start: "Get started",

        label_category:   "Category: ",
        label_difficulty:  "Difficulty: "
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

    function get() { return "en"; }

    function init() {
        try {
            document.documentElement.setAttribute("lang", "en");
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
