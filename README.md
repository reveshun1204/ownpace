# OWN PACE

デザイン改修ソース一式です。変更内容・26項目の対応・確認結果・未確認事項・反映手順は [完了報告](docs/DESIGN_REFINEMENT.md) を参照してください。

Node.js 22以上で実行します。

```sh
npm ci
npm run build
npm run check
npm test
npm run dev
```

公開成果物は `dist/`、生成CSSは `assets/css/` に作成されます。ソースHTMLの直開きではなくローカルサーバーで確認してください。

変更ファイル一覧: [CHANGED_FILES.md](docs/CHANGED_FILES.md)
