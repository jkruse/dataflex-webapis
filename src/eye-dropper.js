export default class EyeDropperComponent extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnSelect', df.cCallModeDefault);
        this._abortController = new AbortController();
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', !!window.EyeDropper);
    }

    open() {
        const dropper = new EyeDropper();
        dropper
            .open({ signal: this._abortController.signal })
            .then(result => this.fire('OnSelect', [result.sRGBHex]))
    }

    abort() {
        this._abortController.abort();
    }
}
