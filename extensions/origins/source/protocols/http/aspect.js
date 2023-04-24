'use strict'

const fetch = require('node-fetch')

const { Connector } = require('@toa.io/core')
const { retry } = require('@toa.io/generic')

const { Permissions } = require('./.aspect/permissions')
const { id } = require('./id')
const protocols = require('./protocols')

/**
 * @implements {toa.origins.http.Aspect}
 */
class Aspect extends Connector {
  /** @readonly */
  name = id

  /** @type {toa.origins.Manifest} */
  #origins

  /** @type {toa.origins.http.Permissions} */
  #permissions

  /**
   * @param {toa.origins.Manifest} manifest
   * @param {toa.origins.http.Permissions} permissions
   */
  constructor (manifest, permissions) {
    super()

    this.#origins = manifest
    this.#permissions = permissions
  }

  async invoke (name, path, request, options) {
    let origin = this.#origins[name]

    if (origin === undefined) {
      if (isAbsoluteURL(/** @type {string} */ name)) {
        return this.#invokeURL(
          /** @type {string} */ name,
          /** @type {import('node-fetch').RequestInit} */ path
        )
      } else throw new Error(`Origin '${name}' is not defined`)
    }

    // absolute urls are forbidden when using origins
    if (typeof path === 'string' && isAbsoluteURL(path)) throw new Error(`Absolute URLs are forbidden (${path})`)

    if (options?.substitutions !== undefined) origin = substitute(origin, options.substitutions)

    const url = path === undefined ? new URL(origin) : new URL(path, origin)

    return this.#request(url.href, request, options?.retry)
  }

  /**
   * @param {string} url
   * @param {import('node-fetch').RequestInit} request
   * @return {Promise<void>}
   */
  async #invokeURL (url, request) {
    if (this.#permissions.test(url) === false) throw new Error(`URL '${url}' is not allowed`)

    return this.#request(url, request)
  }

  /**
   * @param {string} url
   * @param {import('node-fetch').RequestInit} request
   * @param {toa.generic.retry.Options} [options]
   * @return {Promise<import('node-fetch').Response>}
   */
  async #request (url, request, options) {
    const call = () => fetch(url, request)

    if (options === undefined) return call()
    else return this.#retry(call, options)
  }

  /**
   * @param {Function} call
   * @param {toa.generic.retry.Options} options
   * @return {any}
   */
  #retry (call, options) {
    return retry(async (retry) => {
      const response = await call()

      if (Math.floor(response.status / 100) !== 2) return retry()

      return response
    }, options)
  }
}

/**
 * @param {string} origin
 * @param {string[]} substitutions
 * @returns {string}
 */
function substitute (origin, substitutions) {
  const replace = () => substitutions.shift()

  return origin.replace(PLACEHOLDER, replace)
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isAbsoluteURL (path) {
  return protocols.findIndex((protocol) => path.indexOf(protocol) === 0) !== -1
}

const PLACEHOLDER = /\*/g

/**
 * @param {toa.origins.Manifest} manifest
 * @param {toa.origins.http.Properties} [properties]
 */
function create (manifest, properties) {
  const permissions = new Permissions(properties)

  return new Aspect(manifest, permissions)
}

exports.create = create
