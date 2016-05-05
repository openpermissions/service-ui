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
      _ = require('lodash'),
      util = require('../util'),
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      messages = require('../messages'),
      consts = require('../constants');

const Requests = React.createClass({
  displayName: 'Requests',

  propTypes: {
    title: PropTypes.string,
    requests: PropTypes.Immutable.List.isRequired,
    removeFunc: PropTypes.func.isRequired,
    headers: PropTypes.array.isRequired,
    organisations: PropTypes.object,
    services: PropTypes.object,
    repositories: PropTypes.object
  },

  _remove: function(org, e) {
    e.preventDefault();
    this.props.removeFunc(org);
  },

  render: function () {
    if (this.props.requests.size) {
      return (
        <div>
          <h2>{this.props.title}</h2>
          <table className={'requests table'}>
            <thead>
              <tr>
              {
                _.map(this.props.headers, header => {
                  return(
                    <th key={header}>{header}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
            {_.map(this.props.requests.toJS(), request => {
              return(
                <tr key={request['id']}>
                  <td>{request['name']}</td>
                  <td>
                    <a href='#' onClick={this._remove.bind(this, request)}>
                      {messages.requests.actions.remove}
                    </a>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      );
    } else { return null; }
  }
});

const MyRequestsList = React.createClass({
  displayName: messages.labels.myReqs,

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    organisations: PropTypes.Immutable.List.isRequired,
    services: PropTypes.Immutable.List.isRequired
  },

  getOrganisationsForIds: function(orgIds) {
    return this.props.organisations.filter(function(org) {
      return orgIds.indexOf(org.get('id')) != -1;
    });
  },

  _deleteUserOrgJoin: function (org) {
    actions.leaveOrganisation.push({
      userId: this.props.user.get('id'),
      orgId: org['id']
    });
  },

  _deleteRequest: function(obj) {
    const {type, req} = obj;
    if (type === 'organisation') {
      actions.deleteOrganisation.push(req);
    } else if (type === 'service') {
      actions.deleteService.push(req);
    }
  },

  _deleteOrg: function (org) {
    actions.deleteOrganisation.push({
      organisationId: org['id']
    });
  },

  _deleteServiceReq: function(srv) {
    actions.deleteService.push({
      serviceId: srv.id
    });
  },

  _deleteRepositoryReq: function(rep) {
    actions.deleteRepository.push({
      repositoryId: rep.id
    });
  },

  getPending(obj) {
    return obj.filter(
      item => item.get('state') === consts.states.pending &&
              item.get('created_by') === this.props.user.get('id')
    );
  },

  getPendingRequests: function() {
    const reqs = {};

    // Get pending requests for joining organisations
    const pendingJoinOrgIds = util.getOrganisationIdsByState(
      this.props.user.toJS(), consts.states.pending
    );
    reqs['pendingJoinOrgs'] = this.getOrganisationsForIds(pendingJoinOrgIds);

    // Get pending requests for creation of organisations & services
    reqs['pendingOrganisations'] = this.getPending(this.props.organisations);
    reqs['pendingServices'] = this.getPending(this.props.services);
    reqs['pendingRepositories'] = this.getPending(this.props.repositories);

    return reqs;
  },

  render: function () {
    const pendingRequests = this.getPendingRequests();
    let totalPending = 0;

    for (const reqType in pendingRequests) {
      totalPending += pendingRequests[reqType].size;
    }

    return (
      <div className={'container'}>
        <h1>{messages.requests.pending.title}</h1>

        <Requests
          title = {messages.requests.pending.org.join}
          requests = {pendingRequests.pendingJoinOrgs}
          removeFunc = {this._deleteUserOrgJoin}
          headers = {messages.requests.pending.org.headers} />

        <div className={'m-t-60'}></div>

        <Requests
          title = {messages.requests.pending.org.create}
          requests = {pendingRequests.pendingOrganisations}
          removeFunc = {this._deleteOrg}
          headers = {messages.requests.pending.org.headers} />

        <Requests
          title = {messages.requests.pending.srv.create}
          requests = {pendingRequests.pendingServices}
          removeFunc = {this._deleteServiceReq}
          headers = {messages.requests.pending.srv.headers} />

        <Requests
          title = {messages.requests.pending.rep.create}
          requests = {pendingRequests.pendingRepositories}
          removeFunc = {this._deleteRepositoryReq}
          headers = {messages.requests.pending.rep.headers} />

        {!totalPending && <p>{messages.requests.pending.none}</p> }
      </div>

    );
  }
});



module.exports = MyRequestsList;
