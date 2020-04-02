import * as yup from 'yup';
import { Schema } from 'yup';

const DEFINITION_PREFIX = 'yup.';

/**
 * Transforms the given object into an object
 * containing yup schemas as values.
 *
 * @param {object} json
 * @param {object} instance An optional yup instance
 * @return {object} The original object with its values replaced by yup validators
 */
export function transformObject<T extends object, R extends {
  [P in keyof T]: Schema<any>
}>(json: T, instance = yup): R {
  return Object.entries(json).reduce(
    (obj, [key, value]) => ({ ...obj, [key]: transformAll(value, instance) }),
    {} as R,
  );
}

/**
 * Checks if the given value is an array which first value is a string
 * that starts with the definition prefix ("yup.").
 *
 * @param value
 */
const isYupCallDefinition = (value: any): boolean => (
  Array.isArray(value)
  && typeof value[0] === 'string'
  && value[0].startsWith(DEFINITION_PREFIX)
);

/**
 * Checks if the given value is an array of yup call definitions.
 * This just assumes that when the first element is one, the rest are as well.
 *
 * @param value
 */
const isYupSchemaDefinition = (value: any): boolean => (
  Array.isArray(value) && isYupCallDefinition(value[0])
);

/**
 * Transforms the given schema definition array into a yup schema.
 *
 * @param json
 * @param instance An optional yup instance
 */
export function transformAll(json: any[], instance = yup): Schema<any> {
  const wrapped = Array.isArray(json[0]) ? json : [json];

  if (!isYupSchemaDefinition(wrapped)) {
    return instance.mixed();
  }

  return wrapped.reduce((schema, value: [string]) => {
    const [name, ...args] = value;

    // Grab the real method name
    const method = name.substr(DEFINITION_PREFIX.length);

    // Call the method with transformed parameters
    return schema[method](...args.map((argument: any) => {
      if (Array.isArray(argument)) {
        return transformAll(argument, instance);
      }

      // Check if the given object is actually a plain object
      // This fixes problems with e.g. regex instances
      if (Object.prototype.toString.call(argument) === '[object Object]') {
        return transformObject(argument, instance);
      }

      return argument;
    }));
  }, instance);
}
