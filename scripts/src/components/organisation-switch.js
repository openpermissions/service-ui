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
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      Immutable = require('immutable'),
      _ = require('lodash'),
      actions = require('../actions'),
      PropTypes = require('../prop-types'),
      Modal = require('./modal'),
      OrganisationForm = require('./organisation-form'),
      JoinOrganisationForm = require('./join-org-form'),
      util = require('../util'),
      consts = require('../constants'),
      messages = require('../messages');

const SwitchOrganisation = React.createClass({
  displayName: 'SwitchOrganisation',

  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    userId: PropTypes.string.isRequired,
    organisations: PropTypes.Immutable.List.isRequired,
    validationErrors: React.PropTypes.object
  },

  getInitialState: function () {
    return {showCreateOrg: false, showJoinModal: false};
  },

  /**
   * Push a joinOrganisation action
   *
   * @param {object} event
   */
  _onSelectOrg: function (event) {
    event.preventDefault();
    if (event.target.value !== 'default') {
      actions.selectOrganisation.push(event.target.value);
    }
  },

  /**
   * Change internal showCreateOrg state to false
   */
  _closeCreateOrg: function (event) {
    if (event) { event.preventDefault(); }
    this.setState({showCreateOrg: false});
  },

  /**
   * Change internal showJoinModal state to false
   */
  _closeJoinModal: function (event) {
    if (event) { event.preventDefault(); }
    this.setState({showJoinModal: false});
  },

  /**
   * Change internal showCreateOrg state to true
   */
  _showCreateOrg: function (event) {
    if (event) { event.preventDefault(); }
    this.setState({showCreateOrg: true});
  },

  /**
   * Change internal showJoinModal state to true
   */
  _openJoinModal: function (event) {
    if (event) { event.preventDefault(); }
    this.setState({showJoinModal: true});
  },

  _getUserOrganisations: function () {
    if (this.props.user.getIn(['organisations', consts.globalRole, 'role']) === 'administrator') {
      return this.props.organisations.filter(function(org) {
        return org.get('state') === consts.states.approved;
      });
    }
    const orgIds = util.getUserOrgsByState(this.props.user.toJS(), consts.states.approved);
    return this.props.organisations.filter(function(org) {
      return orgIds.indexOf(org.get('id')) !== -1;
    });
  },

  /**
   * Render a form
   *
   * @returns {object}
   */
  render: function () {
    if (this.state.showCreateOrg) {
      return (
        <OrganisationForm
          user={this.props.user}
          onCancel={this._closeCreateOrg}
          key='form'
          organisation={Immutable.OrderedMap()}
          validationErrors={this.props.validationErrors}/>
      );
    } else {
      return (
        <div>
          <h1>{messages.requests.actions.chooseOrg}</h1>
          <p className={'sub-heading'}>Select an existing organisation or create a new organisation</p>

          <form className={'form row'}>
            <div className={'form-group col col-xs-12 col-sm-6 cb'}>
              <label>{messages.labels.existingOrg}</label>
              <select onChange={this._onSelectOrg} className={'form-control'}>
                <option value='default'>{messages.requests.actions.selectOrg}</option>
                {this.props.organisations &&
                _.map(this._getUserOrganisations().toArray(),
                    org => <option value={org.get('id')} key={org.get('id')}>{org.get('name')}</option>)}
              </select>
            </div>
          </form>

          <p className={'form-group sub-heading'}>Or</p>

          <p className={'form-group'}>
            <button className='btn btn-primary' onClick={this._showCreateOrg}>
              {messages.requests.actions.createOrg}
            </button>
          </p>

          <p className={'form-group'}>
            <button className='btn btn-primary' onClick={this._openJoinModal}>
              {messages.requests.actions.joinOrg}
            </button>
          </p>

          <div>
            <ReactCSSTransitionGroup transitionName='modal'
                                     transitionLeaveTimeout={500} transitionEnterTimeout={500}>
              {this.state.showJoinModal &&
              <Modal onClose={this._closeJoinModal} key='modal'>
                <JoinOrganisationForm
                  organisations={this.props.organisations}
                  user={this.props.user}
                  onClose={this._closeJoinModal}
                  key='form'
                  validationErrors={this.props.validationErrors}/>
              </Modal>
              }
            </ReactCSSTransitionGroup>
          </div>
        </div>
      );
    }
  }
});

module.exports = SwitchOrganisation;
