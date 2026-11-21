# RULESページの統一修正

## 変更内容

- 01〜07を共通の2列グリッドに統一。スマホでは同じ番号＋見出しの配置から本文へ続く1列構成。
- 全章の背景を同じ淡いグリーングレーに統一。章ごとの色替え・傾き・異なる英字サイズを撤去。
- 番号、英語、日本語見出し、横幅、上下余白、区切り線を `assets/scss/pages/rules/_system.scss` に集約。
- 01・02の情報ブロックは共通 `.topic` を使用。チーム3色は人数の区別に必要なため維持。
- 02の見出しの上にあったイラストを導入文の本文側へ移動。
- RULESに既存HOMEから6問のFAQを掲載。既存ルール・FAQの文章を流用し、新しい運用条件は追加していません。
- HOMEとRULESでFAQのSCSS・JavaScriptを共有。Q/Aを拡大し、560msの開閉に変更。
- アニメーション途中の再クリック、画面幅変更、MOTION OFF、OSの動きを減らす設定に対応。
- 共通ボタンは文字中央、対称の余白、2pxの枠に整理。ホバー・キーボードフォーカスで背景と文字色を反転し、transformやサイズ変更は行いません。

## 確認結果

- `npm run build` / `npm run check` 成功。5ページのID・画像・内部リンク・ページ間アンカーを確認。
- RULESとHOMEの既存見出し・段落・箇条書き・リンク先を修正前のGit版と比較し、保持を確認。
- 全5ページ × 320 / 390 / 768 / 1440px相当のブラウザー内フレーム幅で確認。ページ横はみ出し、見出し・ボタンの文字切れなし。
- RULESの番号7個のサイズ・色・transformと、8章分の背景が同一であることを各幅で測定。
- RULESのFAQはクリック、連続開閉、Spaceキー、MOTION OFF中の開閉を確認。
- HOMEのFAQも開ききった後に高さがautoに戻り、回答の全文が表示されることを確認。
- ボタンの背景・文字色反転、幅・高さの維持、transform:noneを確認。
- サイト由来のJavaScriptエラーは観測されませんでした。ブラウザー拡張のログは除外。
- 実機iPhone/Android、およびOS設定自体を変更しての試験は未実施。

## 主な編集ファイル

- `rules.html`
- `assets/scss/pages/rules/_system.scss`
- `assets/scss/pages/rules/sections/*.scss`
- `assets/scss/common/_base.scss`
- `assets/scss/common/_faq.scss`
- `assets/js/common/accordion.js`
- `assets/js/pages/rules/sections/faq.js`
- `assets/js/pages/home/sections/faq.js`
