import axios from 'axios'
import {checkCacheExpired} from "src/utils/common_utils";

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
        if (config.fetchOptions?.cacheKey) {
            const key = config.fetchOptions.cacheKey
            if (checkCacheExpired(key)) {
                config.params = {
                    ...(config.params || {}),
                    _v: Date.now()
                }
            }
        }
        if (config.fetchOptions?.forceUpdate) {
            if (!config.params?._v) {
                config.params = {
                    ...(config.params || {}),
                    _v: Date.now()
                }
            }
        }

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

axiosInstance.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            const _data = response.data
            if (_data.failed) {
                return Promise.reject(_data.msg)
            }
        } else if (response.status === 401) {
            return Promise.reject('Unauthorized')
        } else if (response.status === 403) {
            return Promise.reject('Permission Denied')
        } else if (response.status === 404) {
            return Promise.reject('Not Found')
        }
        return response
    },
    (response) => {

    }
)

export default axiosInstance
