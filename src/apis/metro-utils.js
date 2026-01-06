import axios from "src/utils/axios";

const baseUrl = 'https://nmtr.site/api/metro-trace'

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
