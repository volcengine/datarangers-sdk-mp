// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
export const verifyCheck = (query: Record<string, any> = {}) => {
  if (query && query['start_rangers_data_check']) {
    return query['start_rangers_data_check'];
  }
  return '';
};
