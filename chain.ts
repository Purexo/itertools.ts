import {
  cycle, map, filter, tap, enumerate,
  take, drop, takeWhile, dropWhile,
  flat, flatMap, iterator, concat,
  first, find, some, every, reduce,
  forEach, join,
} from "./itertools";

class Chain<I, O> {
  constructor(private __value: I | any | O) {
  }
  
  get value(): O {
    return this.__value as O;
  }
  
  unwrap() {
    return this.__value as O;
  }
}

const ITERABLE_CONSUMERS = [
  cycle, map, filter, tap, enumerate,
  take, drop, takeWhile, dropWhile,
  flat, flatMap, iterator, concat,
  first, find, some, every, reduce,
  forEach, join,
];

forEach(ITERABLE_CONSUMERS, fn => {
  Chain.prototype[fn.name] = function (...args) {
    args.unshift(this.__value);
    this.__value = fn.apply(null, args);
    return this;
  }
})

export default function chain(value) {
  return new Chain(value);
}
