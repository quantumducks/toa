'use strict'

const { resolve, dirname } = require('node:path')
const { traverse, add } = require('@toa.io/generic')
const { file } = require('@toa.io/filesystem')

/** @type {toa.yaml.extension} */
const $import = (object, path, yaml) => {
  return traverse(object, (node) => {
    if ('$import' in node) extend(node, path, yaml)

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(item => $import(item, path, yaml))
    }
  })
}

/**
 * @param {{$import: string}} node
 * @param {string} [path]
 * @param {{load: { sync: (string) => object }}} [yaml]
 */
function extend (node, path, yaml) {
  const basepath = dirname(path)
  const pattern = resolve(basepath, node.$import)
  const files = file.glob.sync(pattern).filter((file) => file !== path)

  if (files.length === 0) throw new Error(`No files matching pattern '${pattern}'`)

  const objects = files.map((path) => yaml.load.sync(path))

  delete node.$import

  return objects.reduce((node, object) => add(node, object), node)
}

module.exports = $import
