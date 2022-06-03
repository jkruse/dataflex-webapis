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

    share(text, title, url) {
        const data = {
            text: text || undefined,
            title: title || undefined,
            url
        };
        Promise.all(this._tActionData?.aFiles?.map(info => this.toFile(info)) || [])
            .then(files => {
                if (files.length > 0) {
                    if (navigator.canShare && navigator.canShare({ files })) {
                        return {
                            ...data,
                            files
                        };
                    } else {
                        throw ({ name: 'CantShareError', message: 'These files can\'t be shared' });
                    }
                }
                return data;
            })
            .then(data => navigator.share(data))
            .then(() => this.fire('OnSuccess'))
            .catch(error => this.fire('OnError', [error.name, error.message]));
    }

    toFile(info) {
        return fetch(info.sURL, { credentials: 'same-origin' })
            .then(response => response.blob())
            .then(data => new File([data], info.sName, {
                type: info.sContentType,
            }));
    }
}
