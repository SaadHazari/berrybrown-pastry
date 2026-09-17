import type { CartLine } from '../store/cartReducer';
import type { Customer } from './order';
import { isValidEmail, isValidPhone } from './validation';

export type Fulfilment = 'delivery' | 'pickup';

export type CheckoutForm = {
  fulfilment: Fulfilment;
  zoneId: string;
  date: string;
  slotId: string;
  customer: Customer;
  payment: 'online' | 'whatsapp';
};

export const EMPTY_FORM: CheckoutForm = {
  fulfilment: 'delivery',
  zoneId: '',
  date: '',
  slotId: '',
  customer: { name: '', phone: '', email: '', address: '', notes: '' },
  payment: 'online',
};

const FORM_KEY = 'bb-checkout-form';
const PENDING_KEY = 'bb-pending-order';

export type PendingOrder = { ref: string; form: CheckoutForm; lines: CartLine[] };

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const loadForm = (): CheckoutForm => {
  const f = read<CheckoutForm>(FORM_KEY);
  return f ? { ...EMPTY_FORM, ...f, customer: { ...EMPTY_FORM.customer, ...f.customer } } : EMPTY_FORM;
};
export const saveForm = (f: CheckoutForm) => write(FORM_KEY, f);
export const loadPending = () => read<PendingOrder>(PENDING_KEY);
export const savePending = (p: PendingOrder | null) => write(PENDING_KEY, p);

export { isValidEmail, isValidPhone, normalisePhone } from './validation';

export type StepErrors = Partial<Record<'zoneId' | 'date' | 'slotId' | 'name' | 'phone' | 'email' | 'address', string>>;

export function validateWhen(f: CheckoutForm, earliest: string): StepErrors {
  const e: StepErrors = {};
  if (f.fulfilment === 'delivery' && !f.zoneId) e.zoneId = 'Choose your area';
  if (!f.date) e.date = 'Pick a day';
  else if (f.date < earliest) e.date = 'We need a little more notice for this day';
  if (!f.slotId) e.slotId = 'Pick a time';
  return e;
}

export function validateDetails(f: CheckoutForm): StepErrors {
  const e: StepErrors = {};
  if (f.customer.name.trim().length < 2) e.name = 'Your name please';
  if (!isValidPhone(f.customer.phone)) e.phone = 'A UAE mobile, like 050 123 4567';
  if (!isValidEmail(f.customer.email.trim())) e.email = 'That email looks off';
  if (f.fulfilment === 'delivery' && f.customer.address.trim().length < 6) e.address = 'Building, flat and area';
  return e;
}
