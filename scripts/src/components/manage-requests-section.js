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
      ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
      _ = require('lodash'),
      Immutable = require('immutable'),
      util = require('../util'),
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      Modal = require('./modal'),
      OrgFilter = require('./filters').OrgFilter,
      UserForm = require('./user-form.js'),
      OrganisationForm = require('./organisation-form'),
      ServiceForm = require('./service-form'),
      RepositoryForm = require('./repository-form'),
      messages = require('../messages'),
      consts = require('../constants');

const Requests = React.createClass({
  displayName: 'Requests',

  propTypes: {
    requests: PropTypes.array.isRequired,
    rejectFunc: PropTypes.func.isRequired,
    approveFunc: PropTypes.func.isRequired,
    showDetailsFunc: PropTypes.func.isRequired,
    requestType: PropTypes.string,
    headers: PropTypes.array.isRequired,
    organisations: PropTypes.object,
    services: PropTypes.object,
    repositories: PropTypes.object
  },

  _showDetails: function(request) {
    this.props.showDetailsFunc(request);
  },

  _approve: function(request) {
    this.props.approveFunc(request);
  },

  _reject: function(request) {
    this.props.rejectFunc(request);
  },

  render: function () {
    if (this.props.requests.length > 0) {
      const items = _.map(this.props.requests, request => {
        const userName = request.user.get('first_name') + ' ' + request.user.get('last_name');
        const name = request.entity.get('name');
        const text = `${userName} would like to ${this.props.requestType} ${name}`;

        return (
          <tr key={request.user.get('id') + request.entity.get('id')}>
            <td>{text} </td>
            <td>
              <a href='#' onClick={this._approve.bind(this, request)}>{messages.requests.actions.approve}</a>
              <a href='#' onClick={this._reject.bind(this, request)}>{messages.requests.actions.reject}</a>
              <a href='#' onClick={this._showDetails.bind(this, request)}>{messages.requests.actions.details}</a></td>
          </tr>
        );
      });

      return (
        <table className={'requests table'}>
          <thead>
            <tr>
              <th>{this.props.headers[0]}</th>
              <th>{this.props.headers[1]}</th>
            </tr>
          </thead>
          <tbody>{items}</tbody>
        </table>
      );
    }
    else {
      return null;
    }
  }
});

const ManageRequestsSection = React.createClass({
  displayName: 'Manage Requests Section',

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    organisations: PropTypes.Immutable.List.isRequired,
    services: PropTypes.Immutable.List.isRequired,
    users: PropTypes.Immutable.List.isRequired
  },

  componentWillMount: function () {
    actions.getUsers.push();
    actions.getOrganisations.push();
  },

  getInitialState: function () {
    return {
      showUser: undefined,
      showOrg: undefined,
      showSrv: undefined,
      showRep: undefined,
      filterOrg:'all'
    };
  },

  /**
   * set the user that should be displayed
   */
  _showJoinDetails: function(request) {
    this.setState({showUser: request.user});
  },

  /**
   * set the user that should be displayed
   */
  _showCreateOrgDetails: function(request) {
    this.setState({showOrg: request.entity});
  },

  _showCreateSrvDetails: function(request) {
    this.setState({showSrv: request.entity});
  },

  _showCreateRepDetails: function(request) {
    this.setState({showRep: request.entity});
  },

  /**
   * Change filterOrg state
   */
  _changeFilterOrg: function(orgName) {
    this.setState({filterOrg: orgName});
  },

  /**
  /**
   * Change internal showUser and showOrg state to undefined
   */
  _closeModal: function(event) {
    if (event) { event.preventDefault(); }
    this.setState(this.getInitialState());
  },

  _rejectJoinRequest: function (request) {
    actions.updateJoinOrganisation.push({
      'organisationId': request.entity.get('id'),
      'userId': request.user.get('id'),
      'state': consts.states.rejected
    });
  },

  _approveJoinRequest: function (request) {
    actions.updateJoinOrganisation.push({
      'organisationId': request.entity.get('id'),
      'userId': request.user.get('id'),
      'state': consts.states.approved
    });
  },

  _approveCreateOrgRequest: function(request) {
    actions.updateOrganisation.push({
      'organisationId': request.entity.get('id'),
      'state': consts.states.approved
    });
  },

  _rejectCreateOrgRequest: function(request) {
    actions.updateOrganisation.push({
      'organisationId': request.entity.get('id'),
      'state': consts.states.rejected
    });
  },

  _approveCreateSrvRequest: function(request) {
    actions.updateService.push({
      'name': request.entity.get('name'),
      'state': consts.states.approved,
      'location': request.entity.get('location'),
      'serviceType': request.entity.get('service_type'),
      'serviceId': request.entity.get('id')
    });
  },

  _rejectCreateSrvRequest: function(request) {
    actions.updateService.push({
      'name': request.entity.get('name'),
      'state': consts.states.rejected,
      'location': request.entity.get('location'),
      'serviceType': request.entity.get('service_type'),
      'serviceId': request.entity.get('id')
    });
  },

  _approveCreateRepRequest: function(request) {
    actions.updateRepository.push({
      'name': request.entity.get('name'),
      'state': consts.states.approved,
      'repositoryId': request.entity.get('id')
    });
  },

  _rejectCreateRepRequest: function(request) {
    actions.updateRepository.push({
      'name': request.entity.get('name'),
      'state': consts.states.rejected,
      'repositoryId': request.entity.get('id')
    });
  },

  /**
   * Get the organisations for which the user is admin. If global admin, return all organisations
   */
  _getAdminnedOrganisations: function() {
    const orgIds = util.getOrganisationIdsByRole(this.props.user.toJS(), consts.roles.admin);

    if (orgIds.indexOf(consts.globalRole) !== -1) {
      return this.props.organisations.filter(
        org => org.get('state') === consts.states.approved
      );
    }
    return this.props.organisations.filter(
      org => orgIds.indexOf(org.get('id')) !== -1
    );
  },

  _getPendingJoinRequests: function(filterOrg, adminnedOrganisations) {
    const adminOrgIds = adminnedOrganisations.map(org => org.get('id')),
          users = this.props.users,
          self = this;

    let requests = [];
    //If still waiting on users or organisations, just return for now
    if (this.props.users.size == 0 || this.props.organisations.size == 0) {
      return requests;
    }
    if (filterOrg === 'all') {
      requests = users
        .map(user => {
          const userOrgs = user.get('organisations').toJS();
          return Object.keys(userOrgs)
            .map( orgId => {
              const organisation = self._getOrgById(orgId);
              if (userOrgs[orgId].state === consts.states.pending && adminOrgIds.indexOf(orgId)>-1) {
                return {'user': user, 'entity': organisation};
              }
            })
            .filter(value => value != undefined);
        })
        .reduce((a, b) => a.concat(b));
    } else {
      const organisation = this._getOrgById(filterOrg);
      requests = users
        .map( user => {
          if (user.get('organisations').get(filterOrg) !== undefined &&
              user.get('organisations').get(filterOrg).get(consts.organisationFields.joinState) === consts.states.pending) {
            return {'user': user, 'entity': organisation};
          }
        })
        .filter( value => value != undefined).toJS();
    }
    return requests;
  },


  /**
   * If the user is a global admin, displays all organisation
   * and service creation requests
   */
  _getPendingCreateRequests: function(lst) {
    const requests = [];
    if (util.isAdmin(this.props.user.toJS())) {
      lst.map(item => {
        if (item.get('state') === consts.states.pending) {
          const user = this._getUserById(item.get('created_by'));
          (user && requests.push({'user': user, entity: item}));
        }
      });
    }
    return requests;
  },

  /**
   * If the user is a global admin or is admin of service repository belong to,
   * display repository creation requests
   */
  _getPendingRepoRequests: function(lst) {
    const requests = [];
    if (util.isAdmin(this.props.user.toJS())) {
      lst.map(item => {
        if (item.get('state') === consts.states.pending) {
          const user = this._getUserById(item.get('created_by'));
          (user && requests.push({'user': user, entity: item}));
        }
      });
    } else {
      lst.map(item => {
        if (item.get('state') === consts.states.pending &&
            util.isAdmin(this.props.user.toJS(), item.get('service').get('organisation_id'))) {
          const user = this._getUserById(item.get('created_by'));
          (user && requests.push({'user': user, entity: item}));
        }
      })

    }
    return requests;
  },



  _getOrgById: function(orgId) {
    return this.props.organisations.find(org => org.get('id') === orgId);
  },


  _getUserById: function(userId) {
    return this.props.users.find(user => user.get('id') === userId);
  },

  _getRequests: function(req) {
    if (!req.payload.length) {
      return (
        <p className='no-results'>{messages.requests.pending.none}</p>
      );
    }
    return (
      <Requests
        requestType={req.type}
        requests={req.payload}
        showDetailsFunc={req.showDetailsFunc}
        approveFunc={req.approveFunc}
        rejectFunc={req.rejectFunc}
        users={this.props.users}
        headers={req.headers}  />
    );
  },

  _getActivatedModal: function() {
    const modalInfo = [];

    if (this.state.showUser) {
      modalInfo.push(
        <UserForm
          user={this.state.showUser}
          validationErrors={this.props.validationErrors}
          readOnly={true} />
      );
    } else if (this.state.showOrg) {
      modalInfo.push(
        <OrganisationForm
          user={this.props.user}
          organisation={this.state.showOrg}
          validationErrors={this.props.validationErrors}
          readOnly={true}/>
      );
    } else if (this.state.showSrv) {
      modalInfo.push(
        <ServiceForm
          service={this.state.showSrv}
          serviceTypes={Immutable.List.of(this.state.showSrv.get('service_type'))}
          readOnly={true} />
      );
    } else if (this.state.showRep) {
      modalInfo.push(
        <RepositoryForm
          repository={this.state.showRep}
          repositoryServices={Immutable.List.of(this.state.showRep.get('service'))}
          readOnly={true} />
      );
    } else {
      return null;
    }

    return (
      <Modal onClose={this._closeModal} key='modal'>
        {modalInfo}
        <div className='form-group'>
          <button className='btn btn-primary' onClick={this._closeModal}>
            {messages.labels.ok}
          </button>
        </div>
      </Modal>
    );
  },

  /**
   * pass in userId,orgId tuples as requests, and let the requests component generate the details
   */
  render: function () {
    const adminnedOrganisations = this._getAdminnedOrganisations(),
          pendingJoinRequests = this._getPendingJoinRequests(this.state.filterOrg, adminnedOrganisations),
          pendingCreateOrgRequests = this._getPendingCreateRequests(this.props.organisations),
          pendingCreateSrvRequests = this._getPendingCreateRequests(this.props.services),
          pendingCreateRepRequests = this._getPendingRepoRequests(this.props.repositories);


    // Get join organisation requests
    const joinOrgRequestList = this._getRequests({
      type: 'join',
      payload: pendingJoinRequests,
      showDetailsFunc: this._showJoinDetails,
      approveFunc: this._approveJoinRequest,
      rejectFunc: this._rejectJoinRequest,
      headers: messages.requests.pending.org.headers,
      entity: 'organisation'
    });

    // Get create organisation requests
    const createOrgRequestList = this._getRequests({
      type: 'create',
      payload: pendingCreateOrgRequests,
      showDetailsFunc: this._showCreateOrgDetails,
      approveFunc: this._approveCreateOrgRequest,
      rejectFunc: this._rejectCreateOrgRequest,
      headers: messages.requests.pending.org.headers,
      entity: 'organisation'
    });

    // Get create service requests
    const createSrvRequestList = this._getRequests({
      type: 'create',
      payload: pendingCreateSrvRequests,
      showDetailsFunc: this._showCreateSrvDetails,
      approveFunc: this._approveCreateSrvRequest,
      rejectFunc: this._rejectCreateSrvRequest,
      headers: messages.requests.pending.srv.headers,
      entity: 'service'
    });

    // Get create repository requests
    const createRepRequestList = this._getRequests({
      type: 'create',
      payload: pendingCreateRepRequests,
      showDetailsFunc: this._showCreateRepDetails,
      approveFunc: this._approveCreateRepRequest,
      rejectFunc: this._rejectCreateRepRequest,
      headers: messages.requests.pending.rep.headers,
      entity: 'repository'
    });

    const modal = this._getActivatedModal();

    return (
      <div>
        <section>

          <h1 className="requests-title">{messages.requests.pending.title}</h1>

          <form className="filter-org row form">
            <OrgFilter
              filterOrg={this.state.filterOrg}
              changeFilterOrg={this._changeFilterOrg}
              organisations={adminnedOrganisations} />
          </form>

          <h2>{messages.requests.titles.join}</h2>
          {joinOrgRequestList} <hr />
          <h2>{messages.requests.titles.createOrg}</h2>
          {createOrgRequestList} <hr />
          <h2>{messages.requests.titles.createSrv}</h2>
          {createSrvRequestList} <hr />
          <h2>{messages.requests.titles.createRep}</h2>
          {createRepRequestList}

          <div className='m-t-60'></div>
        </section>

        <ReactCSSTransitionGroup transitionName='modal'
         transitionLeaveTimeout={50} transitionEnterTimeout={50}>
          {modal}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});


module.exports = ManageRequestsSection;
