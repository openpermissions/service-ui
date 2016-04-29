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
      LinkedStateMixin = require('react-addons-linked-state-mixin'),
      actions = require('../actions');

const Login = React.createClass({
  displayName: 'Login Page',

  propTypes: {
    loggedIn: React.PropTypes.bool
  },

  statics: {
    onlyUnauthenticated: true
  },

  mixins: [ PureRenderMixin, LinkedStateMixin ],

  getInitialState: function () {
    return {email: '', password: ''};
  },

  /**
   * Push data to actions.login
   *
   * @param {object} event
   */
  _onSubmit: function(event) {
    event.preventDefault();
    actions.login.push({
      email: this.state.email.trim(),
      password: this.state.password
    });
  },

  /**
   * Render a login form
   *
   * @returns {object}
   */
  render: function () {
    return (
      /* jshint ignore:start */
      <div className='container'>
        <h1>Login</h1>
        <p className={'sub-heading'}>Welcome back</p>

        <form className={'login form row'} onSubmit={this._onSubmit}>
          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>Email address</label>
            <input type='email' required={true} placeholder='Email address'
              valueLink={this.linkState('email')} className={'form-control'} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>Password</label>
            <input type='password' required={true} placeholder='Password'
              valueLink={this.linkState('password')} className={'form-control'} />
          </div>

          <div className={'form-group col col-xs-12'}>
            <button type='submit' className={'btn btn-primary'}>Login</button>
          </div>
        </form>
      </div>
      /* jshint ignore:end */
    );
  }
});

module.exports = Login;
