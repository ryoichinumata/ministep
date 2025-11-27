// i18n.js - language detection & simple dictionary
(function (global) {
    const SUPPORTED = ['ja', 'en'];
    const KEY = 'ministep-lang';

    const dict = {
        ja: {
            app_title: 'MiniStep – 小さな挑戦ガチャ',
            subtitle_brand: '小さな挑戦ガチャ',
            subtitle: 'ボタンを押すと、今日やってみる「ちいさなチャレンジ」が1つ出てきます。結果は次のページで表示されます。',
            daily_quote_label: '今日のひとこと',
            streak_label: '連続達成日数',
            summary_days_label: 'これまでの達成した日',
            summary_total_label: '累計チャレンジ数',
            micro_coach: 'できる範囲でOK。まずは“小さく”やってみよう。',
            unit_day: '日', unit_item: '件', unit_times: '回',

            today_challenge: '今日のチャレンジ',
            today_completions: '今日の達成したチャレンジ',
            empty_state_not_drawn: 'まだガチャを引いていません。',
            empty_today: 'まだチャレンジは達成していません。',
            filter_label: '気分でえらぶ：',
            cat_all: 'なんでも', cat_outside: '外に出る', cat_communication: '人と話したい', cat_self: 'じぶん時間', cat_relax: 'ゆっくりしたい', cat_refresh: 'リフレッシュ', cat_focus: 'がんばりたい',

            draw: 'ガチャを引く',
            mark_done: '✅ 達成した！',
            badge_today_only: '本日限定',

            reroll: '← もう一回ガチャ',
            reroll_limit: '今日の引き直し：{count} / 3 回',
            toggle_show_all: 'すべて表示',
            toggle_show_less: '閉じる',
            toggle_show_remaining: '残り {remain} 件を表示',

            today_count_label: '今日の達成数',

            back_title: 'トップへ',
            back_sub: '今日のカードに表示（達成はトップで）',
            back_hint: 'このチャレンジは今日のトップに表示されます。達成したらトップで「✅ 達成した！」を押してください。',

            qa_timer: '⏱ 3分タイマー',
            qa_memo: '📝 メモを開く',
            qa_map: '🧭 近くを歩く',
            timer_done: '3分経ちました。おつかれさま！',

            congrats_title: '🎉 Congratulation！',
            share_img: '画像でシェア',
            share_x: '𝕏 にシェア',
            congrats_ok: 'OK',
            toast_streak: '🎉 連続 {n} 日。いいペース！',

            alert_no_category: 'そのカテゴリのチャレンジがまだありません 🙇‍♀️',
            alert_no_candidates: 'チャレンジ候補がまだ登録されていません。',
            alert_no_today: '今日のチャレンジが見つかりません。先にガチャを引いてください。',
            alert_direct_link: 'まだガチャが引かれていません。最初のページでガチャを引いてください！',
            alert_reroll_limit: '今日の引き直しは3回までです。',
            alert_share_missing: 'シェアできるチャレンジが見つかりませんでした。',
            alert_img_saved: '画像を保存しました。Xの投稿画面で画像を添付してください。',
            alert_img_error: '画像の作成に失敗しました。もう一度お試しください。',

            intro_start: 'はじめる'
        },
        en: {
            app_title: 'MiniStep – Daily Draw',
            subtitle_brand: 'One tiny challenge a day',
            subtitle: 'Tap to draw one tiny challenge for today. The result appears on the next page.',
            daily_quote_label: 'Daily quote',
            streak_label: 'Streak',
            summary_days_label: 'Days completed',
            summary_total_label: 'Total challenges',
            micro_coach: 'Start tiny. Any small step counts.',
            unit_day: 'days', unit_item: 'items', unit_times: 'times',

            today_challenge: 'Today’s challenge',
            today_completions: 'Today’s completions',
            empty_state_not_drawn: 'You haven’t drawn today.',
            empty_today: 'No completions yet.',
            filter_label: 'Choose by mood:',
            cat_all: 'Anything', cat_outside: 'Go outside', cat_communication: 'Talk to someone', cat_self: 'Me time', cat_relax: 'Relax', cat_refresh: 'Refresh', cat_focus: 'Focus',

            draw: 'Draw today’s challenge',
            mark_done: '✅ Mark done',
            badge_today_only: 'Today only',

            reroll: '← Draw again',
            reroll_limit: 'Redraws today: {count} / 3',
            toggle_show_all: 'Show all',
            toggle_show_less: 'Show less',
            toggle_show_remaining: 'Show {remain} more',

            today_count_label: 'Today’s count',

            back_title: 'Back to Home',
            back_sub: 'Kept as today’s card (mark on Home)',
            back_hint: 'This challenge will be shown on Home today. Mark it as done there when you finish.',

            qa_timer: '⏱ 3-min timer',
            qa_memo: '📝 Open memo',
            qa_map: '🧭 Take a short walk',
            timer_done: '3 minutes passed. Nice job!',

            congrats_title: '🎉 Congratulations!',
            share_img: 'Share as image',
            share_x: 'Share on 𝕏',
            congrats_ok: 'OK',
            toast_streak: '🎉 {n}-day streak. Great pace!',

            alert_no_category: 'No challenges in this category yet 🙇‍♀️',
            alert_no_candidates: 'No challenge candidates are registered yet.',
            alert_no_today: 'No challenge for today. Please draw first.',
            alert_direct_link: 'No draw yet. Please draw on the first page!',
            alert_reroll_limit: 'Up to 3 redraws per day.',
            alert_share_missing: 'No challenge to share.',
            alert_img_saved: 'Image saved. Attach it in your X post.',
            alert_img_error: 'Failed to create image. Please try again.',

            intro_start: 'Get started'
        }
    };

    function detect() {
        const saved = localStorage.getItem(KEY);
        if (saved && SUPPORTED.includes(saved)) return saved;

        const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map(s => (s || '').toLowerCase());
        for (const tag of langs) {
            const base = tag.split('-')[0];
            if (SUPPORTED.includes(base)) return base;
        }
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (tz === 'Asia/Tokyo') return 'ja';
        } catch (e) { }
        return 'en';
    }

    function get() { return localStorage.getItem(KEY) || detect(); }
    function set(lang) {
        if (!SUPPORTED.includes(lang)) return;
        localStorage.setItem(KEY, lang);
        document.documentElement.setAttribute('lang', lang);
        apply();
        document.title = t('app_title');
    }

    function t(key, params) {
        const lang = get();
        const table = dict[lang] || dict.en;
        let s = table[key] || dict.en[key] || key;
        if (params) {
            Object.keys(params).forEach(k => {
                s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(params[k]));
            });
        }
        return s;
    }

    function apply() {
        document.title = t('app_title');
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const arg = el.getAttribute('data-i18n-arg');
            const params = arg ? JSON.parse(arg) : undefined;
            el.textContent = t(key, params);
        });
    }

    function mountSwitcher() {
        if (document.getElementById('lang-switcher')) return;
        const host = document.createElement('div');
        host.id = 'lang-switcher';
        host.innerHTML = `
      <button type="button" aria-label="Change language" title="Language" class="lang-btn">EN / JA</button>
      <div class="lang-menu" hidden>
        <button data-lang="en">English</button>
        <button data-lang="ja">日本語</button>
      </div>`;
        document.body.appendChild(host);
        const btn = host.querySelector('.lang-btn');
        const menu = host.querySelector('.lang-menu');
        btn.addEventListener('click', () => { menu.hidden = !menu.hidden; });
        menu.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-lang]');
            if (!b) return;
            set(b.getAttribute('data-lang'));
            menu.hidden = true;
        });
        document.addEventListener('click', (e) => { if (!host.contains(e.target)) menu.hidden = true; });
    }

    global.I18N = { init() { set(get()); }, get, set, t, apply, mountSwitcher };
})(window);
