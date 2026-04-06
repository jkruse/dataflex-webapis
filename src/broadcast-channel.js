export default class BroadcastChannelComponent extends df.WebObject {
    #channel;

    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psName', '');
        this.event('OnMessage');
        this.event('OnError');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', !!window.BroadcastChannel);
        if (this.pbIsSupported && this.psName !== '') {
            this.#channel = new BroadcastChannel(this.psName);
            this.#channel.addEventListener('message', event => {
                this.fire('OnMessage', [event.data]);
            });
        }
    }

    postMessage(sData) {
        if (this.#channel) {
            this.#channel.postMessage(sData);
        } else {
            this.fire('OnError', ['BroadcastChannelError', 'BroadcastChannel is not supported or channel name is not set']);
        }
    }
}