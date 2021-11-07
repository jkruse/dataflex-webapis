export default class Fullscreen extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnFullscreenChange', df.cCallModeDefault);
        this.event('OnFullscreenError', df.cCallModeDefault);
    }

    static getDfObjName(obj) {
        if (obj.dataset.dfobj) {
            return obj.dataset.dfobj;
        }
        if (obj.parentElement) {
            return Fullscreen.getDfObjName(obj.parentElement);
        }
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', document.fullscreenEnabled);
        if (this.pbIsSupported) {
            df.dom.on('fullscreenchange', document, this.onFullscreenChange, this);
            df.dom.on('fullscreenerror', document, this.onFullscreenError, this);
        }
    }

    destroy() {
        df.dom.off('fullscreenchange', document, this.onFullscreenChange);
        df.dom.off('fullscreenerror', document, this.onFullscreenError);
        super.destroy();
    }

    exitFullscreen() {
        document.exitFullscreen();
    }

    requestFullscreen(sObjName) {
        const obj = this.getWebApp().findObj(sObjName);
        if (obj) {
            obj._eElem.requestFullscreen().then(() => obj.sizeHeight(-1));
        }
    }

    onFullscreenChange() {
        this.fire('OnFullscreenChange', [document.fullscreenElement ? Fullscreen.getDfObjName(document.fullscreenElement) : ''])
    }

    onFullscreenError() {
        this.fire('OnFullscreenError');
    }
}
