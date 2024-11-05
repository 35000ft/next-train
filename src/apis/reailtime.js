import axios from "axios";

const host = 'http://111.229.192.148'
const local = 'http://localhost'

export async function fetchScheduledTrainInfo(stationId, lineId, time) {
  const url = `${host}/nj-metro-realtime/train-info/scheduled`
  return await axios
    .post(url, {
      stationId: stationId,
      lineIdList: [lineId],
      time: time
    })
    .then(res => {
      return res.data.data
    })
    .catch(err => {
      return Promise.reject(err)
    })
}
