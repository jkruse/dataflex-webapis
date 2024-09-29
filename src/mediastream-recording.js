import { readBlob } from "./utils/blob";

const MSR_DEFAULT = -1;
const MSR_AUDIO_BITRATE_MODE_CONSTANT = 0;
const MSR_AUDIO_BITRATE_MODE_VARIABLE = 1;

const audioBitrateModeMap = {
    [MSR_AUDIO_BITRATE_MODE_CONSTANT]: 'constant',
    [MSR_AUDIO_BITRATE_MODE_VARIABLE]: 'variable'
};

export default class MediaStreamRecording extends df.WebObject {
    #aMediaStreams = [];
    #streams;
    #recorder;
    #chunks = [];
    #objectUrl;
    #processingData;

    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tAdv, 'paMediaStreams', null);
        this.prop(df.tString, 'psMimeType', '');
        this.prop(df.tInt, 'piAudioBitsPerSecond', 0);
        this.prop(df.tInt, 'piVideoBitsPerSecond', 0);
        this.prop(df.tInt, 'piBitsPerSecond', 0);
        this.prop(df.tInt, 'peAudioBitrateMode', MSR_DEFAULT);
        this.prop(df.tNumber, 'pnVideoKeyFrameIntervalDuration', 0);
        this.prop(df.tInt, 'piVideoKeyFrameIntervalCount', 0);

        this.event('OnConnect', df.cCallModeDefault, 'OnConnectProxy');
        this.event('OnDisconnect');
        this.event('OnError');
        this.event('OnPause');
        this.event('OnResume');
        this.event('OnStart');
        this.event('OnStop');
        this.event('OnDataAvailable', df.cCallModeDefault, 'OnDataAvailableProxy');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', !!window.MediaRecorder);
        if (this.paMediaStreams) {
            this.set_paMediaStreams(this.paMediaStreams);
        }
    }

    destroy() {
        if (this.#objectUrl) {
            URL.revokeObjectURL(this.#objectUrl);
        }
        super.destroy();
    }

    #findObj(sName) {
        const obj = this.getWebApp().findObj(sName);

        if (!obj) {
            throw new df.Error(999, "Return WebObject not found '{{0}}'", this, [sName]);
        }

        return obj;
    }

    #return(obj, msg, ...args) {
        this.#findObj(obj).serverAction(msg, args);
    }

    isTypeSupported(obj, msg, mimeType) {
        const result = MediaRecorder.isTypeSupported(mimeType);
        this.#return(obj, msg, mimeType, this.toServerType(result, df.tBool));
    }

    async connect(elementId) {
        try {
            if (this.#aMediaStreams.length === 0) {
                throw new Error('No media streams to connect to');
            }

            // Get the stream
            const webApp = this.getWebApp();
            this.#streams = this.#aMediaStreams.map(name => webApp.findObj(name));
            let stream;
            if (this.#streams.length === 1) {
                stream = await this.#streams[0].connect();
            }
            else {
                const streams = await Promise.all(this.#streams.map(s => s.connect()));
                stream = new MediaStream(streams.flatMap(s => s.getTracks()));
            }

            // Get track info and add disconnect hook
            const tracks = [];
            stream.getTracks().forEach(track => {
                tracks.push({
                    kind: track.kind,
                    label: track.label,
                    settings: track.getSettings()
                });
                track.addEventListener('ended', () => this.disconnect());
            });

            // Connect stream to media element, if an id was passed
            if (elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.src = null;
                    element.srcObject = stream;
                    element.play();
                }
            }

            // Setup the recorder
            this.#recorder = new MediaRecorder(stream, this.#buildConfig());
            this.#recorder.addEventListener('dataavailable', event => this.#onDataAvailable(event));
            this.#recorder.addEventListener('error', error => this.fire('OnError', [error.name, error.message]));
            this.#recorder.addEventListener('pause', () => this.fire('OnPause', [this.#recorder.state]));
            this.#recorder.addEventListener('resume', () => this.fire('OnResume', [this.#recorder.state]));
            this.#recorder.addEventListener('start', () => this.fire('OnStart', [this.#recorder.state]));
            this.#recorder.addEventListener('stop', () => this.#onStop());

            // Let them know what we got
            this.fireEx({
                sEvent: 'OnConnect',
                aParams: [this.#recorder.state],
                tActionData: {
                    mimeType: this.#recorder.mimeType,
                    videoBitsPerSecond: this.#recorder.videoBitsPerSecond,
                    audioBitsPerSecond: this.#recorder.audioBitsPerSecond,
                    audioBitrateMode: this.#recorder.audioBitrateMode ?? '',
                    tracks
                }
            });
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    #buildConfig() {
        const config = {};
        if (this.psMimeType !== '') {
            config.mimeType = this.psMimeType;
        }
        if (this.piAudioBitsPerSecond !== 0) {
            config.audioBitsPerSecond = this.piAudioBitsPerSecond;
        }
        if (this.piVideoBitsPerSecond !== 0) {
            config.videoBitsPerSecond = this.piVideoBitsPerSecond;
        }
        if (this.piBitsPerSecond !== 0) {
            config.bitsPerSecond = this.piBitsPerSecond;
        }
        if (this.peAudioBitrateMode !== MSR_DEFAULT) {
            config.audioBitrateMode = audioBitrateModeMap[this.peAudioBitrateMode];
        }
        if (this.pnVideoKeyFrameIntervalDuration !== 0) {
            config.videoKeyFrameIntervalDuration = this.pnVideoKeyFrameIntervalDuration;
        }
        if (this.piVideoKeyFrameIntervalCount !== 0) {
            config.videoKeyFrameIntervalCount = this.piVideoKeyFrameIntervalCount;
        }
        return config;
    }

    start(timeslice) {
        if (timeslice) {
            timeslice = df.toInt(timeslice);
        }
        this.#recorder?.start(timeslice);
    }

    stop() {
        this.#recorder?.stop();
    }

    pause() {
        this.#recorder?.pause();
    }

    resume() {
        this.#recorder?.resume();
    }

    requestData() {
        this.#recorder?.requestData();
    }

    disconnect() {
        this.#streams?.forEach(stream => stream.disconnect());
        this.#streams = null;
        this.#recorder = null;
        this.fire('OnDisconnect');
    }

    attachRecording(elementId) {
        const element = document.getElementById(elementId);
        if (this.#objectUrl && element) {
            element.srcObject = null;
            element.src = this.#objectUrl;
        }
    }

    async #onDataAvailable(event) {
        this.#chunks.push(event.data);

        // Fire client-side event with the Blob
        this.fireEx({ sEvent: 'OnDataAvailable', aParams: [event.data], bSkipServer: true });

        // Let the 'onStop' handler know that we're processing data
        const { promise, resolve } = Promise.withResolvers();
        this.#processingData = promise;

        try {
            // Fire server-side event with a DataURL string
            const dataUrl = await readBlob(event.data);
            this.fireEx({ sEvent: 'OnDataAvailable', aParams: [dataUrl], bSkipClient: true });
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }

        // Let the 'onStop' handler know that we're done processing data
        resolve();
        this.#processingData = null;
    }

    async #onStop() {
        // MediaRecorder always fires 'stop' after the last 'dataavailable', but because we await data conversion in
        // #onDataAvailable, before we forward the event, this method could be called during that await.
        // So we await #processingData here to ensure the correct order of events on the server.
        await this.#processingData;
        if (this.#objectUrl) {
            URL.revokeObjectURL(this.#objectUrl);
        }
        const blob = new Blob(this.#chunks, { type: this.#chunks[0].type });
        this.#objectUrl = URL.createObjectURL(blob);
        this.#chunks = [];
        this.fire('OnStop', [this.#recorder?.state ?? '']);
    }

    set_paMediaStreams(value) {
        this.#aMediaStreams = df.sys.vt.deserialize(value, [df.tString]);
        if (!Array.isArray(this.#aMediaStreams)) {
            this.#aMediaStreams = [];
        }
    }

    get_paMediaStreams() {
        return df.sys.vt.serialize(this.#aMediaStreams, [df.tString]);
    }
}
