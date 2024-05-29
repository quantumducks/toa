'use strict'

const { Component, Locator, State, entities } = require('@toa.io/core')
const { Schema } = require('@toa.io/schema')

const boot = require('./index')

/**
 * @param {toa.norm.Component} manifest
 * @returns {Promise<toa.core.Component>}
 */
const component = async (manifest) => {
  boot.extensions.load(manifest)

  const locator = new Locator(manifest.name, manifest.namespace)
  const storage = boot.storage(manifest)
  const context = await boot.context(manifest)
  const emission = boot.emission(manifest.events, locator, context)

  let state

  if (manifest.entity !== undefined) {
    const schema = new Schema(manifest.entity.schema)
    const entity = new entities.Factory(schema)

    state = new State(storage, entity, emission, manifest.entity.associated)
  }

  const operations = await bootOperations(manifest, context, state)
  const component = new Component(locator, operations)

  if (storage) component.depends(storage)
  if (emission) component.depends(emission)

  return boot.extensions.component(component)
}

async function bootOperations (manifest, context, state) {
  if (manifest.operations === undefined)
    return {}

  const operations = {}

  for (const [endpoint, definition] of Object.entries(manifest.operations))
    operations[endpoint] = await boot.operation(manifest, endpoint, definition, context, state)

  return operations
}

exports.component = component
