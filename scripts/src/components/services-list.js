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
      consts = require('../constants');

const Services = React.createClass({
  displayName: 'Organisation services',

  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    orgId: React.PropTypes.string,
    services: PropTypes.Immutable.OrderedMap,
    editService: PropTypes.func.isRequired,
    deleteService: PropTypes.func.isRequired
  },

  _edit: function (serviceId, readOnly) {
    return event => {
      if (event) { event.preventDefault(); }
      return this.props.editService(serviceId, readOnly);
    };
  },

  _delete: function (serviceId) {
    return event => {
      if (event) { event.preventDefault(); }
      return this.props.deleteService(serviceId);
    };
  },

  _getActions: function(isOrgAdmin, userId, service) {
    if (isOrgAdmin || (userId == service.created_by && service.state === consts.joinStates.approved)) {
      return (
        <div>
          <a href='#' onClick={this._edit(service.id, false)}>Edit</a>
          <a href='#' onClick={this._delete(service.id)}>Delete</a>
        </div>)
    } else {
      return (
        <div>
          <a href='#' onClick={this._edit(service.id, true)}>View</a>
        </div>
      )
    }
  },

  /**
   * Render a list of services
   *
   * @return {object}
   */
  render: function () {
    if (!this.props.services.size) { return null; }

    //Can edit a service if admin of org service belongs to, global admin, or if creator of service
    const isOrgAdmin = util.isAdmin(this.props.user.toJS(), this.props.orgId);
    const userId = this.props.user.get('id');

    return (
      <div className='crhu_datagrid'>
        <table className='services table'>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Service Location</th>
              <th>Service Type</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {_.map(this.props.services.toJS(),
              service => <tr key={service.name}>
                          <td>{service.name}</td>
                          <td>{service.location}</td>
                          <td>{_.capitalize(service.service_type)}</td>
                          <td>{_.capitalize(service.state)}</td>
                          <td>{this._getActions(isOrgAdmin, userId, service)}</td>
                         </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = Services;
