import axios from "src/utils/axios";

const baseUrl = 'https://api.nmtr.site/metro-trace'

export async function fetchTransferInfoList({mainStationId, page = 1, pageSize = 20} = {}) {
    const params = {page, page_size: pageSize}
    if (mainStationId != null) params.main_station_id = mainStationId
    return axios.get(`${baseUrl}/railsystem/transfer-info`, {params})
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export async function createTransferInfo(data) {
    return axios.post(`${baseUrl}/railsystem/transfer-info`, data)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export async function updateTransferInfo(transferInfoId, data) {
    return axios.put(`${baseUrl}/railsystem/transfer-info/${transferInfoId}`, data)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export async function deleteTransferInfo(transferInfoId) {
    return axios.delete(`${baseUrl}/railsystem/transfer-info/${transferInfoId}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export async function queryDailyTicket({station_name, railsystem}) {
    const url = `${baseUrl}/ticket/daily-ticket`
    return await axios
        .get(url, {params: {station_name, railsystem}})
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}
