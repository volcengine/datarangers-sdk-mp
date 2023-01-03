// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from './base';

import Apm from '../../plugin/apm';
// import Analyse from '../../plugin/analyse';
import Check from '../../plugin/check';
import Webid from '../../plugin/webid';
import Robot from '../../plugin/robot';
import Verify from '../../plugin/verify';
import Ab from '../../plugin/ab';
import Utm from '../../plugin/utm';
import Monitor from '../../plugin/monitor';
import Extend from '../plugin/extend';
import Auto from '../plugin/auto';
import Compensate from '../../plugin/compensate';
import Error from '../../plugin/error';

Sdk.usePlugin(Apm);
// Sdk.usePlugin(Analyse);
Sdk.usePlugin(Check);
Sdk.usePlugin(Webid);
Sdk.usePlugin(Robot);
Sdk.usePlugin(Verify);
Sdk.usePlugin(Ab);
Sdk.usePlugin(Utm);
Sdk.usePlugin(Monitor);
Sdk.usePlugin(Extend);
Sdk.usePlugin(Auto);
Sdk.usePlugin(Compensate);
Sdk.usePlugin(Error);

export default Sdk;
