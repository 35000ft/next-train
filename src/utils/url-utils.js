/**
 *
 * @param path
 * @param queryParams
 * @returns {module:url.URL}
 */
export const buildUrl = (path, queryParams) => {
    const raw = new URL(window.location.href)
    const newUrl = new URL(raw.origin + raw.pathname)
    if (queryParams) {
        newUrl.hash = `#${path}?${new URLSearchParams(queryParams).toString()}`
    }
    return newUrl
}
