/**
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

var fs = require('fs');
var path = require('path');

var code = fs.readFileSync('combine.js', 'utf-8');
// console.log(code.length);

var i = 0;
var l = code.length;
var modules = [];

while (i < l) {
    var s = code.indexOf('define(\'', i);
    if (s === -1) {
        break;
    }
    var e = code.indexOf(']', s);
    if (e === -1) {
        break;
    }

    var p1 = code.substr(s, e - s + 1).replace(/\r?\n/g, '');
    var s1 = p1.indexOf('\'');
    var s2 = p1.indexOf('\'', s1 + 1);
    var name = p1.substr(s1 + 1, s2 - s1 - 1);
    var p2 = ', function() { return {name: \'' + name + '\'};});';
    modules.push((p1 + p2).replace(/\s/g, ''));

    i = e;
}

console.log(modules.join('\n'));











/* vim: set ts=4 sw=4 sts=4 tw=120: */
