import axios from "src/utils/axios";
import {generateUUID} from "src/utils/crypto_utils";

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
 * @returns {EventSource}
 */
export function sseLogin() {
    const clientId = generateUUID()
    return new EventSource(apiBaseUrl + `/metro-realtime/users/fe-third-party-login?clientId=${clientId}`)
}
