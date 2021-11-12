const notifications = [];

export default class Notifications extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psPermission', '');
        this.event('OnPermissionChange', df.cCallModeDefault);
        this.event('OnClick', df.cCallModeDefault);
        this.event('OnClose', df.cCallModeDefault);
        this.event('OnError', df.cCallModeDefault);
        this.event('OnShow', df.cCallModeDefault);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'Notification' in window);
        if (this.pbIsSupported) {
            this.set('psPermission', Notification.permission);
        }
    }

    requestPermission() {
        Notification.requestPermission().then(permission => {
            this.set('psPermission', permission);
            this.fire('OnPermissionChange');
        });
    }

    createNotification() {
        const data = this._tActionData;
        try {
            const notification = new Notification(data.sTitle, {
                dir: data.sDir || undefined,
                lang: data.sLang || undefined,
                badge: data.sBadge || undefined,
                body: data.sBody || undefined,
                tag: data.sTag || undefined,
                icon: data.sIcon || undefined,
                image: data.sImage || undefined,
                data: data.data || undefined,
                vibrate: data.aVibrate,
                renotify: data.bReNotify,
                requireInteraction: data.bRequireInteraction,
                silent: data.bSilent
            });
            notification.addEventListener('click', () => this.fire('OnClick', [data.id]));
            notification.addEventListener('close', () => this.fire('OnClose', [data.id]));
            notification.addEventListener('error', error => this.fire('OnError', [data.id, error.message]));
            notification.addEventListener('show', () => this.fire('OnShow', [data.id]));
            notifications.push({ id: data.id, notification });
        }
        catch (error) {
            this.fire('OnError', [data.id, error.message]);
        }
    }

    closeNotification(idString) {
        const id = parseInt(idString, 10);
        const record = notifications.find(n => n.id === id);
        if (record) {
            record.notification.close();
            notifications.splice(notifications.indexOf(record), 1);
        }
    }
}
