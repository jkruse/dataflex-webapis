export default class ScreenWakeLock extends df.WebObject {
    #wakeLock;

    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnSuccess');
        this.event('OnError');
        this.event('OnRelease');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'wakeLock' in navigator);
    }

    async request() {
        try {
            this.#wakeLock = await navigator.wakeLock.request('screen');
            this.#wakeLock.addEventListener('release', () => this.fire('OnRelease'));
            this.fire('OnSuccess');
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async release() {
        if (this.#wakeLock) {
            await this.#wakeLock.release();
            this.#wakeLock = null;
        }
    }
}
