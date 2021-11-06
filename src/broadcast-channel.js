export default class BroadcastChannelComponent extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psName', '');
        this.event('OnMessage', df.cCallModeDefault);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', !!window.BroadcastChannel);
        if (this.pbIsSupported && this.psName !== '') {
            this._channel = new BroadcastChannel(this.psName);
            this._channel.addEventListener('message', event => {
                this.fire('OnMessage', [event.data]);
            });
        }
    }

    postMessage(sData) {
        this._channel.postMessage(sData);
    }
}