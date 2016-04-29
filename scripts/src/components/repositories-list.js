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

const Repositories = React.createClass({
  displayName: 'Organisation repositories',

  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    orgId: React.PropTypes.string,
    repositories: PropTypes.Immutable.OrderedMap,
    editRepository: PropTypes.func.isRequired,
    orgIndexById: PropTypes.object
  },

  _edit: function (repositoryId) {
    return event => {
      if (event) { event.preventDefault(); }
      return this.props.editRepository(repositoryId);
    };
  },

  /**
   * Render a list of repositories
   *
   * @return {object}
   */
  render: function () {
    if (!this.props.repositories.size) { return null; }

    //Can edit a repository if admin of org repository belongs to, global admin, or if creator of repository
    const isOrgAdmin = util.isAdmin(this.props.user.toJS(), this.props.orgId);
    const userId = this.props.user.get('id');

    return (
      <div className='crhu_datagrid'>
        <table className='repositories table'>
          <thead>
            <tr>
              <th>Repository Name</th>
              <th>Repository ID</th>
              <th>Service Name</th>
              <th>Service Organisation</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {_.map(this.props.repositories.toJS(),
              repository => <tr key={repository.name}>
                          <td>{repository.name}</td>
                          <td>{repository.id}</td>
                          <td>{repository.service.name}</td>
                          <td>{this.props.orgIndexById[repository.service.organisation_id].name}</td>
                          <td>{_.capitalize(repository.state)}</td>
                          <td>{(isOrgAdmin || (userId == repository.created_by && repository.state === consts.joinStates.approved)) &&
                              <div><a href='#' onClick={this._edit(repository.id)}>Edit</a></div>}</td>
                         </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = Repositories;
