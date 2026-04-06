export default class EyeDropperComponent extends df.WebObject {
    #abortController;

    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnSelect');
        this.#abortController = new AbortController();
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', !!window.EyeDropper);
    }

    async open() {
        const result = await new window.EyeDropper().open({ signal: this.#abortController.signal });
        this.fire('OnSelect', [result.sRGBHex]);
    }

    abort() {
        this.#abortController.abort();
    }
}
