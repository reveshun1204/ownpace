# 実装状況

最新の修正・確認結果は [FINAL_FIXES.md](FINAL_FIXES.md) を参照してください。

## サイト

HOME / SCHEDULE / RULES / RANK / REPORTの5ページ。添付のEditorialテーマ、ロゴSVG、人物イラストを維持しています。スマホの固定シーンはCSS sticky、PCはGSAPを使用。FAQ、メニュー、動きの停止、カレンダー切替を備えています。

ランクはREGULAR 5回・ALLSTAR 10回・LEGEND 25回・GOAT 50回。特典内容は非公開です。

## 予約・管理デモ

reservation/ と admin/ は同じブラウザ内だけで連動する試作版。実予約には使用しません。LINE認証、GAS、スプレッドシート、通知、本番管理者認証、同時予約対策は未実装です。

## 外部設定

公式LINE／参加予約の本番URL、公開先、Googleカレンダーの公開権限、計測IDの設定が必要です。HOMEの日程は assets/js/config/site.js で管理し、カレンダーやデモとの自動同期はありません。

## 編集と公開

HTML・SCSS・JSを編集し npm run build でdistを再生成。npm run check と npm test で検査できます。distはビルド済みです。GitHub Actionsで公開する場合はソース一式をリポジトリのルートへ配置し、PagesをGitHub Actionsに設定してください。

実機Safari／LINE内ブラウザ、本番の外部予約連携、カレンダーの予定内容は今回の検証範囲外です。
