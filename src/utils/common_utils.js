import _, {parseInt} from "lodash";
import {isNumber} from "src/utils/string-utils";

export function useThrottled(fn, messageFn, wait = 2000,) {
    let lastCalled = 0
    const throttled = _.throttle(
        (...args) => {
            lastCalled = Date.now()
            fn(...args)
        },
        wait,
        {leading: true, trailing: false}
    )

    return (...args) => {
        const now = Date.now();
        if (now - lastCalled >= wait) {
            throttled(...args);
        } else {
            if (messageFn instanceof Function) {
                messageFn()
            }
        }
    };
}


export function setCache(cacheKey, ttl = 60 * 1000) {
    localStorage.setItem(cacheKey, (Date.now() + ttl).toString())
}

export function checkCacheExpired(cacheKey) {
    const expiredTime = localStorage.getItem(cacheKey);
    if (!isNumber(expiredTime)) {
        return true;
    }
    try {
        const now = Date.now();
        return parseInt(expiredTime) < now;

    } catch (e) {
        return true;
    }
}

export function removeKeysStartingWith(prefix) {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            console.log('remove', key)
            localStorage.removeItem(key);
            i = -1;
        }
    }
}

export async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url);
    const d = await res.json()
    return {
        address: d?.address,
        displayName: d?.display_name,
    }
}

export function toI18NameObject(obj, objLanguage, currentLanguage,) {
    if (objLanguage?.slice(0, 2) === currentLanguage?.slice(0, 2)) {
        obj.i18Name = obj.name
    } else {
        obj.i18Name = obj.enName
    }
}
