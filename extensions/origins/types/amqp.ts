import * as _extensions from '@toa.io/core/types/extensions'

declare namespace toa.origins.amqp {

  interface Aspect extends _extensions.Aspect {
    invoke(method: string, ...args: any[]): Promise<any>
  }

}
