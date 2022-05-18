export const safeDecodeURIComponent = (text: string): string => {
  let res = text;
  try {
    res = decodeURIComponent(text);
  } catch (e) {}
  return res;
};

export const serializeUrl = (
  path: string,
  query: Record<string, string | number>,
): string => {
  let url = path;
  if (query) {
    const qs = [];
    Object.keys(query).forEach((key) => {
      qs.push(`${key}=${query[key]}`);
    });
    if (qs.length > 0) {
      url += `?${qs.join('&')}`;
    }
  }
  return url;
};

export const unserializeUrl = (url: string): Record<string, string> => {
  const qs = {};
  if (url) {
    url.split('&').forEach((each) => {
      if (each) {
        const kv = each.split('=');
        if (kv[0]) {
          qs[kv[0]] = kv[1] || '';
        }
      }
    });
  }
  return qs;
};
