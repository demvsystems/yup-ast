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
