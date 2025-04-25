import _ from "lodash";

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
