import axios from 'axios'

const publicPath = process.env.PUBLIC_URL || '/';
const apiBaseUrl = process.env.API_BASE_URL || 'http://111.229.192.148';

function isAbsoluteURL(url) {
    return /^(?:[a-z]+:)?\/\//i.test(url);
}

const axiosInstance = axios.create({
    // timeout: 10000,                      // 设置请求超时
    headers: {
        'Content-Type': 'application/json',
    }
});
axiosInstance.interceptors.request.use(
    (config) => {
        if (config.url.startsWith('api')) {
            //以api开头加上的加上baseUrl 并去掉api
            config.baseURL = apiBaseUrl;
            config.url = config.url.substring(3)
        } else if (!isAbsoluteURL(config.url)) {
            //请求public目录的内容
            if (!config.url.startsWith(publicPath)) {
                config.url = publicPath + config.url;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance
