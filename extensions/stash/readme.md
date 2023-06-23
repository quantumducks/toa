# Toa Stash

Shared cache and distributed lock manager on top of [ioredis](https://github.com/redis/ioredis).

## Shared cache

`stash` aspect exposes [`ioredis` methods](https://redis.github.io/ioredis/classes/Cluster.html).

```javascript
async function computation (input, context) {
  await context.stash.set('key', 'value')
  await context.stash.get('key')
}
```

Keys are component-scoped, meaning that the underlying Redis keys are `namespace:name:key`.

### Additional methods

`async store (key: string, value: object, ...args: Array<string | number>)`

`async fetch (key: string): object`

`...args` are the [arguments of `set`](https://redis.github.io/ioredis/classes/Cluster.html#set)
starting from third.

Values are encoded using [msgpack](https://msgpack.org).

## Distributed lock manager

> Implemented by [Node.js bridge](/connectors/bridges.node)

`async lock(id: string, callback: async? () => void)`

Attempts to acquire a lock with the specified `id`.
If the lock is successfully acquired, the `callback` function is executed.
Once the execution of the `callback` is completed, the lock is released.

Lock ID is component-scoped.

```javascript
async function computation (input, context) {
  await context.stash.lock('lock id', () => console.log('Lock acquired'))
}
```

## Manifest

To enable extension for a component, add `null` definition to its manifest:

```yaml
stash: ~
```

## Deployment

Stash context annotation is a [Pointer](/libraries/pointer).

```yaml
stash: # shortcut is available
  default: redis://localhost
  dummies.dummy: redis://redis{0-3}.example.com:6379 # shard syntax is available for clusters
```