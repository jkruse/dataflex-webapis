export async function queryPermission(instance, name, property, event, options = {}) {
    try {
        const result = await navigator.permissions.query(Object.assign({ name }, options));
        instance.set(property, result.state || result.status);
        if (event) {
            result.onchange = () => {
                instance.set(property, result.state || result.status);
                instance.fire(event);
            };
        }
        return result.state || result.status;
    } catch (error) {
        instance.fire('OnError', [error.name, error.message]);
    }
}
