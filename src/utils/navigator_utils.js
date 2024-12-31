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

export function genAmapPositionUrl(location, osType = getOSType()) {
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
                url: `androidamap://viewMap?sourceApplication=web&lat=${lat}&lon=${lon}`
            }
        default:
            return {
                url: fallbackUrl,
                fallbackUrl
            }
    }
}
