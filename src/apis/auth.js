import axios from "src/utils/axios";

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
