# 入れ替え手順
1. GitHub Desktop の Repository > Show in Explorer で対象フォルダを開く。
2. フォルダ全体を別の場所にバックアップする（未コミットの変更も保存）。
3. 隠しファイルを表示し、ルートの `.git` を残して他の内容を削除する。
4. このZIPの中身を同じフォルダに展開する。package.json と .github が .git と同じ階層にあることを確認する。
5. GitHub Desktop で差分を確認し Commit / Push。Actions の成功を確認する。
6. 予約画面をLINEから開き、MY PAGE・誕生日・予約、管理画面の会員・出席・支払い・通知を確認する。

SQL、Edge Functions、LINE設定は変更しない。既存の画像とサイトのソースは維持。重複したサイト、参照用コピー、入れ子のパッチを除外。法務ページのCSSもビルド対象に追加。npm依存がローカルにないため全ビルドは未検証。GitHub Actionsで確認すること。
