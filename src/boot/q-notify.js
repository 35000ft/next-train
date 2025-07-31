import {boot} from 'quasar/wrappers';

if (!Array.prototype.contains) {
    Array.prototype.contains = function (element) {
        return this.indexOf(element) !== -1;
    };
}

export default boot(({app}) => {
    // 设置 Quasar Notify 的默认配置
    app.config.globalProperties.$q.notify.setDefaults({
        position: 'bottom',    // 默认位置
        timeout: 3000,            // 默认显示时间
        color: 'primary',        // 默认背景色
        textColor: 'white',       // 默认文字颜色
        icon: 'info',
        offset: [0, 100],
    });
    const $q = app.config.globalProperties.$q

    // 通用的通知函数
    function notify({type, message, timeout, onClick}) {
        let config = {
            message,
            timeout: timeout || 3000,
            position: 'bottom',
            offset: [0, 100],
            actions: onClick && onClick.func
                ? [
                    {
                        label: onClick.name || '查看',
                        color: onClick.color || 'white',
                        handler: onClick.func,
                    },
                ]
                : [],
        };
        // 根据类型设置不同的颜色和图标
        switch (type) {
            case 'info':
                config.color = 'primary';
                config.icon = 'info';
                break;
            case 'warn':
                config.color = 'orange';
                config.icon = 'warning';
                break;
            case 'error':
                config.color = 'negative';
                config.icon = 'error';
                break;
            case 'ok':
                config.type = 'positive';
                config.color = 'positive';
                break;
            default:
                config.color = 'primary';
        }

        $q.notify(config);
    }

    // 为 $q.notify 添加自定义方法
    $q.notify.info = (message, onClick = null) => notify({type: 'info', message, onClick});
    $q.notify.warn = (message, onClick = null) => notify({type: 'warn', message, onClick});
    $q.notify.error = (message, onClick = null) => notify({type: 'error', message, onClick});
    $q.notify.ok = (message, onClick = null) => notify({type: 'ok', message, onClick});
});
