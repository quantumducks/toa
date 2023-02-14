'use strict'

const { generate } = require('randomstring')
const { promise } = require('../')

const { track } = require('../')

it('should be', async () => {
  expect(track).toBeDefined()
})

/** @type {toa.generic.promise.Exposed} */
let done

/** @type {toa.generic.promise.Exposed} */
let undone

const method1 = /** @type {jest.MockedFn<(a: string, b: string) => Promise>} */
  jest.fn(async function () {
    // should execute in context
    expect(this.ok).toStrictEqual(1)

    return done
  })

const method2 = /** @type {jest.MockedFn<(a: string, b: string) => Promise>} */
  jest.fn(async function () { return undone })

class Test {
  ok = 1
  do = track(this, method1)
  undo = track(this, method2)
}

/** @type {Test} */
let test

beforeEach(() => {
  jest.clearAllMocks()

  done = promise()
  undone = promise()
  test = new Test()
})

it('should return function', async () => {
  expect(test.do).toBeInstanceOf(Function)
})

it('should execute method', async () => {
  const result = generate()

  done.resolve(result)

  const args = [generate(), generate()]

  const output = await test.do(...args)

  expect(method1).toHaveBeenCalledWith(...args)
  expect(output).toStrictEqual(result)
})

it('should track method execution', async () => {
  expect.assertions(2)

  setImmediate(async () => {
    setImmediate(() => {
      done.resolve()

      expect(finished).toStrictEqual(false)

      setImmediate(() => {
        expect(finished).toStrictEqual(true)
      })
    })

    let finished = false

    await track(test)

    finished = true
  })

  await test.do()
})

it('should track multiple methods', async () => {
  expect.assertions(3 + 1) // + method1

  setImmediate(async () => {
    setImmediate(() => {
      done.resolve()

      expect(finished).toStrictEqual(false)

      setImmediate(() => {
        undone.resolve()

        expect(finished).toStrictEqual(false)
        setImmediate(() => expect(finished).toStrictEqual(true))
      })
    })

    let finished = false

    await track(test)

    finished = true
  })

  await Promise.all([test.do(), test.undo()])
})

it('should resolve if methods haven\'t been called', async () => {
  await track(this)
})
