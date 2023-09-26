export const SEARCH_STATION_REGEX = (keyWord) => new RegExp(`(?<=.*?@)[^@]*${keyWord}.*?(?=&)`, "gi")
export const EXTRACT_LINE_REGEX = (keyWord) => {
    const regex = new RegExp(`^([0-9S]+)号线$|^line\s*([0-9S]+)$`, "i")
    const match = keyWord.match(regex)
    if (match != null) {
        return match[1] === undefined ? match[2] : match[1]
    }
    return null
}
export const SEARCH_STATION_BY_LINE_REGEX = (line) => new RegExp(`(?<=.*?@)[^@]+,${line}(?=[,&]).*?(?=&)`, "gi")