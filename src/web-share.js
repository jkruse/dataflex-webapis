export default class WebShare extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnSuccess', df.cCallModeDefault);
        this.event('OnError', df.cCallModeDefault);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'share' in navigator);
    }

    async share(text, title, url) {
        const data = {
            text: text || undefined,
            title: title || undefined,
            url
        };
        try {
            const files = await Promise.all(this._tActionData?.aFiles?.map(info => this.toFile(info)) || []);
            if (files.length > 0) {
                if (navigator.canShare?.({ files })) {
                    data.files = files;
                } else {
                    throw ({ name: 'CantShareError', message: 'These files can\'t be shared' });
                }
            }
            await navigator.share(data);
            this.fire('OnSuccess');
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async toFile(info) {
        const response = await fetch(info.sURL, { credentials: 'same-origin' });
        const data = await response.blob();
        return new File([data], info.sName, {
            type: info.sContentType,
        });
    }
}
