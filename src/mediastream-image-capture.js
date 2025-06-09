import { readBlob } from './utils/blob';

const MSIC_FILL_LIGHT_MODE_AUTO = 0;
const MSIC_FILL_LIGHT_MODE_OFF = 1;
const MSIC_FILL_LIGHT_MODE_FLASH = 2;

const fillLightModeMap = new Map([
    [MSIC_FILL_LIGHT_MODE_AUTO, 'auto'],
    [MSIC_FILL_LIGHT_MODE_OFF, 'off'],
    [MSIC_FILL_LIGHT_MODE_FLASH, 'flash']
]);

export default class MediaStreamImageCapture extends df.WebObject {
    #stream;
    #track;
    #capture;
    #capabilities;

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
            this.#track = track;
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
            const [capabilities, settings] = await Promise.all([
                this.#capture.getPhotoCapabilities(),
                this.#capture.getPhotoSettings()
            ]);
            this.#capabilities = capabilities;
            this.fireEx({
                sEvent: 'OnConnect',
                tActionData: {
                    capabilities,
                    settings,
                    track: {
                        kind: track.kind,
                        label: track.label,
                        capabilities: track.getCapabilities(),
                        settings: track.getSettings()
                    }
                }
            });
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async applyConstraint(name, value) {
        const constraint = {};
        constraint[name] = value;
        try {
            await this.#track?.applyConstraints({ advanced: [constraint] });
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async takePhoto(fillLightMode, imageHeight, imageWidth, redEyeReduction) {
        if (this.#capture) {
            const settings = {};
            if (fillLightMode !== undefined && this.#capabilities.fillLightMode) {
                fillLightMode = fillLightModeMap.get(df.toInt(fillLightMode));
                if (this.#capabilities.fillLightMode.includes(fillLightMode)) {
                    settings.fillLightMode = fillLightMode;
                }
            }
            if (imageHeight !== undefined && imageHeight !== '' && this.#capabilities.imageHeight) {
                imageHeight = df.toInt(imageHeight);
                if (this.#capabilities.imageHeight.min <= imageHeight <= this.#capabilities.imageHeight.max) {
                    settings.imageHeight = imageHeight;
                }
            }
            if (imageWidth !== undefined && imageWidth !== '' && this.#capabilities.imageWidth) {
                imageWidth = df.toInt(imageWidth);
                if (this.#capabilities.imageWidth.min <= imageWidth <= this.#capabilities.imageWidth.max) {
                    settings.imageWidth = imageWidth;
                }
            }
            if (redEyeReduction !== undefined && this.#capabilities.redEyeReduction === 'controllable') {
                settings.redEyeReduction = df.toBool(redEyeReduction);
            }

            try {
                const blob = await this.#capture.takePhoto(settings);
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
        this.#track = null;
        this.#capture = null;
        this.#capabilities = null;
        this.fire('OnDisconnect');
    }
}
