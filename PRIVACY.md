# アクセス解析・外部送信について

このサイトでは、閲覧状況と表示品質を把握し、サイトを改善するためにCloudflare Web Analyticsを利用しています。

## 外部へ送信される情報

ページの表示時に、閲覧ページのホスト名とパス、参照元、国、端末の種類、ブラウザ、OS、ナビゲーションの種類、ページの表示速度などがCloudflare, Inc.へ送信されます。URLのクエリ文字列は記録されません。

送信先は `static.cloudflareinsights.com` および `cloudflareinsights.com` です。送信の目的は、ページビューや訪問数、流入元、利用環境、表示性能を集計し、このサイトの構成と内容を改善することです。

## Cookieと保存期間

Cloudflare Web AnalyticsはCookie、localStorage、sessionStorageを使用せず、異なるサイトをまたいで閲覧者を追跡しません。サイト運営者が閲覧者の氏名やメールアドレスを取得することもありません。

Cloudflareの説明では、未集計のビーコンデータは7日間保持された後に集計され、ダッシュボード上の集計データは6か月間確認できます。JavaScriptを無効化または分析用スクリプトをブロックした場合、アクセス解析の情報は送信されません。

詳しい収集項目と取り扱いは、[Cloudflare Web Analyticsのデータ収集に関する説明](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/){:target="_blank" rel="noopener"}および[Cloudflareのプライバシーポリシー](https://www.cloudflare.com/privacypolicy/){:target="_blank" rel="noopener"}をご覧ください。

最終更新: 2026年10月29日
