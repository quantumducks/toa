const POINTER_RE = /(?<!\\)\*(\w+)/gm;

module.exports = (state, binding, req) => {
    const query = {};
    const criteria = [];

    if (state === 'collection') {

        ['omit', 'limit', 'sort'].forEach(prop => {
            const sealed = binding.query?.[prop] !== undefined && binding.query?.sealed;
            let value = (!sealed && !binding.query?.frozen && req.query[prop]) || binding.query?.[prop];

            if (typeof value === 'object')
                value = value.default;

            if (value)
                query[prop] = value;
        });

        if (binding.query?.projection)
            query.projection = binding.query.projection;
    }

    if (binding.query?.criteria !== undefined)
        criteria.push(binding.query.criteria.replace(POINTER_RE, (_, name) => req.params[`__pointer_${name}`]));

    if (!binding.query?.frozen && req.query.criteria && (binding.query?.criteria === undefined || !binding.query?.sealed))
        criteria.push(req.query.criteria);

    if (Object.keys(req.params).length)
        Object.entries(req.params).forEach(
            ([name, value]) => name.substring(0, 2) !== '__' && criteria.push(`${name}==${value}`),
        );

    if (criteria.length)
        query.criteria = criteria.join(';');

    return query;
};
