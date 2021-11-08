export default class ScreenWakeLock extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnSuccess', df.cCallModeDefault);
        this.event('OnError', df.cCallModeDefault);
        this.event('OnRelease', df.cCallModeDefault);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'wakeLock' in navigator);
    }

    request() {
        navigator.wakeLock.request('screen')
            .then(wakeLock => {
                this._wakeLock = wakeLock;
                this._wakeLock.addEventListener('release', () => this.fire('OnRelease'));
                this.fire('OnSuccess');
            })
            .catch(error => {
                this.fire('OnError', [error.name, error.message])
            });
    }

    release() {
        if (this._wakeLock) {
            this._wakeLock.release().then(() => this._wakeLock = null);
        }
    }
}
