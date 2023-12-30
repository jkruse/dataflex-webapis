export default class ScreenOrientation extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnChange');
        this.event('OnLock');
        this.event('OnError');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', typeof window?.screen?.orientation !== 'undefined');
        if (this.pbIsSupported) {
            window.screen.orientation.addEventListener('change', event => {
                this.fire('OnChange', [event.target.type, event.target.angle]);
            });
        }
    }

    async lock(orientation) {
        try {
            await window.screen.orientation.lock(orientation);
            requestIdleCallback(() => this.fire('OnLock', [window.screen.orientation.type])); // because orientation.type is actually not updated yet when promise resolves
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    unlock() {
        try {
            window.screen.orientation.unlock();
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }
}