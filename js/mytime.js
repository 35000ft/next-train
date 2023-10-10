export const toMinutesOfDay = (hm) => {
    const split = hm.split(':');
    return Number(split[0]) * 60 + Number(split[1])
}