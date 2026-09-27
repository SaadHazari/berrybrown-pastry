/** sessionStorage flags that never throw (private mode, blocked site data). */
export function readFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function writeFlag(key: string): void {
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    /* storage blocked: the flag lasts until reload */
  }
}
