import { type PostProcessInput, type Directive } from './types'
import { isSafeMethod } from './utils'

export class Exact implements Directive {
  private readonly value: string

  public constructor (value: string) {
    this.value = value
  }

  public postProcess (request: PostProcessInput, headers: Headers): void {
    if (!isSafeMethod(request.method)) return

    headers.append('cache-control', this.value)
  }
}