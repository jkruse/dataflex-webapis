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

    async open() {
        const result = await new EyeDropper().open({ signal: this._abortController.signal });
        this.fire('OnSelect', [result.sRGBHex]);
    }

    abort() {
        this._abortController.abort();
    }
}
