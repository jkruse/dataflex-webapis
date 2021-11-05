class Vibration extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'vibrate' in navigator);
    }

    vibrate() {
        navigator.vibrate(arguments);
    }
}

export default Vibration;

global.WebAPIs = global.WebAPIs || {};
global.WebAPIs.Vibration = Vibration;
