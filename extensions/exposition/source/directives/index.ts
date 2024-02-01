import { type Family } from '../Directive'
import Dev from './dev'
import Auth from './auth'
import Cache from './cache'
import Octets from './octets'
import Vary from './vary'

export const families: Family[] = [Auth, Octets, Dev, Cache, Vary]
