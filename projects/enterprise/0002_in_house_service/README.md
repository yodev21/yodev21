# プロジェクト名: アサインナビ開発
期間: 2021年3月～2021年9月
稼働率: 100%
役割: リードエンジニア（バックエンドおよびフロントエンド）

## 概要
IT・コンサルティング領域に特化し た、仕事を依頼する側と仕事を受ける側が効率的に 直接出会えるマッチングサイトです。
本プロジェクトでは、2週間単位のスプリントでアジャイル開発を実施し、新機能や改善を継続的にリリースすることで、ユーザーからのフィードバックに迅速に対応。リリースサイクルを最適化し、プロダクトの価値を高めました。

## 実施内容と成果
### 開発環境の最適化

VagrantからDockerへの移行を主導。環境構築時間を平均1.5時間から15分に短縮し、開発効率を大幅に向上。
Docker Composeを用いた統合環境を構築し、開発者がより簡単にテストやデバッグを行えるよう支援。

### 技術スタックのアップグレード

Rubyのバージョンを2.4から2.6.5に、Ruby on Railsを5.1から5.2.5にアップグレード。
MySQLのバージョンを5.6から5.7にアップグレードし、クエリ応答速度を約30%改善。
最新のセキュリティ機能を導入し、パフォーマンス向上と脆弱性の解消を実現。

### パフォーマンスチューニング

N+1問題を解決し、特定の画面ロード時間を5秒から1秒以下に短縮。
5秒以上かかっていたSQLクエリを調査し、インデックスの追加とクエリの最適化を実施。これにより、全体のレスポンス時間を平均40%短縮。
ユーザー体験の向上

### 検索機能の改善: Elasticsearchを導入し、検索速度を大幅に向上。検索結果を1秒以内に表示可能とし、ユーザーエクスペリエンスを向上。
UI/UX改善: jQueryを使用して動的なフォーム検証を追加し、ユーザーエラーをリアルタイムで検知。

### フロントエンド開発:
UIの改善と動的インタラクションの実装、パフォーマンスチューニング。

### バックエンド開発:
認証・認可機能、データ同期機能の実装、およびAPIのパフォーマンス改善。

## 使用技術
バックエンド: Ruby, Ruby on Rails
フロントエンド: jQuery
データベース: MySQL
全文検索: Elasticsearch
インフラ: AWS（IAM / VPC / Route53 / RDS / DynamoDB / S3）
Webサーバー: Nginx
開発環境: Vagrant, Docker, VSCode
CI/CDツール: Jira, Jenkins, Gitlab
構成管理: Ansible
