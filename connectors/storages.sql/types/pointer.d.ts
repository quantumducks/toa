import { Pointer as Base } from '@toa.io/libraries/pointer/types'

declare namespace toa.sql {

  interface Pointer extends Base {
    key: string
    database: string
    table: string
  }

}
