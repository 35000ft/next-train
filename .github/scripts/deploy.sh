cd /usr/
cd /home/ubuntu/projects/next-train
git checkout quasar-dev
git pull origin quasar-dev
npm install
quasar build
cp -rf /home/ubuntu/projects/next-train/dist/spa/* /usr/share/nginx/html/next-train
