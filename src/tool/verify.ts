export const verifyCheck = (query: Record<string, any> = {}) => {
  if (query && query['start_rangers_data_check']) {
    return query['start_rangers_data_check'];
  }
  return '';
};
