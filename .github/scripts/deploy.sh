COMMIT_SHA=$1
echo "Current Commit SHA: $COMMIT_SHA"

cd /usr/
cd /home/ubuntu/projects/next-train
git checkout quasar-dev
git pull origin quasar-dev
npm install

# 临时写入版本号，构建后还原
ENV_FILE="./.env.production"
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$ENV_FILE.bak"
fi
printf "%s\n" "APP_VERSION=$COMMIT_SHA" > "$ENV_FILE"

echo "Current .env:"
cat ./.env.production


icongenie generate -m pwa -i ./public/icons/icon.png
quasar build

# 还原 .env.production
if [ -f "$ENV_FILE.bak" ]; then
  mv "$ENV_FILE.bak" "$ENV_FILE"
fi

cp -rf /home/ubuntu/projects/next-train/dist/spa/* /usr/share/nginx/html/next-train
