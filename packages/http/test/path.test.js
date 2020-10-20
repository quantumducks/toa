const path = require('../src/path');

it('should return path', () => {
    const input = '/static';
    const result = path(input);
    expect(result.route).toEqual(input);
});

it('should parse parameters', () => {
    const input = '/{_id}';
    const result = path(input);
    expect(result.route).toEqual('/:_id');
    expect(result.params).toEqual(['_id']);
});
