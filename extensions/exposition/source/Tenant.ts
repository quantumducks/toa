import { Connector, type Locator, type bindings } from '@toa.io/core'
import { type Label } from './discovery'
import type * as RTD from './RTD/syntax'

export class Tenant extends Connector {
  private readonly broadcast: Broadcast
  private readonly branch: RTD.Branch

  public constructor (broadcast: Broadcast, locator: Locator, node: RTD.Node) {
    super()

    this.broadcast = broadcast
    this.branch = { namespace: locator.namespace, component: locator.name, node }

    this.depends(broadcast)
  }

  public override async open (): Promise<void> {
    await this.expose()
    await this.broadcast.receive('ping', this.expose.bind(this))

    console.info('Exposition Tenant for ' +
      `'${this.branch.namespace}.${this.branch.component}' has started.`)
  }

  private async expose (): Promise<void> {
    await this.broadcast.transmit('expose', this.branch)
  }
}

type Broadcast = bindings.Broadcast<Label>