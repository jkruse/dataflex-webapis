export async function queryPermission(instance, name, property, event) {
    try {
        const result = await navigator.permissions.query({ name });
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
