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

    share(url, text, title) {
        navigator
            .share({ url, text, title })
            .then(() => {
                this.fire('OnSuccess');
            })
            .catch(error => {
                this.fire('OnError', [error.name, error.message]);
            });
    }
}

//TODO: share file: https://stackoverflow.com/questions/25046301/convert-url-to-file-or-blob-for-filereader-readasdataurl