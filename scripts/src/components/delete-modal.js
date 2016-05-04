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

const React = require('react'),
      Modal = require('./modal');

const DeleteModal = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    onClose: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired
  },

  render: function () {
    const heading = this.props.type.charAt(0).toUpperCase() + this.props.type.substr(1).toLowerCase();
    /* jshint ignore:start */
    return (
      <Modal onClose={this.props.onClose} key='delete-modal'>
        <div id='crhu_form_section'>
          <h1>Deactivate {heading}</h1>
          <p className={'sub-heading'}>Are you sure you want to deactivate this {this.props.type}?</p>

          <div className={'form-group'}>
            <button
              className={'btn btn-danger'}
              onClick={this.props.onDelete}
              autoFocus={true}>
                Deactivate
            </button>
            <button className={'btn btn-default'}
              id='crhu_button_cancel'
              onClick={this.props.onClose}>
                Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
    /* jshint ignore:end */
  }
});

module.exports = DeleteModal;
