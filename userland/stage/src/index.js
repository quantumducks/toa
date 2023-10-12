'use strict'

const { manifest } = require('./manifest')
const { component } = require('./component')
const { composition } = require('./composition')
const { remote } = require('./remote')
const { shutdown } = require('./shutdown')
const binding = require('./binding')

exports.manifest = manifest
exports.component = component
exports.composition = composition
exports.compose = composition
exports.remote = remote
exports.shutdown = shutdown
exports.binding = binding
