const UAE_MOBILE = /^(?:\+?971|00971|0)?5\d{8}$/;

export const normalisePhone = (p: string) => p.replace(/[\s()-]/g, '');
export const isValidPhone = (p: string) => UAE_MOBILE.test(normalisePhone(p));
export const isValidEmail = (e: string) => e === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
