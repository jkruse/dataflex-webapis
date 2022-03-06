module.exports = function (api) {
    api.cache.forever();

    const presets = ["@babel/preset-env"];

    const plugins = [
        "@babel/plugin-proposal-private-methods"
    ];

    return {
        presets,
        plugins
    };
}