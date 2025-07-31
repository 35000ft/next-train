COMMIT_SHA=$1
echo "Current Commit SHA: $COMMIT_SHA"

cd /usr/
cd /home/ubuntu/projects/next-train
git checkout quasar-dev
git pull origin quasar-dev
npm install
echo "APP_VERSION=$COMMIT_SHA" >> ./.env.production

quasar build
cp -rf /home/ubuntu/projects/next-train/dist/spa/* /usr/share/nginx/html/next-train
