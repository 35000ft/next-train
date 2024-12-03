import axios from "axios";

// const host = 'http://111.229.192.148'
const host = 'http://localhost'

/**
 * Fetch all stations of a rail system
 * @param {String} railsystemCode Code of Rail system, like "NJMTR"
 * @param {String} version Version of Rail system like '240125
 */
export async function fetchStations(railsystemCode, version = "") {
    const url = `${host}/file/railsystem/stations/${railsystemCode}`
    return await axios
        .get(url, {params: {v: version}})
        .then(res => {
            return {
                stations: res.data.data,
                version: res.headers['version'] || version
            }
        })
        .catch(err => {
            console.log('err', err)
            return Promise.reject(err)
        })
}

export async function fetchRailsystem(railsystemCode) {
    const url = `${host}/metro-realtime/query/railsystem/${railsystemCode}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}
