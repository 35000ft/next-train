import axios from "src/utils/axios";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {getNowByTimezone} from "src/utils/time-utils";
import dayjs from "dayjs";
import {md5} from "src/utils/crypto_utils";

const apiBaseUrl = process.env.API_BASE_URL;

export async function login({account, password}) {
    const url = `api/metro-realtime/users/login`
    return await axios
        .post(url, {data: {account, password}})
        .then(res => {
            return res.data.data
        })
}

export async function thirdLogin(token) {
    const url = `api/metro-realtime/users/one-time-login`
    const formData = new FormData();
    formData.append("token", token)
    return await axios
        .post(url, formData, {headers: {"Content-Type": "multipart/form-data"}})
        .then(res => {
            return res.data.data
        })
}

/**
 *
 * @returns {Promise<EventSource>}
 */
export async function sseLogin(event = null) {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const clientId = md5(result.visitorId + dayjs().format('YYYY-MM-DD'))
    return Promise.resolve(new EventSource(apiBaseUrl + `/metro-realtime/users/fe-third-party-login?clientId=${clientId}&event=${event || ''}`))
}
