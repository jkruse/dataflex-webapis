export default class CredentialManagement extends df.WebObject {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnCredential', df.cCallModeDefault, 'OnCredentialProxy');
        this.event('OnSuccess');
        this.event('OnError');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', window.PasswordCredential || window.FederatedCredential);
    }

    async getCredential() {
        const options = this._tActionData;
        const c = await navigator.credentials.get(options);
        // Have to manually clone object, because none of these properties are enumerable
        const credential = {
            id: c.id,
            type: c.type,
            iconURL: c.iconURL,
            name: c.name,
            password: c.password,
            provider: c.provider,
            protocol: c.protocol
        };
        this.fireEx({ sEvent: 'OnCredential', tActionData: credential });
    }

    async #store(options) {
        try {
            const credential = await navigator.credentials.create(options);
            console.log({ credential });
            if (credential) {
                await navigator.credentials.store(credential);
                this.fire('OnSuccess');
            } else {
                this.fire('OnError', ['CredentialCreationError', 'Unable to create credential based on these options']);
            }
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }

    storePassword(id, name, iconURL, password) {
        const options = {
            password: {
                id,
                name: name || undefined,
                iconURL: iconURL || undefined,
                password
            }
        };
        this.#store(options);
    }

    storeFederated(id, name, iconURL, provider, protocol) {
        const options = {
            federated: {
                id,
                name: name || undefined,
                iconURL: iconURL || undefined,
                provider,
                protocol: protocol || undefined
            }
        };
        this.#store(options);
    }

    async preventSilentAccess() {
        try {
            await navigator.credentials.preventSilentAccess();
            this.fire('OnSuccess');
        } catch (error) {
            this.fire('OnError', [error.name, error.message]);
        }
    }
}