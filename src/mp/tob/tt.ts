import Sdk from './plugin';
import log from '../adapter/tt/log';
import request from '../adapter/tt/request';
import storage from '../adapter/tt/storage';
import Device from '../adapter/tt/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
