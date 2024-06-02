function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            // everything except Firefox
            (e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === "QuotaExceededError" ||
                // Firefox
                e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

class WebStorage extends df.WebObject {
    #storage;

    constructor(sName, oParent, sStorage) {
        super(sName, oParent);
        this.#storage = sStorage;
        this.prop(df.tBool, 'pbIsSupported', false);
        this.prop(df.tInt, 'piLength', 0);
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', storageAvailable(this.#storage));
        if (this.pbIsSupported) {
            this.#storage = window[this.#storage];
            this.#updateLength();
        }
    }

    #updateLength() {
        this.set('piLength', this.#storage.length);
    }

    #findObj(sName) {
        const obj = this.getWebApp().findObj(sName);

        if (!obj) {
            throw new df.Error(999, "Return WebObject not found '{{0}}'", this, [sName]);
        }

        return obj;
    }

    #return(obj, msg, ...args) {
        this.#findObj(obj).serverAction(msg, args);
    }

    key(obj, msg, index) {
        this.#return(obj, msg, this.#storage.key(parseInt(index)));
    }

    getItem(obj, msg, keyName) {
        const value = this.#storage.getItem(keyName);
        if (value !== null) {
            this.#return(obj, msg, value);
        }
    }

    setItem(keyName, keyValue) {
        this.#storage.setItem(keyName, keyValue);
        this.#updateLength();
    }

    removeItem(keyName) {
        this.#storage.removeItem(keyName);
        this.#updateLength();
    }

    clear() {
        this.#storage.clear();
        this.#updateLength();
    }
}

export class LocalStorage extends WebStorage {
    constructor(sName, oParent) {
        super(sName, oParent, 'localStorage');
        this.event('OnStorage');
    }

    create(tDef) {
        super.create(tDef);
        if (this.pbIsSupported) {
            window.addEventListener('storage', event => {
                console.log(event);
                this.fire('OnStorage', [event.key || '', event.newValue || '', event.oldValue || '', event.url]);
            });
        }
    }
}

export class SessionStorage extends WebStorage {
    constructor(sName, oParent) {
        super(sName, oParent, 'sessionStorage');
    }
}
