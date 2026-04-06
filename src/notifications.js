const notifications = [];

export default class Notifications extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psPermission', '');
        this.event('OnPermissionChange');
        this.event('OnNotificationClick');
        this.event('OnNotificationClose');
        this.event('OnNotificationError');
        this.event('OnNotificationShow');
        this.event('OnError');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'Notification' in window);
        if (this.pbIsSupported) {
            this.set('psPermission', Notification.permission);
        }
    }

    async requestPermission() {
        const permission = await Notification.requestPermission();
        this.set('psPermission', permission);
        this.fire('OnPermissionChange');
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
            notification.addEventListener('click', () => this.fire('OnNotificationClick', [data.id]));
            notification.addEventListener('close', () => this.fire('OnNotificationClose', [data.id]));
            notification.addEventListener('error', () => this.fire('OnNotificationError', [data.id]));
            notification.addEventListener('show', () => this.fire('OnNotificationShow', [data.id]));
            notifications.push({ id: data.id, notification });
        }
        catch (error) {
            this.fire('OnError', [error.name, error.message]);
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
