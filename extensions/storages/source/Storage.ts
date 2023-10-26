import { Readable } from 'node:stream'
import { posix } from 'node:path'
import { decode, encode } from 'msgpackr'
import { buffer, newid } from '@toa.io/generic'
import { Scanner } from './Scanner'
import type { Provider } from './Provider'
import type { Entry } from './Entry'

export class Storage {
  private readonly provider: Provider

  public constructor (provider: Provider) {
    this.provider = provider
  }

  public async get (path: string): Maybe<Entry> {
    const metapath = posix.join(ENTRIES, path, META)
    const result = await this.provider.get(metapath)

    if (result === null) return ERR_NOT_FOUND
    else return decode(await buffer(result))
  }

  public async put (path: string, stream: Readable, type?: string): Maybe<Entry> {
    const scanner = new Scanner(type)
    const pipe = stream.pipe(scanner)
    const tempname = await this.transit(pipe)

    if (scanner.error !== null)
      return scanner.error

    const id = scanner.digest()

    await this.persist(tempname, id)

    const entry = await this.create(path, id, scanner.size, scanner.type)

    await this.enroll(path, id, true)

    return entry
  }

  public async diversify (path: string, name: string, stream: Readable): Maybe<void> {
    const scanner = new Scanner()
    const pipe = stream.pipe(scanner)

    await this.provider.put(posix.join(ENTRIES, path), name, pipe)

    if (scanner.error !== null)
      return scanner.error

    const { size, type } = scanner
    const entry = await this.get(path)

    if (entry instanceof Error)
      return entry

    entry.variants = entry.variants.filter((variant) => variant.name !== name)
    entry.variants.push({ name, size, type })

    await this.replace(path, entry)
  }

  public async fetch (path: string): Maybe<Readable> {
    const { id, variant, rel } = this.parse(path)

    const blob = variant === null
      ? posix.join(BLOBs, id)
      : posix.join(ENTRIES, rel, id, variant)

    const stream = await this.provider.get(blob)

    if (stream === null) return ERR_NOT_FOUND
    else return stream
  }

  public async list (path: string): Promise<string[]> {
    const stream = await this.provider.get(posix.join(ENTRIES, path, LIST))

    return stream === null ? [] : decode(await buffer(stream))
  }

  public async permutate (path: string, ids: string[]): Maybe<void> {
    const unique = new Set(ids)
    const dir = posix.join(ENTRIES, path)
    const list = await this.getList(dir)

    if (list.length !== ids.length || unique.size !== ids.length)
      return ERR_PERMUTATION_MISMATCH

    for (const id of ids)
      if (!list.includes(id))
        return ERR_PERMUTATION_MISMATCH

    await this.provider.put(dir, LIST, Readable.from(encode(ids)))
  }

  public async conceal (path: string): Maybe<void> {
    const { id, rel } = this.parse(path)
    const dir = posix.join(ENTRIES, rel)
    const list = await this.getList(dir)
    const index = list.indexOf(id)

    if (index === -1)
      return

    list.splice(index, 1)

    await this.provider.put(dir, LIST, Readable.from(encode(list)))
  }

  public async reveal (path: string, id: string): Maybe<void> {
    await this.enroll(path, id)
  }

  public async annotate (path: string, key: string, value?: unknown): Maybe<void> {
    const entry = await this.get(path)

    if (entry instanceof Error)
      return entry

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (value === undefined) delete entry.meta[key]
    else entry.meta[key] = value

    await this.replace(path, entry)
  }

  private async transit (stream: Readable): Promise<string> {
    const tempname = newid()

    await this.provider.put(TEMP, tempname, stream)

    return tempname
  }

  private async persist (tempname: string, id: string): Promise<void> {
    const temp = posix.join(TEMP, tempname)
    const blob = posix.join(BLOBs, id)

    await this.provider.move(temp, blob)
  }

  private async getList (dir: string): Promise<string[]> {
    const listfile = posix.join(dir, LIST)
    const stream = await this.provider.get(listfile)

    return stream === null ? [] : decode(await buffer(stream))
  }

  // eslint-disable-next-line max-params
  private async create (path: string, id: string, size: number, type: string): Promise<Entry> {
    const entry: Entry = {
      id,
      size,
      type,
      created: Date.now(),
      variants: [],
      meta: {}
    }

    const metafile = posix.join(path, entry.id)
    const existing = await this.get(metafile)

    if (!(existing instanceof Error)) {
      Object.assign(entry, existing)

      await this.reveal(path, id)
    }

    await this.replace(metafile, entry)

    return entry
  }

  private async replace (rel: string, entry: Entry): Promise<void> {
    const buffer = encode(entry)
    const stream = Readable.from(buffer)

    await this.provider.put(posix.join(ENTRIES, rel), META, stream)
  }

  private async enroll (path: string, id: string, shift: boolean = false): Promise<void> {
    const dir = posix.join(ENTRIES, path)
    const list = await this.getList(dir)
    const index = list.indexOf(id)

    if (index !== -1)
      if (shift) list.splice(index, 1)
      else return

    list.push(id)

    await this.provider.put(dir, LIST, Readable.from(encode(list)))
  }

  private parse (path: string): Path {
    const [last, ...segments] = path.split('/').reverse()
    const [id, ...rest] = last.split('.')
    const variant = rest.length > 0 ? rest.join('.') : null
    const rel = segments.reverse().join('/')

    return { rel, id, variant }
  }
}

const ERR_NOT_FOUND = new Error('NOT_FOUND')
const ERR_PERMUTATION_MISMATCH = new Error('PERMUTATION_MISMATCH')

const TEMP = '/temp'
const BLOBs = '/blobs'
const ENTRIES = '/entries'
const LIST = '.list'
const META = '.meta'

type Maybe<T> = Promise<T | Error>

interface Path {
  rel: string
  id: string
  variant: string | null
}
