//region producer
export function* count(start = 0, step = 1): Generator<number, never, never> {
  while (true) {
    yield start;
    start += step;
  }
}

export function* repeat(value: number, n=Infinity): Generator<number, void, never> {
  let i = 0;
  while (i++ < n) {
    yield value;
  }
}

export function range(stop: number): Generator<number>
export function* range(start: number, stop?: number, step = 1): Generator<number, void, never> {
  start = start ?? 0;
  if (typeof stop !== 'number') {
    stop = start;
    start = 0;
  }
  step = step ?? 1;
  
  [start, stop] = step > 0
    ? [Math.min(start, stop), Math.max(start, stop)]
    : [Math.max(start, stop), Math.min(start, stop)];
  
  if (step > 0) {
    while (start < stop) {
      yield start;
      start += step;
    }
  }
  else {
    while (start >= stop) {
      yield start;
      start += step;
    }
  }
}
//endregion

//#region consume and produce
export function* cycle<T>(iterable: Iterable<T>): Generator<T, never, never> {
  const acc: T[] = [];
  
  yield* tap(iterable, item => acc.push(item));
  
  while (true) {
    yield* acc
  }
}

export function* map<T, R, S>(
  iterable: Iterable<T>,
  mapFn: (this: S|undefined, item: T) => R,
  thisArg?: S
): Generator<R, void, never> {
  for (const item of iterable) {
    yield mapFn.call(thisArg, item);
  }
}

export function* filter<T, S>(
  iterable: Iterable<T>,
  filterFn: (this: S | undefined, item: T) => boolean,
  thisArg?: S
): Generator<T, void, never> {
  for (const item of iterable) {
    if (filterFn.call(thisArg, item)) yield item;
  }
}

export function* tap<T, S>(
  iterable: Iterable<T>,
  tapFn: (this: S | undefined, item: T) => void,
  thisArg?: S
): Generator<T, void, never> {
  for (const item of iterable) {
    tapFn.call(thisArg, item);
    yield item;
  }
}

export function* enumerate<T>(iterable: Iterable<T>): Generator<[number, T], void, never> {
  let index = 0;
  for (const item of iterable) {
    yield [index++, item];
  }
}

export function* take<T>(iterable: Iterable<T>, limit: number): Generator<T, void, never> {
  let index = 0;
  for (const item of iterable) {
    if (index++ >= limit) return;
    yield item;
  }
}

export function* drop<T>(iterable: Iterable<T>, limit: number): Generator<T, void, never> {
  let index = 0;
  for (const item of iterable) {
    if (index++ < limit) continue;
    yield item;
  }
}

export function* takeWhile<T, S>(
  iterable: Iterable<T>,
  takeWhileFn: (this: S|undefined, item: T) => boolean,
  thisArg?: S
): Generator<T, void, never> {
  for (const item of iterable) {
    if (!takeWhileFn.call(thisArg, item)) return;
    yield item;
  }
}

export function* dropWhile<T, S>(
  iterable: Iterable<T>,
  dropWhile: (this: S|undefined, item: T) => boolean,
  thisArg?: S
): Generator<T, void, never> {
  for (const item of iterable) {
    if (dropWhile.call(thisArg, item)) continue;
    yield item;
  }
}

/**
 * Check if iterable but not string
 * @param any
 */
function isFlattable(any: any): boolean {
  if (!any) return false;
  
  const anyType = typeof any;
  if (anyType === 'object' || anyType === 'function') return typeof anyType[Symbol.iterator] === "function";
  
  return false;
}

export function* flat<T>(iterableOfIterable: Iterable<T | Iterable<T>>): Generator<T, void, never> {
  for (const iterable of iterableOfIterable) {
    if (isFlattable(iterable)) {
      // @ts-ignore (isFlattable check if is iterable)
      yield* iterable;
    }
    else yield iterable as T;
  }
}

export function flatMap<T, R, S>(
  iterableOfIterable: Iterable<T | Iterable<T>>,
  mapFn: (this: S|undefined, item: T) => R,
  thisArg?: S
): Generator<R, void, never> {
  return map(flat(iterableOfIterable), mapFn, thisArg);
}

export function* iterator<T>(iterable: Iterable<T>): Generator<T, void, never> {
  yield* iterable;
}

export function* concat<T>(...iterables: Iterable<T>[]): Generator<T, void, never> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}
//endregion

//region collectors
export function first<T>(iterable: Iterable<T>) {
  const next = iterator(iterable).next();

  return next.value;
}

export function find<T, S>(
  iterable: Iterable<T>,
  findFn: (this: S|undefined, item: T) => boolean,
  thisArg?: S
): T | void {
  for (const item of iterable) {
    if (findFn.call(thisArg, item)) return item;
  }
}

export function some<T, S>(
  iterable: Iterable<T>,
  someFn: (this: S|undefined, item: T) => boolean,
  thisArg?: S
): boolean {
  for (const item of iterable) {
    if (someFn.call(thisArg, item)) return true;
  }

  return false;
}

export function every<T, S>(
  iterable: Iterable<T>,
  everyFn: (this: S|undefined, item: T) => boolean,
  thisArg?: S
) {
  for (const item of iterable) {
    if (!everyFn.call(thisArg, item)) return false;
  }
  
  return true;
}

export function reduce<T, R = number, S = undefined>(
  iterable: Iterable<T>,
  accumulatorFn: (this: S|undefined, accumulator: R, item: T) => R,
  accumulator: R = 0 as unknown as R,
  thisArg?: S
): R {
  for (const item of iterable) {
    accumulator = accumulatorFn.call(thisArg, accumulator, item);
  }
  
  return accumulator;
}

export function forEach<T, S>(
  iterable: Iterable<T>,
  forEachFn: (this: S|undefined, item: T) => void,
  thisArg?: S
): void {
  for (const item of iterable) {
    forEachFn.call(thisArg, item);
  }
}

export function join<T>(iterable: Iterable<T>, separator=','): string {
  const str = reduce(iterable, (str, item) => str + item, '');
  
  return str.slice(0, -separator.length)
}
//endregion
