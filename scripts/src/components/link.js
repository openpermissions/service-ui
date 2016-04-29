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
 * A Link component that wraps around React.DOM.a to use the router to
 * navigate to an address
 */
'use strict';

const React = require('react'),
      actions = require('../actions');

function isLeftClick(event) {
  return event.button === 0;
}

function isModifiedClick(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

var Link = React.createClass({
  displayName: 'Link',
  propTypes: {
    href: React.PropTypes.string.isRequired
  },

  /**
   * Use the router to navigate to this.props.href instead of letting the
   * browser do it.
   */
  _onClick: function (event) {
    if (!isLeftClick(event) || isModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    actions.navigate.push(this.props.href);
  },

  render: function () {
    return (<a role="menuitem" {...this.props} onClick={this.props.onClick} />);
  }
});

module.exports = Link;
