'use strict'

const { generate } = require('randomstring')
const { remap, encode } = require('@toa.io/libraries/generic')

const fixtures = require('./secrets.fixtures')
const mock = fixtures.mock

jest.mock('@toa.io/libraries/command', () => mock.command)
const { secrets } = require('../')

it('should be', () => {
  expect(secrets).toBeDefined()
})

describe('upsert', () => {
  const store = secrets.store

  it('should be', () => {
    expect(store).toBeDefined()
  })

  it('should create secret', async () => {
    const name = generate()
    const values = { foo: generate() }
    const data = remap(values, encode)
    const metadata = { name }
    const command = 'kubectl apply -f -'

    mock.command.execute.mockResolvedValueOnce({ exitCode: 1 }) // no such secret

    await store(name, values)

    expect(mock.command.execute).toHaveBeenCalledWith(command, expect.any(String))

    const json = mock.command.execute.mock.calls[1][1]
    const object = JSON.parse(json)

    expect(object).toMatchObject({ metadata, data })
  })

  it('should update existing secret', async () => {
    const name = generate()
    const foo = generate()
    const bar = generate()
    const values = { bar }
    const command = 'kubectl apply -f -'

    const declaration = { metadata: { name }, data: { foo: encode(foo) } }
    const result = { exitCode: 0, output: JSON.stringify(declaration) }

    mock.command.execute.mockResolvedValueOnce(result) // result for get()

    await store(name, values)

    expect(mock.command.execute.mock.calls.length).toStrictEqual(2)

    const args = mock.command.execute.mock.calls[1]

    declaration.data.bar = encode(bar)

    expect(args[0]).toStrictEqual(command)

    const input = JSON.parse(args[1])

    expect(input).toMatchObject(declaration)
  })
})

describe('get', () => {
  const get = secrets.get

  it('should be', () => {
    expect(get).toBeDefined()
    expect(get).toBeInstanceOf(Function)
  })

  it('should return declaration', async () => {
    const name = generate()
    const declaration = { data: { foo: generate(), bar: generate() } }
    const result = { exitCode: 0, output: JSON.stringify(declaration) }
    const command = `kubectl get secret ${name} -o json`

    mock.command.execute.mockResolvedValueOnce(result)

    const output = await get(name)

    expect(mock.command.execute).toHaveBeenCalledWith(command)
    expect(output).toStrictEqual(declaration)
  })
})
