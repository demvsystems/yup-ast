import * as yup from 'yup';
import { transformAll, transformObject } from '..';

describe('it correctly parses JSON as yup schema', () => {
  describe('transformAll', () => {
    it('handles empty values', () => {
      expect(transformAll([]).isValidSync(null)).toEqual(true);
      expect(transformAll([]).isValidSync([])).toEqual(true);
      expect(transformAll([]).isValidSync({})).toEqual(true);
    });

    it('handles basic arrays', () => {
      const schema = transformAll([
        ['yup.object'],
        ['yup.required'],
      ]);

      expect(schema.isValidSync(null)).toEqual(false);
      expect(schema.isValidSync([])).toEqual(false);
      expect(schema.isValidSync({})).toEqual(true);
    });

    it('handles complex objects', () => {
      const schema = transformAll([
        ['yup.object'],
        [
          'yup.shape',
          {
            foo: [['yup.number'], ['yup.required'], ['yup.max', 42]],
            bar: [['yup.string'], ['yup.required'], ['yup.min', 1], ['yup.max', 16], ['yup.matches', /[a-z]/i]],
            baz: [
              ['yup.object'],
              ['yup.shape', {
                test: [['yup.number'], ['yup.required'], ['yup.min', 5], ['yup.max', 10]],
              }],
              ['yup.required'],
            ],
          },
        ],
        ['yup.required'],
      ]);

      expect(schema.isValidSync({})).toEqual(false);

      expect(schema.isValidSync({
        foo: 42,
        bar: 'coffee',
        baz: {
          test: 8,
        },
      })).toEqual(true);
    });

    it('handles arrays of objects', () => {
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

      expect(schema.isValidSync([
        { foo: 'bar' },
        { foo: 'baz' },
      ])).toEqual(true);
    });

    it('handles promise-based validation', () => {
      const schema = transformAll([
        ['yup.string'],
        ['yup.required', 'provide some text'],
        ['yup.min', 3],
      ]);

      expect(schema.validate(''))
        .rejects
        .toHaveProperty('message', 'provide some text');
    });

    it('handles when() properly', () => {
      const schema = transformAll([['yup.object', {
        foo: [['yup.number'], ['yup.when', 'bar', {
          is: '1',
          then: [['yup.number'], ['yup.min', 2500], ['yup.required']],
          otherwise: [['yup.number'], ['yup.nullable']],
        }]],
        bar: [['yup.mixed'], ['yup.oneOf', ['1', '6', '7']], ['yup.required']],
      }]]);

      expect(schema.isValidSync({
        foo: '1',
        bar: 512,
      })).toEqual(false);
    });
  });

  it('does not transform non-schema arrays', () => {
    const schema = transformAll([
      ['yup.string'],
      ['yup.required'],
      ['yup.oneOf', ['yes', 'no']],
    ]);

    expect(schema.isValidSync('yes')).toEqual(true);
    expect(schema.isValidSync('no')).toEqual(true);
    expect(schema.isValidSync('foo')).toEqual(false);
  });

  it('handles arrays of schemas as arguments (issue #2)', () => {
    function allLessThan(max: number, refs: any[], msg?: string) {
      return this.test({
        test(val) {
          let value = val;

          refs.forEach((ref) => {
            const number = this.resolve(ref);
            expect(number).toEqual(expect.any(Number));
            value += number;
          });

          return value < max;
        },
        message: msg || `All values must be less than ${max}`,
      });
    }

    yup.addMethod(yup.number, 'allLessThan', allLessThan);

    const schema = transformAll([['yup.object', {
      foo: [['yup.number'], ['yup.allLessThan', 10, [[['yup.ref', 'baz']], [['yup.ref', 'bar']]]]],
      bar: [['yup.number'], ['yup.required']],
      baz: [['yup.number'], ['yup.required']],
    }]]);

    expect(schema.isValidSync({
      foo: 1,
      bar: 1,
      baz: 1,
    })).toEqual(true);
  });

  describe('transformObject', () => {
    it('transforms an empty object', () => {
      const obj = transformObject({});

      expect(obj).toEqual({});
    });

    it('transforms the values of an object', () => {
      const obj = transformObject({
        test: [['yup.object']],
      });

      Object.values(obj).forEach((schema) => {
        expect(schema.isValidSync(42)).toEqual(false);
        expect(schema.isValidSync('Foo')).toEqual(false);
        expect(schema.isValidSync(true)).toEqual(false);
        expect(schema.isValidSync({})).toEqual(true);
      });
    });
  });
});
