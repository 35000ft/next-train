export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function md5(string) {
    function rotateLeft(lValue, shiftBits) {
        return (lValue << shiftBits) | (lValue >>> (32 - shiftBits));
    }

    function addUnsigned(lX, lY) {
        const lX4 = lX & 0x40000000, lY4 = lY & 0x40000000, lX8 = lX & 0x80000000, lY8 = lY & 0x80000000;
        const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
        if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
        if (lX4 | lY4) return lResult & 0x40000000 ? lResult ^ 0xc0000000 ^ lX8 ^ lY8 : lResult ^ 0x40000000 ^ lX8 ^ lY8;
        return lResult ^ lX8 ^ lY8;
    }

    function f(x, y, z) {
        return (x & y) | (~x & z);
    }

    function g(x, y, z) {
        return (x & z) | (y & ~z);
    }

    function h(x, y, z) {
        return x ^ y ^ z;
    }

    function i(x, y, z) {
        return y ^ (x | ~z);
    }

    function ff(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function gg(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function hh(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function ii(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
        const lWordCount = (string.length + 8 - (string.length % 64)) / 64 * 16;
        const lWordArray = Array(lWordCount - 1);
        let lBytePosition = 0, lByteCount = 0;
        while (lByteCount < string.length) {
            const lWordCountTemp = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCountTemp] |= (string.charCodeAt(lByteCount) << lBytePosition);
            lByteCount++;
        }
        lWordArray[(lByteCount - (lByteCount % 4)) / 4] |= (0x80 << ((lByteCount % 4) * 8));
        lWordArray[lWordCount - 2] = string.length << 3;
        lWordArray[lWordCount - 1] = string.length >>> 29;
        return lWordArray;
    }

    function wordToHex(lValue) {
        let wordToHexValue = "", wordToHexValueTemp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValueTemp = "0" + lByte.toString(16);
            wordToHexValue += wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
        }
        return wordToHexValue;
    }

    function utf8Encode(string) {
        return unescape(encodeURIComponent(string));
    }

    let x = [], k, AA, BB, CC, DD, a, b, c, d;
    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    string = utf8Encode(string);
    x = convertToWordArray(string);
    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = ff(a, b, c, d, x[k + 0], S11, 0xd76aa478);
        d = ff(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
        c = ff(c, d, a, b, x[k + 2], S13, 0x242070db);
        b = ff(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
        a = gg(a, b, c, d, x[k + 4], S21, 0xf57c0faf);
        d = gg(d, a, b, c, x[k + 5], S22, 0x4787c62a);
        c = gg(c, d, a, b, x[k + 6], S23, 0xa8304613);
        b = gg(b, c, d, a, x[k + 7], S24, 0xfd469501);
        a = hh(a, b, c, d, x[k + 8], S31, 0x698098d8);
        d = hh(d, a, b, c, x[k + 9], S32, 0x8b44f7af);
        c = hh(c, d, a, b, x[k + 10], S33, 0xffff5bb1);
        b = hh(b, c, d, a, x[k + 11], S34, 0x895cd7be);
        a = ii(a, b, c, d, x[k + 12], S41, 0x6b901122);
        d = ii(d, a, b, c, x[k + 13], S42, 0xfd987193);
        c = ii(c, d, a, b, x[k + 14], S43, 0xa679438e);
        b = ii(b, c, d, a, x[k + 15], S44, 0x49b40821);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}
