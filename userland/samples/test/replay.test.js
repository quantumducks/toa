'use strict'

const clone = require('clone-deep')

const { stage } = require('./stage.mock')
const mock = { stage }

jest.mock('@toa.io/userland/stage', () => mock.stage)

const fixtures = require('./replay.fixtures')
const { replay } = require('../src')

it('should be', () => {
  expect(replay).toBeDefined()
})

let ok

/** @type {toa.samples.Suite} */
let suite

beforeEach(async () => {
  jest.clearAllMocks()

  suite = clone(fixtures.suite)
  ok = await replay(suite)
})

it('should connect remotes', () => {
  const { components } = suite
  const ids = Object.keys(components)

  expect(ids.length).toBeGreaterThan(0)
  expect(stage.remote).toHaveBeenCalledTimes(ids.length)

  let n = 0

  for (const id of ids) {
    n++

    expect(stage.remote).toHaveBeenNthCalledWith(n, id)
  }
})

it('should invoke operations with samples', async () => {
  const { autonomous, components } = fixtures.suite

  for (const [id, component] of Object.entries(components)) {
    const remote = await find(id)

    for (const [operation, samples] of Object.entries(component.operations)) {
      for (const sample of samples) {
        const { request, ...rest } = sample

        request.sample = clone(rest)
        request.sample.autonomous = autonomous

        expect(remote.invoke).toHaveBeenCalledWith(operation, request)
      }
    }
  }
})

it('should return results', () => {
  expect(ok).toStrictEqual(true)
})

/**
 * @param {string} component
 * @return {Promise<jest.MockedObject<toa.core.Component>>}
 */
const find = async (component) => {
  for (let n = 0; n < stage.remote.mock.calls.length; n++) {
    const call = stage.remote.mock.calls[n]

    if (call[0] === component) return await stage.remote.mock.results[n].value
  }

  throw new Error(`Remote ${component} hasn't been connected`)
}
