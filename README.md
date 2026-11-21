# OWN PACE 公式サイト v2

引継ぎパック「OWN_PACE_Work_Handoff_v1.zip」の制作指示書をもとにした、HOME + 下層4ページの実装です。

## 最初に見る場所

- `dist/index.html` が公開用のHOMEです。各ページはES Modulesを使うため、HTTPサーバー経由で表示してください。
- `docs/STATUS.md`: 実装済み・仮表示・外部設定待ち・未実装・既知の制限
- `docs/DIFFERENCES.md`: 旧版からの維持点と変更点
- `SPECIFICATION.md`: 添付の制作指示書

## 必要な環境

Node.js 22以上 / npm。

```sh
npm ci
npm run dev
```

初回ビルドが終わったら `http://localhost:8080/` を開きます。
HTML・SCSS・JSを保存すると再ビルドします。ブラウザを再読み込みしてください。

```sh
npm run build
npm run check
```

`dist/` へHTML・コンパイル済みCSS・バンドル済みJS・画像を書き出します。ファイルを直接ダブルクリックせず、ローカルサーバーから表示してください。

## GitHub Pages

1. このZIPの中身をリポジトリのルートへ配置します。`.github` を含めてください。
2. GitHubの Settings → Pages → Source を **GitHub Actions** にします。
3. `main` ブランチへpushすると、自動でSCSS・JSをビルド、チェックして公開します。
4. ブランチが `main` 以外なら `.github/workflows/deploy.yml` を変更します。

公開URLは `actions/configure-pages` の出力からビルドへ渡され、canonical / OGP URL / sitemapを生成します。
まだリポジトリへのアップロードやデプロイはしていません。

## 編集するファイル

| 内容 | 場所 |
| --- | --- |
| HOME | `index.html` |
| 下層 | `schedule.html`, `rules.html`, `rank.html`, `report.html` |
| ページ別SCSS入口 | `assets/scss/home.scss` など |
| セクションSCSS | `assets/scss/pages/ページ名/sections/_セクション名.scss` |
| セクションJS | `assets/js/pages/ページ名/sections/セクション名.js` |
| セクション画像 | `assets/img/ページ名/セクション名/` |
| 共用背景 | `assets/img/common/backgrounds/` |
| 共通UIのJS | `assets/js/common/` |
| 日程・外部リンク・ロゴ設定 | `assets/js/config/site.js` |

同じ写真を使うシーンでは、画像を重複保存せず共用背景を参照します。画像を使っていないセクションのフォルダには説明ファイルだけ入っています。
`assets/css/` と `dist/` は自動生成で、直接編集しません。

## 更新時の注意

### 開催情報

HOMEの次回開催は `site.js` の `games` を日付順に参照します。日本時間で終了済みの回を除外し、未登録なら準備中と表示します。
Googleカレンダーの埋め込みとは**別データ**です。GoogleカレンダーからHOMEの日時や残席を自動取得する仕組みは未実装です。
予約済みの2027年2月17日20〜22時・ももち体育館1/2B面を初期データに入れています。残席と予約受付は未確認のため準備中です。

### LINE / 正式ロゴ

`lineUrl`, `bookingUrl`, `logoUrl` は未設定です。
- LINEのURLが未設定の間は、参加方法の案内ダイアログを表示します。
- 正式ロゴが未設定の間は、プレーンなサイト名を表示します。新しいロゴを作成したものではありません。
- `logoUrl` に例えば `assets/img/common/brand/logo.svg` を設定すると読み込みます。

### ランク / REPORT

特典内容は掲載していません。個人別の参加回数・ショップカードとの自動連携は行っていません。
REPORTには実際の活動写真が提供されるまで、活動記事や架空の写真を追加しないでください。

### 動き

HOMEのABOUT〜MEMBERSHIPだけ、GSAP + ScrollTriggerの単一pinタイムラインで制御します。
動きを停止した場合、reduced-motion、GSAP未読込、画面高さ640px未満では通常スクロールになります。全5シーンとリンクにアクセスできます。
FAQは最初は閉じています。JavaScript無効時は回答を表示する代替表示です。

### SEO / 計測

公開前にローカルでSEOを確認する場合は、実際の公開URLを `site.publicUrl` に設定するか、環境変数 `SITE_URL` を渡してビルドします。
URL未設定のローカルビルドでは、架空のcanonical・sitemapは生成しません。
測定IDは入れていません。CTAクリック時は `ownpace:cta` のCustomEventを発行します。`analyticsEnabled` をtrueにした場合だけdataLayerへ同じ情報を送ります。GA4/GTMのコンテナ自体は別途設定が必要です。

画像は生成したブランド用イメージです。実際の会場・活動写真として扱っていません。詳細は `docs/IMAGE_SOURCES.md` を参照してください。
