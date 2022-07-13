'use strict'

const amqp = require('amqplib')

const { Connector } = require('@toa.io/core')
const { console } = require('@toa.io/libraries/console')

class Connection extends Connector {
  /** @type {toa.amqp.Pointer} */
  #pointer

  /** @type {import('amqplib').Connection} */
  #connection

  /**
   * @param {toa.amqp.Pointer} pointer
   */
  constructor (pointer) {
    super()

    this.#pointer = pointer
  }

  async connection () {
    try {
      this.#connection = await amqp.connect(this.#pointer.reference)
    } catch (e) {
      console.error(`Connection to ${this.#pointer.label} has failed`)

      throw e
    }

    console.info(`AMQP Binding connected to ${this.#pointer.label}`)
  }

  async disconnection () {
    // TODO: handle current operations
    // http://www.squaremobius.net/amqp.node/channel_api.html#model_close
    await this.#connection.close()

    console.info(`AMQP Binding disconnected from ${this.#pointer.label}`)
  }

  async channel () {
    return await this.#connection.createChannel()
  }
}

exports.Connection = Connection
