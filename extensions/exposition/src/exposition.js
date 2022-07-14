'use strict'

const { Connector } = require('@toa.io/core')
const { console } = require('@toa.io/libraries/console')

class Exposition extends Connector {
  /** @type {toa.core.bindings.Broadcaster} */
  #broadcast

  /** @type {toa.extensions.exposition.remotes.Factory} */
  #remote

  /** @type {toa.extensions.exposition.exposition.Remotes} */
  #remotes = {}

  /**
   * @param {toa.core.bindings.Broadcaster} broadcast
   * @param {toa.extensions.exposition.remotes.Factory} connect
   */
  constructor (broadcast, connect) {
    super()

    this.#broadcast = broadcast
    this.#remote = connect

    this.depends(broadcast)
  }

  /** @override */
  async connection () {
    await this.#broadcast.receive('expose', this.#expose.bind(this))
    this.#broadcast.send('ping', {}).then()

    console.info(this.constructor.name + ' started')
  }

  /**
   * @param {toa.extensions.exposition.declarations.Exposition} declaration
   * @returns {Promise<void>}
   */
  async #expose (declaration) {
    const { namespace, name, resources } = declaration
    const key = namespace + '/' + name

    if (this.#remotes[key] === undefined) this.#remotes[key] = this.#connect(namespace, name)

    const remote = await this.#remotes[key]

    remote.update(resources)
  }

  /**
   * @param {string} namespace
   * @param {string} name
   * @returns {Promise<Remote>}
   */
  async #connect (namespace, name) {
    const remote = await this.#remote(namespace, name)

    await remote.connect()

    this.depends(remote)

    return remote
  }
}

exports.Exposition = Exposition
