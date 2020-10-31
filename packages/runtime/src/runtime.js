class Runtime {

    constructor(locator, transport, operations, connectors) {
        this.locator = locator;
        this.connectors = connectors;

        this.operations = {};
        this.http = [];

        this._transport = transport;

        operations.forEach((operation) => this.configure(operation));
    }

    configure(operation) {
        this.operations[operation.endpoint.name] = operation;

        if (operation.http) {
            this.http.push({
                bindings: operation.http,
                safe: operation.type === 'observation',
                state: operation.access,
                invoke: (...args) => this.invoke(operation, ...args),
            });
        }

        this._transport.hosts(operation.endpoint.label,
            async (request) => await this.invoke(operation, request.input, request.query),
        );


    }

    async invoke(name, input, query) {
        const io = { input, output: {}, error: {} };

        Object.freeze(io);

        const operation = typeof name === 'string' ? this.operations[name] : name;

        if (!operation)
            throw new Error(`Operation '${name}' not found`);

        await operation.invoke(io, query);

        const result = {};

        if (Object.keys(io.output).length)
            result.output = io.output;

        if (Object.keys(io.error).length)
            result.error = io.error;

        return result;
    }

    async start() {
        if (this._starting)
            return;

        this._starting = true;

        if (this.connectors)
            await Promise.all(this.connectors.map((connector) => connector.connect && connector.connect()));

        await this._transport.connect();

        this._starting = false;

        console.log(`Runtime '${this.locator.label}' started`);
    }

    async stop() {
        if (this._stopping)
            return;

        this._stopping = true;

        await this._transport.disconnect();

        if (this.connectors)
            await Promise.all(this.connectors.map(
                (connector) => connector.__runtime ? connector.__runtime.stop() : connector.disconnect(),
            ));

        this._stopping = false;

        console.log(`Runtime '${this.locator.label}' stopped`);
    }

}

module.exports = Runtime;
