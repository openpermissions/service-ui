/**
 * Copyright 2016 Open Permissions Platform Coalition
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Adds Immutable validators to React PropTypes
 */
'use strict';

var React = require('react'),
    Immutable = require('immutable');

module.exports = React.PropTypes;

function propType(type, validator) {
  var validatePropType = function (props, propName, componentName) {
    if (!validator(props[propName])) {
      return new Error('Invalid prop `' + propName +
                       '` supplied to `' +  componentName +
                       '`, expected Immutable `' + type + '`.');
    }
  };

  validatePropType.isRequired = function (props, propName, componentName) {
    if (props[propName] === null) {
      return new Error('Required prop `' + propName +
                       '` was not specified in `' +  componentName + '`');
    }
    return validatePropType(props, propName, componentName);
  };

  return validatePropType;
}

React.PropTypes.Immutable = {
  Map: propType('Map', Immutable.Map.isMap),
  OrderedMap: propType('OrderedMap', Immutable.OrderedMap.isOrderedMap),
  List: propType('List', Immutable.List.isList),
};
