import axios from 'axios'
import router from 'src/router'

const publicPath = process.env.PUBLIC_URL || '/';
const apiBaseUrl = process.env.API_BASE_URL;

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
            // 从 localStorage 读取 token
            const token = localStorage.getItem('authorization');
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = token;
            }
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

axiosInstance.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            if (response.data?.failed === true) {
                return Promise.reject(response.data?.msg)
            }
        }
        return response
    },
    ({status, response, request}) => {
        if (status === 401) {
            console.warn('401 Unauthorized', request)
            router.push({name: 'login'})
            return Promise.reject('Unauthorized')
        } else if (status === 403) {
            return Promise.reject('Permission Denied')
        } else if (status === 404) {
            return Promise.reject('Not Found')
        } else {
            return Promise.reject('Fail to get response')
        }
    }
)

export default axiosInstance
