export default class BarcodeDetection extends df.WebBaseControl {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnSupportedFormats', df.cCallModeDefault);
        this.event('OnDetect', df.cCallModeDefault);
        this.event('OnError', df.cCallModeDefault);
        this._eVideo = null;
        this._detector = null;
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', ('mediaDevices' in navigator) && ('BarcodeDetector' in window));
    }

    openHtml(aHtml) {
        super.openHtml(aHtml);
        aHtml.push('<video style="width: 100%"></video>');
    }

    afterRender() {
        this._eVideo = df.dom.query(this._eElem, 'video');
        super.afterRender();
    }

    afterShow() {
        super.afterShow();

        if (!('mediaDevices' in navigator)) {
            this.fire('OnError', ['CameraNotSupportedError', 'This browser does not support camera access']);
            return;
        }

        if (!('BarcodeDetector' in window)) {
            this.fire('OnError', ['BarcodeNotSupportedError', 'This browser does not support barcode detection']);
            return;
        }

        BarcodeDetector.getSupportedFormats()
            .then(supportedFormats => this.fire('OnSupportedFormats', [JSON.stringify(supportedFormats)]));

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                this._eVideo.srcObject = stream;
                this._eVideo.onloadedmetadata = () => this._eVideo.play();
            })
            .catch(error => this.fire('OnError', [error.name, error.message]));
    }

    stop() {
        for (let stream of this._eVideo.srcObject.getVideoTracks()) {
            stream.stop();
        }
        this._eVideo.srcObject = null;
    }

    detect() {
        const formats = this._tActionData || ['qr_code'];
        this._detector = new BarcodeDetector({ formats });
        this._detector.detect(this._eVideo)
            .then(barcodes => this.fire('OnDetect', [JSON.stringify(barcodes)]))
            .catch(error => this.fire('OnError', [error.name, error.message]));
    }

    setHeight(iHeight) {
        if (this._eVideo) {
            if (iHeight > 0) {
                this._eVideo.style.height = `${iHeight}px`;
            } else {
                this._eVideo.style.height = '150px';
            }
        }
    }
}