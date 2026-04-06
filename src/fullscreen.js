export default class Fullscreen extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnChange');
        this.event('OnError');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', document.fullscreenEnabled);
        if (this.pbIsSupported) {
            df.dom.on('fullscreenchange', document, this.onChange, this);
            df.dom.on('fullscreenerror', document, this.onError, this);
        }
    }

    destroy() {
        df.dom.off('fullscreenchange', document, this.onChange, this);
        df.dom.off('fullscreenerror', document, this.onError, this);
        super.destroy();
    }

    exitFullscreen() {
        document.exitFullscreen();
    }

    async requestFullscreen(sObjName) {
        const obj = this.getWebApp().findObj(sObjName);
        if (obj) {
            await obj._eElem.requestFullscreen();
            // Need to call 'sizeHeight' in case obj is a control, but it doesn't exist if obj is a container, hence optional chaining
            obj.sizeHeight?.(-1);
        }
    }

    onChange() {
        this.fire('OnChange', [this.#dfObjectName(document.fullscreenElement)]);
    }

    onError() {
        this.fire('OnError', ['FullscreenError', 'Fullscreen request failed']);
    }

    #dfObjectName(element) {
        if (element) {
            return element.closest('[data-dfobj]').dataset.dfobj;
        }
        return '';
    }
}
