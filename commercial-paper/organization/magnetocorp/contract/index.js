/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const bookstorecontract = require('./lib/bookstorecontract.js');
const cpcontract = require('./lib/papercontract.js');
module.exports.contracts = [bookstorecontract, cpcontract];
