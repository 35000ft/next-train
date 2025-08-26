COMMIT_SHA=$1
echo "Current Commit SHA: $COMMIT_SHA"

cd /usr/
cd /home/ubuntu/projects/next-train
git checkout quasar-dev
git pull origin quasar-dev
npm install
echo "APP_VERSION=$COMMIT_SHA" >> ./.env.production

congenie generate -m pwa -i ./public/icons/icon.png
quasar build -m pwa
cp -rf /home/ubuntu/projects/next-train/dist/pwa/* /usr/share/nginx/html/next-train
