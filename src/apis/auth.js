import axios from "src/utils/axios";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import dayjs from "dayjs";
import {md5} from "src/utils/crypto_utils";

const apiBaseUrl = process.env.API_BASE_URL;

export async function login({account, password}) {
    const url = `api/metro-realtime/users/login`
    return await axios
        .post(url, {account, password})
        .then(res => res.data.data)
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

export async function signup({email, password, username, inviteCode}) {
    const url = `api/metro-realtime/users/signup`
    return await axios
        .post(url, {email, password, username, inviteCode})
        .then(res => res.data.data)
}
