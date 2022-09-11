import type { Locator } from '@toa.io/core/types'

export namespace toa.norm {

  namespace component {
    namespace operations {

      type Type = 'transition' | 'observation' | 'assignment'
      type Scope = 'object' | 'objects' | 'changeset' | 'none'

    }

    interface Map {
      [id: string]: Component
    }

    interface Operation {
      type?: operations.Type
      scope?: operations.Scope
      bindings?: string[]
      input?: any
      output?: any
      error?: any
    }

    interface Operations {
      [key: string]: Operation
    }

    interface Event {
      binding: string
    }

    interface Events {
      [key: string]: Event
    }

    interface Extensions {
      [key: string]: Object
    }

    type Entity = {
      schema: Object
      storage?: string
      initialized?: boolean
    }

    interface Declaration {
      namespace: string
      name: string
      version: string
      entity: Entity
      operations?: component.Operations
      events?: component.Events
      extensions?: component.Extensions
    }

    type Constructor = (path: string) => Promise<Component>
  }

  interface Component extends component.Declaration {
    locator: Locator
    path: string
  }
}

export type Component = toa.norm.Component
export type Operation = toa.norm.component.Operation
export type Declaration = toa.norm.component.Declaration

export const component: toa.norm.component.Constructor
