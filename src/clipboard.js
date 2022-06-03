export default class Clipboard extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tString, 'psReadPermission', '');
        this.prop(df.tString, 'psWritePermission', '');
        this.event('OnReadPermissionChange');
        this.event('OnWritePermissionChange');
        this.event('OnRead', df.cCallModeDefault, 'OnReadProxy');
        this.event('OnReadText');
        this.event('OnWrite');
        this.event('OnWriteText');
        this.event('OnError');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'clipboard' in navigator);
        if (this.pbIsSupported && 'permissions' in navigator) {
            this.#queryPermission('clipboard-read', 'psReadPermission', 'OnReadPermissionChange');
            this.#queryPermission('clipboard-write', 'psWritePermission', 'OnWritePermissionChange');
        }
    }

    async read() {
        const items = await navigator.clipboard.read();
        const data = await Promise.all(
            items.map(item => Promise.all(
                item.types.map(async (type) => {
                    const blob = await item.getType(type);
                    return this.#readBlob(blob);
                })
            ))
        );
        this.fireEx({
            sEvent: 'OnRead',
            tActionData: data
        });
    }

    async readText() {
        try {
            const text = await navigator.clipboard.readText();
            this.fire('OnReadText', [text])
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async write(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const data = [new ClipboardItem({ [blob.type]: blob })];
            await navigator.clipboard.write(data);
            this.fire('OnWrite');
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async writeText(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.fire('OnWriteText');
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    async #queryPermission(name, property, event) {
        try {
            const result = await navigator.permissions.query({ name });
            this.set(property, result.state || result.status);
            result.onchange = () => {
                this.set(property, result.state || result.status);
                this.fire(event);
            };
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    #readBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}