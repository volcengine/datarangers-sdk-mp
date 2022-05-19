// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from './base';

import Robot from '../../plugin/robot';
import Verify from '../../plugin/verify';
import Ab from '../../plugin/ab';
import Utm from '../../plugin/utm';
import Compensate from '../../plugin/compensate';
import Extend from '../plugin/extend';
import Auto from '../plugin/auto';

Sdk.usePlugin(Robot);
Sdk.usePlugin(Verify);
Sdk.usePlugin(Ab);
Sdk.usePlugin(Utm);
Sdk.usePlugin(Compensate);
Sdk.usePlugin(Extend);
Sdk.usePlugin(Auto);

export default Sdk;
