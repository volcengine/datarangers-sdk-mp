// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from './plugin';
import log from '../adapter/ks/log';
import request from '../adapter/ks/request';
import storage from '../adapter/ks/storage';
import Device from '../adapter/ks/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
