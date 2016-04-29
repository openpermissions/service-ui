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
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      _ = require('lodash'),
      PropTypes = require('../prop-types'),
      util = require('../util'),
      actions = require('../actions'),
      consts = require('../constants');

const Secrets = React.createClass({
  displayName: 'Service client secrets',

  mixins: [PureRenderMixin],

  propTypes: {
    service: React.PropTypes.object.isRequired,
    readOnly: React.PropTypes.bool,
  },

  _delete: function (secret) {
    return event => {
      if (event) { event.preventDefault(); }
      return actions.deleteSecret.push({serviceId: this.props.service.get('id'), secret: secret});
    };
  },

  _deleteAll: function () {
    actions.deleteSecrets.push({serviceId: this.props.service.get('id')});
  },

  _addSecret: function() {
    actions.addSecret.push({serviceId: this.props.service.get('id')})
  },

  /**
   * Render a list of service client secrets
   *
   * @return {object}
   */
  render: function () {
    if (!this.props.service.has('secrets')) {
      return <div/>
    }
    return (
      <div>
        <h2>OAuth Credentials</h2>
        <div className='crhu_datagrid'>
         <table className='client id table'>
            <thead>
              <tr>
                <th>Client Id</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{this.props.service.get('id')}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <table className='client secrets table'>
            <thead>
              <tr>
                <th>Client Secrets</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {this.props.service.get('secrets').map(
                secret => <tr key={secret}>
                            <td>{secret}</td>
                            <td>{!this.props.readOnly && <a href='#' onClick={this._delete(secret)}>Delete</a>}</td>
                          </tr>
              )}
            </tbody>
          </table>
        </div>
        {!this.props.readOnly &&
        <div className='form-group'>
          <a className='btn btn-primary' onClick={this._addSecret}>New Secret</a>
          <a className='btn btn-primary' onClick={this._deleteAll}>Clear Secrets</a>
        </div>
        }
      </div>
    );
  }
});

module.exports = Secrets;
