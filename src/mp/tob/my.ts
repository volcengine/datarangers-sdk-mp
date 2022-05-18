import Sdk from './plugin';
import log from '../adapter/my/log';
import request from '../adapter/my/request';
import storage from '../adapter/my/storage';
import Device from '../adapter/my/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
