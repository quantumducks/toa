'use strict'

const { Process } = require('../process')
const { Operator } = require('./operator')
const { Factory: Images, Registry } = require('./images')
const { Deployment } = require('./deployment')
const { Composition } = require('./composition')
const { Service } = require('./service')

/**
 * @implements {toa.operations.deployment.Factory}
 */
class Factory {
  /** @type {toa.formation.Context} */
  #context
  /** @type {toa.operations.deployment.images.Registry} */
  #registry
  /** @type {toa.operations.Process} */
  #process

  /**
   * @param context {toa.formation.Context}
   */
  constructor (context) {
    this.#context = context
    this.#process = new Process()

    const images = new Images(context.name, context.runtime)
    this.#registry = new Registry(context.registry, images, this.#process)
  }

  operator () {
    const compositions = this.#context.compositions.map((composition) => this.#composition(composition))
    const dependencies = this.#dependencies()
    const deployment = new Deployment(this.#context, compositions, dependencies, this.#process)

    return new Operator(deployment, this.#registry)
  }

  /**
   * @param composition {toa.formation.context.Composition}
   * @returns {Composition}
   */
  #composition (composition) {
    const image = this.#registry.composition(composition)

    return new Composition(composition, image)
  }

  /**
   * @returns {toa.operations.deployment.Dependency[]}
   */
  #dependencies () {
    /** @type {toa.operations.deployment.Dependency[]} */
    const dependencies = []

    for (const [reference, instances] of Object.entries(this.#context.dependencies)) {
      const dependency = this.#dependency(reference, instances)

      if (dependency !== undefined) dependencies.push(dependency)
    }

    return dependencies
  }

  /**
   * @param {string} path
   * @param {toa.formation.context.dependencies.Instance[]} instances
   * @returns {toa.operations.deployment.Dependency | undefined}
   */
  #dependency (path, instances) {
    const module = require(path)
    const pkg = require(path + '/package.json')

    if (module.deployment === undefined) return

    const annotations = this.#context.annotations?.[pkg.name]

    /** @type {toa.operations.deployment.dependency.Declaration} */
    const dependency = module.deployment(instances, annotations)

    /** @type {toa.operations.deployment.Service[]} */
    const services = dependency.services?.map((service) => this.#service(path, service))

    return { ...dependency, services }
  }

  /**
   * @param path {string}
   * @param service {toa.operations.deployment.dependency.Service}
   * @returns {Service}
   */
  #service (path, service) {
    const image = this.#registry.service(path, service)

    return new Service(service, image)
  }
}

exports.Factory = Factory
