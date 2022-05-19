// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from './plugin';
import log from '../adapter/common/log';
import request from '../adapter/common/request';
import storage from '../adapter/common/storage';
import Device from '../adapter/common/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
