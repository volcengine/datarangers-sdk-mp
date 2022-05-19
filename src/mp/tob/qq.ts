// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from './plugin';
import log from '../adapter/qq/log';
import request from '../adapter/qq/request';
import storage from '../adapter/qq/storage';
import Device from '../adapter/qq/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
