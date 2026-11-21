#!/bin/bash
# 把单文件成品 开始探索.html 作为首页发布到 Cloudflare（设置在 wrangler.jsonc）
set -e
cd "$(dirname "$0")"
mkdir -p _site && cp 开始探索.html _site/index.html
npx --yes wrangler@4 deploy
