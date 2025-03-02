import gcoord from 'gcoord';

export function getOSType() {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipod|ipad/.test(ua)) {
        return 'ios'
    } else if (/android/.test(ua)) {
        return 'android'
    } else {
        return 'pc'
    }
}

export function genAmapPositionUrl(location, title = "", osType = getOSType()) {
    // 118.819746,32.039218
    const [lon, lat] = location.split(',')
    const fallbackUrl = `https://uri.amap.com/marker?position=${lon},${lat}`
    switch (osType) {
        case 'ios':
            return {
                url: `amap://viewMap?sourceApplication=web&lat=${lat}&lon=${lon}`,
                fallbackUrl
            }
        case 'android':
            return {
                fallbackUrl,
                url: `androidamap://viewMap?sourceApplication=web&lat=${lat}&lon=${lon}&poiname=${title}`
            }
        default:
            return {
                url: fallbackUrl,
                fallbackUrl
            }
    }
}

export function genGoogleMapPositionUrl(location, title = "", osType = getOSType()) {
    const [lon, lat] = location.split(',')
    const fallbackUrl = `https://www.google.com/maps?q=${lat},${lon}`
    const url = `geo://${lat},${lon}?q=${lat},${lon}`
    if (osType === 'pc') {
        return {
            url: fallbackUrl,
            fallbackUrl
        }
    } else {
        return {
            url,
            fallbackUrl
        }
    }
}

export function genBaiduPositionUrl(location, title = "", osType = getOSType()) {
    const [lon, lat] = location.split(',')
    const bd09Coord = gcoord.transform(
        [lon, lat],
        gcoord.WGS84,
        gcoord.BD09
    )
    if (!bd09Coord) {
        console.error('Parse WGS-84 Coord to BD-09 fail', location)
        return
    }
    const fallbackUrl = `https://map.baidu.com/`
    const url = `baidumap://map/marker?location=${bd09Coord[1]},${bd09Coord[0]}&title=${title}`
    if (osType === 'pc') {
        return {
            url: fallbackUrl,
            fallbackUrl
        }
    } else {
        return {
            url,
            fallbackUrl
        }
    }
}

