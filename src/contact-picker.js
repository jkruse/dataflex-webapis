import { readBlob } from './utils/blob.js';

export default class ContactPicker extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psSupportedProperties', '');
        this.event('OnSelect', df.cCallModeDefault, 'OnSelectProxy');
    }

    async create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'contacts' in navigator);
        if (this.pbIsSupported) {
            const properties = await navigator.contacts.getProperties();
            this.set('psSupportedProperties', properties.join(','));
        }
    }

    async select() {
        const params = this._tActionData;
        const result = await navigator.contacts.select(
            params.aProperties,
            { multiple: params.bMultiple }
        );
        for (const contact of result?.filter(item => item.icon)) {
            contact.icon = await Promise.all(contact.icon.map(item => readBlob(item)))
        }
        this.fireEx({ sEvent: 'OnSelect', tActionData: result });
    }
}
