import { readBlob } from './utils/blob';

export default class MediaStreamImageCapture extends df.WebObject {
    #stream;
    #capture;

    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psMediaStream', '');
        this.prop(df.tBool, 'pbWithDimension', false);

        this.event('OnConnect', df.cCallModeDefault, 'OnConnectProxy');
        this.event('OnDisconnect');
        this.event('OnError');
        this.event('OnPhoto', df.cCallModeDefault, 'OnPhotoProxy');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', !!window.ImageCapture);
    }

    async connect(elementId) {
        try {
            if (!this.psMediaStream) {
                throw new Error('No media stream to connect to');
            }

            // Get video track and add disconnect hook
            this.#stream = this.getWebApp().findObj(this.psMediaStream);
            const stream = await this.#stream.connect();
            const [track] = stream.getVideoTracks();
            track.addEventListener('ended', () => this.disconnect());

            // Connect stream to media element, if an id was passed
            if (elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.src = null;
                    element.srcObject = stream;
                    element.play();
                }
            }

            // Set up the capture
            this.#capture = new ImageCapture(track);

            // Let them know what we got
            this.fireEx({
                sEvent: 'OnConnect',
                tActionData: {
                    kind: track.kind,
                    label: track.label,
                    settings: track.getSettings()
                }
            });
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async takePhoto() {
        if (this.#capture) {
            try {
                const blob = await this.#capture.takePhoto();
                let cancelled = false;

                // Fire client-side event with the Blob
                this.fireEx({
                    sEvent: 'OnPhoto',
                    aParams: [blob],
                    bSkipServer: true,
                    fHandler: oEvent => cancelled = oEvent.bCanceled
                });

                // For the server-side handler we need to convert the Blob, so we only do that
                // if client-side handler didn't cancel and server-side handler is enabled
                if (!cancelled && this.pbServerOnPhoto) {
                    // Fire server-side event with a DataURL string
                    const dataUrl = await readBlob(blob);
                    let width = 0, height = 0;
                    if (this.pbWithDimension) {
                        const image = await createImageBitmap(blob);
                        width = image.width;
                        height = image.height;
                        image.close();
                    }
                    this.fireEx({ sEvent: 'OnPhoto', aParams: [dataUrl, width, height], bSkipClient: true });
                }
            } catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
    }

    disconnect() {
        this.#stream.disconnect();
        this.#stream = null;
        this.#capture = null;
        this.fire('OnDisconnect');
    }
}
