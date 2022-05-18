export function hashCode(str: string): number {
  str += '';
  let h = 0;
  let off = 0;
  const len = str.length;

  for (let i = 0; i < len; i++) {
    h = 31 * h + str.charCodeAt(off++);
    if (h > 0x7fffffffffff || h < -0x800000000000) {
      h &= 0xffffffffffff;
    }
  }
  if (h < 0) {
    h += 0x7ffffffffffff;
  }
  return h;
}
