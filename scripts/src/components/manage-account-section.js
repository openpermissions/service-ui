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
      PropTypes = require('../prop-types'),
      actions = require('../actions/index'),
      UserForm = require('./user-form'),
      PasswordForm = require('./password-change-form'),
      DeleteModal = require('./delete-modal');

const AccountSection = React.createClass({
  displayName: 'Manage Account Section',

  mixins: [PureRenderMixin],

  propTypes: {
    currentUser: PropTypes.Immutable.Map.isRequired,
    validationErrors: PropTypes.object,
    passwordChanged: PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {deleteUser: false};
  },

  showDeleteModal: function (event) {
    if (event) { event.preventDefault(); }
    this.setState({deleteUser: true});
  },

  onClose: function (event) {
    if (event) { event.preventDefault(); }
    this.setState({deleteUser: false});
  },

  onDelete: function() {
    if (!this.state.deleteUser) { return; }
    actions.deleteUser.push({userId: this.props.currentUser.get('id')});
  },
  /**
   * Render forms to update the user, change password and delete user
   *
   * @return {object}
   */
  render: function () {
    return (
      <div className={'account-page'}>
        <UserForm user={this.props.currentUser}
          validationErrors={this.props.validationErrors}/>
        <p className='intro' />
        <PasswordForm
          user={this.props.currentUser}
          validationErrors={this.props.validationErrors}
          passwordChanged={this.props.passwordChanged}
        />
        <p className='intro' />

        <div className={'container'}>
          <hr />
        </div>

        <div className={'container form-group'}>
          <button className={'btn btn-primary'} onClick={this.showDeleteModal}>
              Cancel my account
          </button>
        </div>
        {this.state.deleteUser &&
          <DeleteModal type='account' onClose={this.onClose} onDelete={this.onDelete} />}
      </div>

    );
  }
});

module.exports = AccountSection;
