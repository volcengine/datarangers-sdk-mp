export const now = () => +new Date();

export const timezone = (): { timezone: number; offset: number } => {
  try {
    const diff = new Date().getTimezoneOffset();
    return {
      timezone: Math.floor(Math.abs(diff) / 60),
      offset: diff * 60,
    };
  } catch (e) {
    return {
      timezone: 8,
      offset: -8 * 3600,
    };
  }
};
