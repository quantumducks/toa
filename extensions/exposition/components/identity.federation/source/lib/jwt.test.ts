/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { SupportedTokenAlg } from '../types'
import { validateSignature, decodeJwt } from './jwt'

describe('jwt', () => {
  test('decode', () => {
    const { header, payload } = decodeJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb21lIjoicGF5bG9hZCJ9.4twFt5NiznN84AWoo1d7KO1T_yoc0Z6XOpOVswacPZg')

    expect(header).toMatchObject({ alg: 'HS256' })
    expect(payload).toEqual({ some: 'payload' })
  })

  test('symmetric pass', async () => {
    // example from
    // https://pyjwt.readthedocs.io/en/latest/usage.html#encoding-decoding-tokens-with-hs256

    await expect(validateSignature({
      header: { alg: SupportedTokenAlg.HS256 },
      payload: { iss: 'test-issuer' },
      rawHeader: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      rawPayload: 'eyJzb21lIjoicGF5bG9hZCJ9',
      signature: '4twFt5NiznN84AWoo1d7KO1T_yoc0Z6XOpOVswacPZg',
      trusted: [
        {
          issuer: 'test-issuer',
          secret: 'secret'
        }
      ]
    } as Parameters<typeof validateSignature>[0])).resolves.toBeUndefined()
  })

  test('symmetric fail', async () => {
    await expect(validateSignature({
      header: { alg: SupportedTokenAlg.HS256 },
      payload: { iss: 'test-issuer' },
      rawHeader: 'header',
      rawPayload: 'payload',
      signature: 'signature',
      trusted: [
        {
          issuer: 'test-issuer',
          secret: 'secret'
        }
      ]
    } as Parameters<typeof validateSignature>[0])).rejects.toThrow('Signature does not match')
  })
})
