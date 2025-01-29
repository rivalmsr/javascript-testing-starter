import { vi, describe, it, expect } from 'vitest';
import {
  getDiscount,
  getPriceInCurrency,
  getShippingInfo,
  isOnline,
  login,
  renderPage,
  signUp,
  submitOrder,
} from '../mocking';
import { getExchangeRate } from '../libs/currency';
import { getShippingQuote } from '../libs/shipping';
import { trackPageView } from '../libs/analytics';
import { charge } from '../libs/payment';
import { sendEmail } from '../libs/email';
import security from '../libs/security';

vi.mock('../libs/currency');
vi.mock('../libs/shipping');
vi.mock('../libs/analytics');
vi.mock('../libs/payment');
vi.mock('../libs/email', async (importOriginal) => {
  const emailFuncs = await importOriginal();
  return {
    ...emailFuncs,
    sendEmail: vi.fn(),
  };
});

describe('test suite', () => {
  it('test case', () => {
    const greet = vi.fn();
    greet.mockImplementation((name) => 'Hello ' + name);

    greet('Mosh');
    expect(greet).toBeCalledWith('Mosh');
  });
});

describe('sentMessage', () => {
  it('should return message ok if sent message successfuly', () => {
    const sendText = vi.fn();
    sendText.mockReturnValue('ok');

    const result = sendText('message');

    expect(sendText).toHaveBeenCalledWith('message');
    expect(result).toBe('ok');
  });
});

describe('getPriceInCurrency', () => {
  it('should return price in currency target', () => {
    vi.mocked(getExchangeRate).mockReturnValue(1.5);

    const price = getPriceInCurrency(10, 'AUD');
    expect(price).toBe(15);
  });
});

describe('getShippingInfo', () => {
  it('should return shipping unavailable if quote cannot be fetched', () => {
    vi.mocked(getShippingQuote).mockReturnValue(null);

    const result = getShippingInfo('bandung');

    expect(result).toMatch(/unavailable/i);
  });

  it('should return shipping info if quote can be fetched', () => {
    vi.mocked(getShippingQuote).mockReturnValue({
      cost: 14000,
      estimatedDays: 2,
    });

    const result = getShippingInfo('bandung');

    expect(result).toMatch(/cost/i);
    expect(result).toMatch(/days/i);
  });
});

describe('renderPage', () => {
  it('should render correct page', async () => {
    const result = await renderPage();

    expect(result).toMatch(/content/i);
  });

  it('should call analytics', async () => {
    await renderPage();

    expect(trackPageView).toBeCalledWith('/home');
  });
});

describe('submitOrder', () => {
  const order = { totalAmount: 20000 };
  const creditCard = { creditCardNumber: '12345678' };

  it('should call api charge', async () => {
    vi.mocked(charge).mockResolvedValue({ status: 'success' });
    await submitOrder(order, creditCard);

    expect(charge).toBeCalledWith(creditCard, order.totalAmount);
  });

  it('should return payment error if charge status failed', async () => {
    vi.mocked(charge).mockResolvedValue({ status: 'failed' });

    const result = await submitOrder(order, creditCard);

    expect(result.success).toBeFalsy();
  });

  it('should return payment succes if charge status success', async () => {
    vi.mocked(charge).mockResolvedValue({ status: 'success' });

    const result = await submitOrder(order, creditCard);

    expect(result.success).toBeTruthy();
  });
});

describe('signUp', () => {
  const email = 'mosh@gmail.com';

  it('should return false if the email is not valid', async () => {
    const result = await signUp('invalid_email');

    expect(result).toBeFalsy();
  });

  it('should return true if the email is valid', async () => {
    const result = await signUp(email);

    expect(result).toBeTruthy();
  });

  it('should send the welcome if email is valid', async () => {
    await signUp(email);

    expect(sendEmail).toHaveBeenCalledOnce();
    const [emailArg, messageArg] = vi.mocked(sendEmail).mock.calls[0];
    expect(emailArg).toBe(email);
    expect(messageArg).toMatch(/welcome/i);
  });
});

describe('login', () => {
  it('should send email to api', async () => {
    const email = 'mosh@gmail.com';
    const spy = vi.spyOn(security, 'generateCode');
    vi.mocked(sendEmail);
    await login(email);

    const securityCode = spy.mock.results[0].value.toString();
    expect(sendEmail).toHaveBeenCalledWith(email, securityCode);
  });
});

describe('isOnline', () => {
  it('should return false if current hour is outside opening hours', () => {
    vi.setSystemTime('2024-07-07 07:59');
    expect(isOnline()).toBeFalsy();

    vi.setSystemTime('2024-07-07 20:01');
  });

  it('should return true if current hour is within opening hours', () => {
    vi.setSystemTime('2024-07-07 08:00');
    expect(isOnline()).toBeTruthy();

    vi.setSystemTime('2024-07-07 19:59');
    expect(isOnline()).toBeTruthy();
  });
});

describe('getDiscount', () => {
  it('should return 0 discount on any others day', () => {
    vi.setSystemTime('2024-12-24 23:59');
    expect(getDiscount()).toBe(0);

    vi.setSystemTime('2024-12-26 00:01');
    expect(getDiscount()).toBe(0);
  });

  it('should return 0.2 discount on christmas day', () => {
    vi.setSystemTime('2024-12-25 00:01');
    expect(getDiscount()).toBe(0.2);

    vi.setSystemTime('2024-12-25 23:59');
    expect(getDiscount()).toBe(0.2);
  });
});
