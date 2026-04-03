export default class NetworkInformation extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnChange', df.cCallModeDefault, 'OnChangeProxy');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'connection' in navigator);
        if (this.pbIsSupported) {
            this.update();
            navigator.connection.addEventListener('change', () => this.update());
        }
    }

    update() {
        const con = navigator.connection;

        const val = {
            downlink: con.downlink,
            downlinkMax: con.downlinkMax,
            effectiveType: con.effectiveType,
            rtt: con.rtt,
            saveData: con.saveData,
            type: con.type
        };
        this.fireEx({ sEvent: 'OnChange', tActionData: val });
    }
}
