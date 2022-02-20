function fix(val, def) {
    return val !== undefined ? val : def;
}

export default class NetworkInformation extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);

        this.prop(df.tNumber, 'pnDownlink', 0);
        this.prop(df.tNumber, 'pnDownlinkMax', 0);
        this.prop(df.tString, 'psEffectiveType', '');
        this.prop(df.tInt, 'piRTT', 0);
        this.prop(df.tBool, 'pbSaveData', false);
        this.prop(df.tString, 'psType', '');

        this.event('OnNetworkChange', df.cCallModeDefault);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'connection' in navigator);
        if (this.pbIsSupported) {
            this.update();
            navigator.connection.addEventListener('change', () => {
                this.update();
                this.fire('OnNetworkChange');
            });
        }
    }

    update() {
        const con = navigator.connection;
                
        this.set('pnDownlink', fix(con.downlink, 0));
        this.set('pnDownlinkMax', fix(con.downlinkMax, 0));
        this.set('psEffectiveType', fix(con.effectiveType, ''));
        this.set('piRTT', fix(con.rtt, 0));
        this.set('pbSaveData', fix(con.saveData, false));
        this.set('psType', fix(con.type, ''));
    }
}