import { generate } from 'randomstring'
import type { Manifest } from '@toa.io/norm'

export function manifest (): Manifest {
  return {
    namespace: generate(),
    name: generate(),
    operations: {
      observe: {
        type: 'observation'
      },
      transit: {
        type: 'transition'
      },
      assign: {
        type: 'assignment'
      }
    }
  } as unknown as Manifest
}