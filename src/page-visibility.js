export default class PageVisibility extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnVisibilityChange', df.cCallModeDefault);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', typeof document.visibilityState !== 'undefined');
        if (this.pbIsSupported) {
            document.addEventListener('visibilitychange', () => {
                this.fire('OnVisibilityChange', [document.visibilityState]);
            });
        }
    }
}
