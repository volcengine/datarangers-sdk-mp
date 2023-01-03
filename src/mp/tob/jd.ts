// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from './plugin';
import log from '../adapter/jd/log';
import request from '../adapter/jd/request';
import storage from '../adapter/jd/storage';
import Device from '../adapter/jd/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
