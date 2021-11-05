export default class ContactPicker extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psSupportedProperties', '');
        this.event('OnSelect', df.cCallModeDefault);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'contacts' in navigator);
        if (this.pbIsSupported) {
            navigator.contacts.getProperties().then(p => this.set('psSupportedProperties', p.join(',')));
        }
    }

    select() {
        const params = this._tActionData;
        navigator.contacts.select(
            params.aProperties,
            { multiple: params.bMultiple }
        ).then(result => this.fire('OnSelect', [JSON.stringify(result)]));
    }
}
