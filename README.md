# yup-ast

[![Latest Stable Version](https://img.shields.io/npm/v/@demvsystems/yup-ast.svg)](https://www.npmjs.com/package/@demvsystems/yup-ast)
[![Build Status](https://img.shields.io/travis/demvsystems/yup-ast/master.svg)](https://travis-ci.org/demvsystems/yup-ast)
[![NPM Downloads](https://img.shields.io/npm/dm/@demvsystems/yup-ast.svg)](https://www.npmjs.com/package/@demvsystems/yup-ast)
[![dependencies Status](https://david-dm.org/demvsystems/yup-ast/status.svg)](https://david-dm.org/demvsystems/yup-ast)
[![Test Coverage](https://img.shields.io/codecov/c/github/demvsystems/yup-ast/master.svg)](https://codecov.io/github/demvsystems/yup-ast?branch=master)

> Generates [yup](https://github.com/jquense/yup) instances from JSON schemas.

This project is meant to be a successor to the original [yup-ast](https://github.com/WASD-Team/yup-ast)
which - due to licensing issues - can no longer be actively maintained.
Due to time contraints, only the core functionality has been ported so far.
Feel free to add any potential improvements or missing APIs from the original via PRs!

## Installation
    npm install --save @demvsystems/yup-ast

## Usage

### ES5
    var transformAll = require('@demvsystems/yup-ast').transformAll;

### ES2015+
    import { transformAll } from '@demvsystems/yup-ast';

### Transforming JSON to a schema instance
The JSON representation of a yup schema is an array with each call being an array again.
The method calls start with "yup.". Each parameter is an additional array entry afterwards.

Example: To create a schema like the following:
```ts
const schema = yup.array()
  .required()
  .min(2)
  .of(
    yup.object()
      .required()
      .shape({
        foo: yup.string().required(),
      })
  );
```

you call `transformAll` like this:
```ts
const schema = transformAll([
  ['yup.array'],
  ['yup.required'],
  ['yup.min', 2],
  ['yup.of', [
    ['yup.object'],
    ['yup.required'],
    ['yup.shape', {
      foo: [['yup.string'], ['yup.required']],
    }],
  ]],
]);
```

Both can be validated the same way:
```ts
schema.isValidSync([
  { foo: 'bar' },
  { foo: 'baz' },
]); // => true
```

For more example use cases, have a look at [the included test cases](./src/__tests__/test.test.ts).

## Changelog
Please look at [the releases](https://github.com/demvsystems/yup-ast/releases) for more information on what has changed recently.

## Credits
- [spaceemotion](https://github.com/spaceemotion)
- [All Contributors](https://github.com/demvsystems/yup-ast/contributors)

## License
The ISC License (ISC). Please see [License File](LICENSE.md) for more information.
