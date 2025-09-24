import { conditionalStyle, cva, mergeStyles } from './cva';

describe('React Native CVA', () => {
  describe('cva function', () => {
    it('should return base styles when no variants are provided', () => {
      const baseStyle = { backgroundColor: 'red', padding: 10 };
      const variant = cva(baseStyle);

      const result = variant();
      expect(result).toEqual([baseStyle]);
    });

    it('should apply variant styles correctly', () => {
      const baseStyle = { padding: 10 };
      const variant = cva(baseStyle, {
        variants: {
          size: {
            small: { width: 20, height: 20 },
            large: { width: 40, height: 40 },
          },
          color: {
            red: { backgroundColor: 'red' },
            blue: { backgroundColor: 'blue' },
          },
        },
      });

      const result = variant({ size: 'small', color: 'red' });
      expect(result).toEqual([baseStyle, { width: 20, height: 20 }, { backgroundColor: 'red' }]);
    });

    it('should apply default variants', () => {
      const variant = cva(
        {},
        {
          variants: {
            size: {
              small: { width: 20 },
              large: { width: 40 },
            },
          },
          defaultVariants: {
            size: 'small',
          },
        },
      );

      const result = variant();
      expect(result).toEqual([{}, { width: 20 }]);
    });

    it('should apply compound variants when conditions match', () => {
      const variant = cva(
        {},
        {
          variants: {
            size: {
              small: { width: 20 },
              large: { width: 40 },
            },
            color: {
              red: { backgroundColor: 'red' },
            },
          },
          compoundVariants: [
            {
              size: 'small',
              color: 'red',
              style: { borderWidth: 2 },
            },
          ],
        },
      );

      const result = variant({ size: 'small', color: 'red' });
      expect(result).toContainEqual({ borderWidth: 2 });
    });
  });

  describe('mergeStyles function', () => {
    it('should merge multiple style objects', () => {
      const style1 = { backgroundColor: 'red', padding: 10 };
      const style2 = { margin: 5, padding: 20 }; // padding should override

      const result = mergeStyles(style1, style2);
      expect(result).toEqual({
        backgroundColor: 'red',
        margin: 5,
        padding: 20,
      });
    });

    it('should handle style arrays', () => {
      const styles = [{ backgroundColor: 'red' }, { padding: 10 }];

      const result = mergeStyles(styles, { margin: 5 });
      expect(result).toEqual({
        backgroundColor: 'red',
        padding: 10,
        margin: 5,
      });
    });
  });

  describe('conditionalStyle function', () => {
    it('should return true style when condition is true', () => {
      const trueStyle = { backgroundColor: 'green' };
      const falseStyle = { backgroundColor: 'red' };

      const result = conditionalStyle(true, trueStyle, falseStyle);
      expect(result).toEqual(trueStyle);
    });

    it('should return false style when condition is false', () => {
      const trueStyle = { backgroundColor: 'green' };
      const falseStyle = { backgroundColor: 'red' };

      const result = conditionalStyle(false, trueStyle, falseStyle);
      expect(result).toEqual(falseStyle);
    });
  });
});
