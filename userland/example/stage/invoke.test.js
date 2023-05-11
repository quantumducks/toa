'use strict'

const { resolve } = require('node:path')
const stage = require('@toa.io/userland/stage')

const root = resolve(__dirname, '../components')

/** @type {toa.core.Component} */
let component

beforeAll(async () => {
  process.env.TOA_DEV = '1'

  const path = resolve(root, 'math.calculations')

  component = await stage.component(path)
})

afterAll(async () => {
  await stage.shutdown()

  delete process.env.TOA_DEV
})

it('should invoke', async () => {
  const a = Math.random()
  const b = Math.random()

  const reply = await component.invoke('add', { input: { a, b } })

  expect(reply.exception).toBeUndefined()
  expect(reply.output).toStrictEqual(a + b)
})
