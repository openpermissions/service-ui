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
 */
'use strict';

const React = require('react');

const Modal = React.createClass({
  componentDidMount: function() {
    window.addEventListener('keydown', this._onKeyDown, true);
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown, true);
  },

  _onKeyDown: function(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.props.onClose();
    }
  },

  render: function () {
    return (
      <div>
        <div className={'react-modal_overlay'} />
        <div className={'react-modal'} role='dialog' tabIndex={-1}>
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Modal;
