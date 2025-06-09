import { queryPermission } from "./utils/permissions";

const MSAPI_DEFAULT = -1;
const MSAPI_ON = 1;
const MSAPI_FACING_MODE_USER = 0;
const MSAPI_FACING_MODE_ENVIRONMENT = 1;
const MSAPI_FACING_MODE_LEFT = 2;
const MSAPI_FACING_MODE_RIGHT = 3;
const MSAPI_RESIZE_MODE_NONE = 0;
const MSAPI_RESIZE_MODE_CROP_AND_SCALE = 1;
const MSAPI_DISPLAY_SURFACE_BROWSER = 0;
const MSAPI_DISPLAY_SURFACE_WINDOW = 1;
const MSAPI_DISPLAY_SURFACE_MONITOR = 2;

const facingModeMap = {
    [MSAPI_FACING_MODE_USER]: 'user',
    [MSAPI_FACING_MODE_ENVIRONMENT]: 'environment',
    [MSAPI_FACING_MODE_LEFT]: 'left',
    [MSAPI_FACING_MODE_RIGHT]: 'right'
};

const resizeModeMap = {
    [MSAPI_RESIZE_MODE_NONE]: 'none',
    [MSAPI_RESIZE_MODE_CROP_AND_SCALE]: 'crop-and-scale'
};

const includeExcludeMap = {
    true: 'include',
    false: 'exclude'
};

const displaySurfaceMap = {
    [MSAPI_DISPLAY_SURFACE_BROWSER]: 'browser',
    [MSAPI_DISPLAY_SURFACE_WINDOW]: 'window',
    [MSAPI_DISPLAY_SURFACE_MONITOR]: 'monitor'
};

class BaseMediaStream extends df.WebObject {
    stream;

    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnError');
    }

    disconnect() {
        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = null;
    }
}

export class UserMediaStream extends BaseMediaStream {
    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tString, 'psMicrophonePermission', '');
        this.prop(df.tString, 'psCameraPermission', '');
        this.prop(df.tString, 'psPanTiltZoomPermission', '');

        // Audio track properties
        this.prop(df.tBool, 'pbAudio', false);
        this.prop(df.tString, 'psAudioDeviceId', '');
        this.prop(df.tInt, 'peAutoGainControl', MSAPI_DEFAULT);
        this.prop(df.tInt, 'piChannelCount', MSAPI_DEFAULT);
        this.prop(df.tInt, 'peEchoCancellation', MSAPI_DEFAULT);
        this.prop(df.tNumber, 'pnLatency', MSAPI_DEFAULT);
        this.prop(df.tInt, 'peNoiseSuppression', MSAPI_DEFAULT);
        this.prop(df.tInt, 'piSampleRate', MSAPI_DEFAULT);
        this.prop(df.tInt, 'piSampleSize', MSAPI_DEFAULT);

        // Video track properties
        this.prop(df.tBool, 'pbVideo', false);
        this.prop(df.tBool, 'pbWithPanTiltZoom', false);
        this.prop(df.tString, 'psVideoDeviceId', '');
        this.prop(df.tNumber, 'pnAspectRatio', MSAPI_DEFAULT);
        this.prop(df.tInt, 'peFacingMode', MSAPI_DEFAULT);
        this.prop(df.tNumber, 'pnFrameRate', MSAPI_DEFAULT);
        this.prop(df.tInt, 'piHeight', MSAPI_DEFAULT);
        this.prop(df.tInt, 'piWidth', MSAPI_DEFAULT);
        this.prop(df.tInt, 'peResizeMode', MSAPI_DEFAULT);

        this.event('OnMicrophonePermissionChange');
        this.event('OnCameraPermissionChange');
        this.event('OnPanTiltZoomPermissionChange');
        this.event('OnEnumerateDevices', df.cCallModeDefault, 'OnEnumerateDevicesProxy');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'mediaDevices' in navigator && navigator.mediaDevices.getUserMedia && navigator.mediaDevices.enumerateDevices);
        if (this.pbIsSupported && 'permissions' in navigator) {
            queryPermission(this, 'microphone', 'psMicrophonePermission', 'OnMicrophonePermissionChange');
            queryPermission(this, 'camera', 'psCameraPermission', 'OnCameraPermissionChange');
            queryPermission(this, 'camera', 'psPanTiltZoomPermission', 'OnPanTiltZoomPermissionChange', { panTiltZoom: true });
        }
    }

    async requestPermission() {
        try {
            const audio = this.pbAudio;
            const video = this.pbVideo && this.pbWithPanTiltZoom ? { pan: true, tilt: true, zoom: true } : this.pbVideo;
            const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async enumerateDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const filtered = devices.filter(d => d.kind === 'audioinput' || d.kind === 'videoinput');
            this.fireEx({
                sEvent: 'OnEnumerateDevices',
                tActionData: filtered
            });
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async connect() {
        this.disconnect();
        return this.stream = await navigator.mediaDevices.getUserMedia(this.#getConstraints());
    }

    #getConstraints() {
        const constraints = {};
        if (this.pbAudio) {
            constraints.audio = {};
            if (this.psAudioDeviceId) {
                constraints.audio.deviceId = this.psAudioDeviceId;
            }
            if (this.peAutoGainControl !== MSAPI_DEFAULT) {
                constraints.audio.autoGainControl = this.peAutoGainControl === MSAPI_ON;
            }
            if (this.piChannelCount !== MSAPI_DEFAULT) {
                constraints.audio.channelCount = this.piChannelCount;
            }
            if (this.peEchoCancellation !== MSAPI_DEFAULT) {
                constraints.audio.echoCancellation = this.peEchoCancellation === MSAPI_ON;
            }
            if (this.pnLatency !== MSAPI_DEFAULT) {
                constraints.audio.latency = this.pnLatency;
            }
            if (this.peNoiseSuppression !== MSAPI_DEFAULT) {
                constraints.audio.noiseSuppression = this.peNoiseSuppression === MSAPI_ON;
            }
            if (this.piSampleRate !== MSAPI_DEFAULT) {
                constraints.audio.sampleRate = this.piSampleRate;
            }
            if (this.piSampleSize !== MSAPI_DEFAULT) {
                constraints.audio.sampleSize = this.piSampleSize;
            }
        }
        if (this.pbVideo) {
            constraints.video = {};
            if (this.pbWithPanTiltZoom) {
                constraints.video.pan = true;
                constraints.video.tilt = true;
                constraints.video.zoom = true;
            }
            if (this.psVideoDeviceId) {
                constraints.video.deviceId = this.psVideoDeviceId;
            }
            if (this.pnAspectRatio !== MSAPI_DEFAULT) {
                constraints.video.aspectRatio = this.pnAspectRatio;
            }
            if (this.peFacingMode !== MSAPI_DEFAULT) {
                constraints.video.facingMode = facingModeMap[this.peFacingMode];
            }
            if (this.pnFrameRate !== MSAPI_DEFAULT) {
                constraints.video.frameRate = this.pnFrameRate;
            }
            if (this.piHeight !== MSAPI_DEFAULT) {
                constraints.video.height = this.piHeight;
            }
            if (this.piWidth !== MSAPI_DEFAULT) {
                constraints.video.width = this.piWidth;
            }
            if (this.peResizeMode !== MSAPI_DEFAULT) {
                constraints.video.resizeMode = resizeModeMap[this.peResizeMode];
            }
        }
        return constraints;
    }
}

export class DisplayMediaStream extends BaseMediaStream {
    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tBool, 'pbAudio', false);
        this.prop(df.tBool, 'pbMonitorTypeSurfaces', true);
        this.prop(df.tBool, 'pbPreferCurrentTab', false);
        this.prop(df.tBool, 'pbSelfBrowserSurface', false);
        this.prop(df.tBool, 'pbSurfaceSwitching', false);
        this.prop(df.tBool, 'pbSystemAudio', true);
        this.prop(df.tInt, 'peDisplaySurface', MSAPI_DEFAULT);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'mediaDevices' in navigator && navigator.mediaDevices.getDisplayMedia);
    }

    async connect() {
        this.disconnect();
        return this.stream = await navigator.mediaDevices.getDisplayMedia(this.#getConstraints());
    }

    #getConstraints() {
        const constraints = {
            audio: this.pbAudio,
            monitorTypeSurfaces: includeExcludeMap[this.pbMonitorTypeSurfaces],
            preferCurrentTab: this.pbPreferCurrentTab,
            selfBrowserSurface: includeExcludeMap[this.pbSelfBrowserSurface],
            surfaceSwitching: includeExcludeMap[this.pbSurfaceSwitching],
            systemAudio: includeExcludeMap[this.pbSystemAudio]
        };
        if (this.peDisplaySurface !== MSAPI_DEFAULT) {
            constraints.video = {
                displaySurface: displaySurfaceMap[this.peDisplaySurface]
            };
        }
        return constraints;
    }
}