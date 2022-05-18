import Sdk from './plugin';
import log from '../adapter/swan/log';
import request from '../adapter/swan/request';
import storage from '../adapter/swan/storage';
import Device from '../adapter/swan/device';

Sdk.useAdapterLog(log);
Sdk.useAdapterRequest(request);
Sdk.useAdapterStorage(storage);
Sdk.usePlugin(Device);

export default Sdk;
