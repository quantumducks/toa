import { Reply } from './call'

export interface Operation {
  mount: (context: any) => void | Promise<void>
  execute: (input: any, scope: any) => Promise<Reply<any>>
}
