import { generate } from 'randomstring'
import type * as redis from 'ioredis'

export const Redis = jest.fn(() => ({
  options: {
    host: generate(),
    port: generate()
  },
  connect: jest.fn(async () => undefined),
  disconnect: jest.fn(),
  get: jest.fn(async () => generate()),
  getBuffer: jest.fn(async () => Buffer.from(generate())),
  set: jest.fn(async () => undefined),
  on: jest.fn()
})) as unknown as jest.Mock<typeof redis.Redis>

export const Connection = jest.fn(() => ({
  redises: [new Redis()],
  link: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn()
}))

export const ioredis = { Redis }
