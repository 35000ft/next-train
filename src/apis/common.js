export async function getLatestVersionInfo() {
    const url = 'https://api.github.com/repos/35000ft/next-train/commits/quasar-dev'
    try {
        const response = await fetch(url, {method: 'GET'})
        const json = await response.json()
        return {
            message: json?.commit?.message,
            version: json.sha,
            time: json?.commit?.committer?.date,
            webUrl: json?.html_url,
        }
    } catch (e) {
        return Promise.reject(e)
    }
}
