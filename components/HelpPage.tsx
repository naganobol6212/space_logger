
import React, { useState } from 'react';
import { ThemeType } from '../types';

interface HelpPageProps {
  theme?: ThemeType;
}

const steps = [
  {
    number: '01',
    icon: 'login',
    title: 'GitHubでログイン',
    description: 'ログイン画面でGitHubアカウントを使ってサインイン。メールアドレスでの登録も可能です。',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-400/30',
    iconColor: 'text-blue-400',
  },
  {
    number: '02',
    icon: 'edit_note',
    title: '学習を記録する',
    description: '学習タイトル・時間・タグ・メモを入力して「記録する」ボタンを押すだけ。毎日の積み重ねをログに残しましょう。',
    color: 'from-primary/20 to-amber-500/20',
    borderColor: 'border-primary/30',
    iconColor: 'text-primary',
  },
  {
    number: '03',
    icon: 'deployed_code',
    title: 'GitHubに草を生やす',
    description: '記録後の画面で「GitHubに同期して草を生やす」ボタンを押すと、あなたのGitHubリポジトリに学習ログが自動コミットされます。',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/30',
    iconColor: 'text-green-400',
  },
  {
    number: '04',
    icon: 'history',
    title: '履歴を振り返る',
    description: '「履歴」タブで過去の学習ログを確認・編集・削除できます。記録の修正もかんたんにできます。',
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-400/30',
    iconColor: 'text-purple-400',
  },
  {
    number: '05',
    icon: 'monitoring',
    title: '分析で成長を確認',
    description: '「分析」タブで週間・月間の学習時間グラフやタグ別の傾向を確認。自分の成長を可視化しましょう。',
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-400/30',
    iconColor: 'text-rose-400',
  },
];

const faqs = [
  {
    q: 'GitHubに草を生やすには何が必要ですか？',
    a: 'GitHubアカウントでのログインが必要です。ログイン後に学習を記録すると、同期ボタンが表示されます。',
  },
  {
    q: 'どのリポジトリにコミットされますか？',
    a: 'あなたのGitHubアカウントに「space-logger」という名前のリポジトリが自動作成され、そこに学習ログが保存されます。それ以外のリポジトリにはアクセスしません。',
  },
  {
    q: 'データはどこに保存されますか？',
    a: '学習ログはSupabase（クラウドDB）に保存されます。どのデバイスからでも同じデータにアクセスできます。',
  },
  {
    q: '無料で使えますか？',
    a: 'はい、完全無料で使えます。',
  },
];

const HelpPage: React.FC<HelpPageProps> = ({ theme = 'dark' }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full animate-fade-in-up pb-24 md:pt-8">
      <header className="pt-14 px-6 pb-8 md:pt-6">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-blue-200 drop-shadow-sm">
          使い方
        </h1>
        <p className="text-[10px] text-blue-500 dark:text-blue-300 font-bold mt-1 tracking-widest uppercase">HOW TO USE</p>
      </header>

      <main className="px-4 max-w-2xl mx-auto w-full space-y-8">

        {/* ミッション説明 */}
        <div className="w-full bg-gradient-to-r from-blue-500/10 to-primary/10 border border-primary/20 rounded-3xl p-6 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <span className="material-symbols-outlined text-4xl text-primary relative z-10 filled">rocket_launch</span>
          </div>
          <div>
            <p className="font-black text-slate-800 dark:text-white text-base">Space Logger とは？</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
              毎日の学習を記録して、GitHubに草を生やすアプリです。学習の継続をエンジニアらしく可視化しましょう。
            </p>
          </div>
        </div>

        {/* ステップ */}
        <section>
          <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">STEPS</p>
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`w-full bg-gradient-to-r ${step.color} border ${step.borderColor} rounded-2xl p-5 flex items-start gap-4`}
              >
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <span className={`material-symbols-outlined text-2xl ${step.iconColor} filled`}>{step.icon}</span>
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-500">{step.number}</span>
                </div>
                <div>
                  <p className="font-black text-slate-800 dark:text-white text-sm">{step.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">FAQ</p>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-white pr-4">{faq.q}</span>
                  <span className={`material-symbols-outlined text-slate-400 dark:text-gray-500 shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="h-4" />
      </main>
    </div>
  );
};

export default HelpPage;
