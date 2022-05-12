'use strict'

const fixtures = require('./image.fixtures')
const { generate } = require('randomstring')

/** @type {toa.operations.deployment.images.Image} */
let instance

beforeEach(() => {
  instance = new fixtures.Class(fixtures.scope, fixtures.runtime)
})

it('should assign url', () => {
  const registry = generate()

  instance.tag(registry)

  expect(instance.reference).toEqual(`${registry}/${fixtures.scope}/${fixtures.name}:${fixtures.key}`)
})

describe('prepare', () => {
  it('should throw error if no dockerfile specified', async () => {
    await expect(instance.prepare(generate())).rejects.toThrow(/Dockerfile isn't specified/)
  })
})
