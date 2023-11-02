import { type Output, type Input } from '../../Directive'

export interface Directive {
  preProcess?: (input: Input) => Output
  postProcess?: (input: Input) => Headers
}

export interface PostProcessInput extends Input {
  identity?: unknown | null
}
