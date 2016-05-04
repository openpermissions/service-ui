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
      AuthorizationMixin = require('./mixins/authorization-mixin'),
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      messages = require('../messages'),
      consts = require('../constants');


const JoinOrganisationForm = React.createClass({

  displayName: 'Create join organisation form',

  mixins: [PureRenderMixin, AuthorizationMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    onClose: React.PropTypes.func.isRequired,
    validationErrors: React.PropTypes.object,
    organisations: PropTypes.Immutable.List.isRequired
  },

  _getOrgOptions: function() {
    const userOrgs = this.props.user.get('organisations').keySeq();
    const options = this.props.organisations.filter(org =>
      org.get('state') == consts.states.approved && !userOrgs.contains(org.get('id')));
    return options.map(org => {
      /* jshint ignore:start */
      return (
        <option key={org.get('id')} value={org.get('id')}>
          {org.get('name')}
        </option>);
      /* jshint ignore:end*/
    });
  },

  /**
   * Push a joinOrganisation action
   *
   * @param {object} event
   */
  _requestJoinOrg: function (event) {
    const orgId=this.refs.dropdown.value;
    const userId=this.props.user.get('id');
    event.preventDefault();
    if (event.target.value !== 'default') {
      actions.joinOrganisation.push({
        organisationId: orgId,
        userId: userId
      });
    }
    this.props.onClose();
  },

  renderPolicy: function () {
    return true;
  },

  render: function () {
    return (
      /* jshint ignore:start */
      <div>
        <h2>{messages.labels.selectOrg}</h2>
        <form className={'join_org form row'} onSubmit={this._requestJoinOrg}>
          <div className={'form-group col col-xs-12'}>
            <select ref = 'dropdown' className={'form-control'} >
              {this._getOrgOptions()}
            </select>
            <span className={'help-block'}>
              {messages.text.reviewReq}
            </span>
          </div>

          <div className={'form-group col col-xs-12'}>
            <button type='submit' className={'btn btn-primary'}>{messages.requests.actions.join}</button>
            <button className={'btn btn-danger'} onClick={this.props.onClose}>{messages.labels.cancel}</button>
          </div>
        </form>
    </div>
      /* jshint ignore:end*/
      );
  }
});

module.exports = JoinOrganisationForm;
