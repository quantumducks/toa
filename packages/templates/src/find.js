const generate = (name) => {
    async function observation({ output }, collection) {
        output[name] = collection;
    }

    return observation;
};

module.exports = (state, descriptor) => {
    if (!descriptor.algorithm)
        descriptor.algorithm = generate(state.name);
};
