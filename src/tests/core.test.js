import {
  describe,
  it,
  beforeEach,
  expect,
  beforeAll,
  afterEach,
  afterAll,
} from 'vitest';
import {
  calculateDiscount,
  canDrive,
  fetchData,
  getCoupons,
  isPriceInRange,
  isValidUsername,
  Stack,
  validateUserInput,
} from '../core';

// Example of Teories
// describe('test suite message', ()=> {
//   it('test case', ()=> {
//     const result = 'The margin is required'
//     //Loose (too general)
//     expect(result).toBeDefined();
//     //Tight (too specific)
//     expect(result).toBe('The margin is required');
//     // better assertion
//     expect(result).toMatch('is required');
//   })
// })

// describe('test suite array data', ()=> {
//   it('test case', ()=> {
//     const result = [2, 1, 3]
//     //Loose (too general)
//     expect(result).toBeDefined();
//     //Tight (too specific)
//     expect(result).toEqual([2, 1, 3]);
//     // better assertion
//     expect(result).toEqual(expect.arrayContaining([1, 3, 2]));
//   })
// })

// describe('test suite object data', ()=> {
//   it('test case', ()=> {
//     const result = {name: '20gogon', id: '002'}
//     //Loose (too general)
//     expect(result).toBeDefined();
//     //Tight (too specific)
//     // expect(result).toEqual({name: 'Gogo'});
//     // better assertion
//     // expect(result).toMatchObject({name: 'Gogo'})
//     expect(result).toHaveProperty('name');
//     expect(typeof result.name).toBe('string');
//   })
// })

describe('getCoupons', () => {
  it('should return an array with valid coupons data', () => {
    const coupons = getCoupons();
    expect(Array.isArray(coupons)).toBeTruthy();
    expect(coupons.length).toBeGreaterThan(0);
  });

  it('should return an array with valid coupon code', () => {
    const coupons = getCoupons();
    coupons.forEach((coupon) => {
      expect(coupon).toHaveProperty('code');
      expect(typeof coupon.code).toBe('string');
      expect(coupon.code).toBeTruthy();
    });
  });

  it('should return an array with valid coupon discount', () => {
    const coupons = getCoupons();
    coupons.forEach((coupon) => {
      expect(coupon).toHaveProperty('discount');
      expect(typeof coupon.discount).toBe('number');
      expect(coupon.discount).toBeGreaterThan(0);
      expect(coupon.discount).toBeLessThan(1);
    });
  });
});

describe('calculateDiscount', () => {
  it('should return discounted price if given valid price and discount code', () => {
    expect(calculateDiscount(10, 'SAVE10')).toBe(9);
    expect(calculateDiscount(10, 'SAVE20')).toBe(8);
  });

  it('should handle invalid price', () => {
    expect(calculateDiscount('10', 'SAVE10')).toMatch(/invalid/i);
  });

  it('should handle negative price', () => {
    expect(calculateDiscount(-10, 'SAVE10')).toMatch(/invalid/i);
  });

  it('should handle invalid discount code', () => {
    expect(calculateDiscount(10, 'INVALID')).toBe(10);
  });

  it('should handle non-string discount code', () => {
    expect(calculateDiscount(10, 10)).toMatch(/invalid/i);
  });
});

describe('validateUserInput', () => {
  it('should return a success if given valid input', () => {
    expect(validateUserInput('fulan', 27)).toMatch(/success/i);
  });

  it('should return an error if username is not a string', () => {
    expect(validateUserInput(27, 27)).toMatch(/invalid/i);
  });

  it('should return an error if username is less than 3', () => {
    expect(validateUserInput('fu', 27)).toMatch(/invalid/i);
  });

  it('should return an error if username is greater than 255', () => {
    expect(validateUserInput('fu'.repeat(255), 27)).toMatch(/invalid/i);
  });

  it('should return an error if age is not number', () => {
    expect(validateUserInput('fulan', 'fulan')).toMatch(/invalid/i);
  });

  it('should return an error if age is less than 18', () => {
    expect(validateUserInput('fulan', 17)).toMatch(/invalid/i);
  });

  it('should return an error if age is greater than 100', () => {
    expect(validateUserInput('fulan', 101)).toMatch(/invalid/i);
  });

  it('should return an error if given invalid username or age', () => {
    expect(validateUserInput('', 18)).toMatch(/invalid username/i);
    expect(validateUserInput('fulan', 0)).toMatch(/invalid age/i);
  });
});

describe('isPriceInRange', () => {
  it.each([
    { scenario: 'price < min', price: -1, result: false },
    { scenario: 'price = min', price: 0, result: true },
    { scenario: 'price between min and max', price: 50, result: true },
    { scenario: 'price = max', price: 100, result: true },
    { scenario: 'price > max', price: 200, result: false },
  ])('should return $result when $scenario', ({ price, result }) => {
    expect(isPriceInRange(price, 0, 100)).toBe(result);
  });
});

describe('isValidUsername', () => {
  const minLength = 5;
  const maxLength = 15;

  it('should return false if given username is too short', () => {
    expect(isValidUsername('a'.repeat(minLength - 1))).toBe(false);
  });

  it('should return false if given username is too long', () => {
    expect(isValidUsername('a'.repeat(maxLength + 5))).toBe(false);
  });

  it('should return true if given username at min or max length', () => {
    expect(isValidUsername('a'.repeat(minLength))).toBe(true);
    expect(isValidUsername('a'.repeat(maxLength))).toBe(true);
  });

  it('should return true if given username in min and max length', () => {
    expect(isValidUsername('a'.repeat(minLength + 1))).toBe(true);
  });

  it('should return false if given username invalid types', () => {
    expect(isValidUsername(null)).toBe(false);
    expect(isValidUsername(undefined)).toBe(false);
    expect(isValidUsername(5)).toBe(false);
  });
});

describe('canDrive', () => {
  it('should return invalid if given invalid country code', () => {
    expect(canDrive(18, 'ID')).toMatch(/invalid/i);
  });

  it.each([
    { age: 15, country: 'US', result: false },
    { age: 16, country: 'US', result: true },
    { age: 17, country: 'US', result: true },
    { age: 16, country: 'UK', result: false },
    { age: 17, country: 'UK', result: true },
    { age: 18, country: 'UK', result: true },
  ])('should return $result for $age, $country', ({ age, country, result }) => {
    expect(canDrive(age, country)).toBe(result);
  });
});

describe('fetchData', () => {
  it('should return a promise that will resolve to an array number', async () => {
    try {
      await fetchData();
    } catch (error) {
      expect(error).haveOwnProperty('reasons');
      expect(error.reasons).toMatch(/fail/i);
    }
  });
});

//setup teardown
describe('test suite', () => {
  beforeEach(() => {
    console.log('before each');
  });

  beforeAll(() => {
    console.log('before all');
  });

  it('should return test suite start', () => {});

  it('should return test suite end', () => {});

  afterEach(() => {
    console.log('after each');
  });

  afterAll(() => {
    console.log('after all');
  });
});

describe('Stack', () => {
  let stack;

  beforeEach(() => {
    console.log('before each stack');
    stack = new Stack();
  });

  it('push should add an item to the stack', () => {
    stack.push(1);
    expect(stack.size()).toBe(1);
  });

  it('pop should remove and return the top item from the stack', () => {
    stack.push(2);
    stack.push(4);

    const poppedItem = stack.pop();
    expect(poppedItem).toBe(4);
    expect(stack.size()).toBe(1);
  });

  it('pop should throw an error if the stack is empty', () => {
    expect(() => stack.pop()).toThrow(/empty/i);
  });

  it('peek should return the top item from the stack without removed item', () => {
    stack.push(2);
    stack.push(3);

    const peekedItem = stack.peek();
    expect(peekedItem).toBe(3);
    expect(stack.size()).toBe(2);
  });

  it('peek should throw an error if the stack is empty', () => {
    expect(() => stack.peek()).toThrow(/empty/i);
  });

  it('isEmpty should return true if the stack is empty', () => {
    expect(stack.isEmpty()).toBeTruthy();
  });

  it('isEmpty should return false if the stack is not empty', () => {
    stack.push(2);
    expect(stack.isEmpty()).toBeFalsy();
  });

  it('size should return length of the stack', () => {
    stack.push(2);
    stack.push(4);
    expect(stack.size()).toBe(2);
  });

  it('clear should remove all items from the stack', () => {
    stack.push(1);
    stack.push(3);
    stack.clear();
    expect(stack.isEmpty()).toBeTruthy();
  });
});
