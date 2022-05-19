// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from './plugin';
import log from '../adapter/wx/log';
import request from '../adapter/wx/request';
import storage from '../adapter/wx/storage';
import Device from '../adapter/wx/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
