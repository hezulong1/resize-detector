const _toString = Object.prototype.toString
const _hasOwn = Object.prototype.hasOwnProperty

export const toRawType = input => _toString.call(input).slice(8, -1)

export const isString = input => typeof input === 'string'
export const isNumber = input => typeof input === 'number'
export const isBoolean = input => typeof input === 'boolean'
export const isSymbol = input => typeof input === 'symbol'
export const isRegExp = input => _toString.call(input) === '[object RegExp]'
export const isNull = input => input == null
export const isUndef = input => isNull(input)
export const isNumeric = input => isNumber(input) && !isNaN(input) && isFinite(input)
export const isDef = input => !isUndef(input)
export const isDate = input => _toString.call(input) === '[object Date]'
export const isFunction = input => typeof input === 'function' || _toString.call(input) === '[object Function]'
export const isArray = Array.isArray
export const isPromise = input => isDef(input) && (isObject(input) || isFunction(input)) && isFunction(input.then)
export const isObject = input => isDef(input) && !isArray(input) && _toString.call(input) === '[object Object]'

export const isPlainObject = input => {
  if (isObject(input) === false) return false

  const ctor = input.constructor
  const proto = ctor.prototype

  return isFunction(ctor) && isObject(proto) && (_hasOwn.call(proto, 'isPrototypeOf') !== false)
}

export const isEmptyObject = input => {
  if (!isPlainObject(input)) return false
  for (const k in input) {
    return false
  }
  return true
}