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
      AuthorizationMixin = require('./mixins/authorization-mixin'),
      classNames = require('classnames'),
      actions = require('../actions'),
      Link = require('./link'),
      util = require('../util'),
      consts = require('../constants');

const Services = React.createClass({
  displayName: 'Services',
  propTypes: {
    loggedIn: React.PropTypes.bool.isRequired,
    verified: React.PropTypes.bool.isRequired,
    page: React.PropTypes.object.isRequired
  },

  isCurrent: function(path) {
    return classNames('header__menu__item', {'header__menu__item--selected': this.props.page.path === path});
  },

  render: function () {
    if (!this.props.loggedIn || !this.props.verified) {
      return(
        <div/>
      );
    }
    return (
      <Link className={this.isCurrent('/organisation')} href='/organisation'>
        Organisation
      </Link>
    );
  }
});


const Accounts = React.createClass({
  displayName: 'Accounts',
  propTypes: {
    user: React.PropTypes.object,
    loggedIn: React.PropTypes.bool.isRequired,
    verified: React.PropTypes.bool.isRequired,
    page: React.PropTypes.object.isRequired
  },

  isCurrent: function(path) {
    let isCurrent = false;
    for (let i = path.length - 1; i >= 0; i--) {
      if(this.props.page.path === path[i]) {
        isCurrent = true;
      }
    };
    return classNames('header__menu__item', {'header__menu__item--selected': isCurrent});
  },

  render: function () {
    if (!this.props.loggedIn || !this.props.verified) {
      return(
        <div/>
      );
    }
    return (
      <Link href='/account' className={this.isCurrent(['/account'])} >
        Account
      </Link>
    );
  }
});


const Requests = React.createClass({
  displayName: 'Requests',
  propTypes: {
    user: React.PropTypes.object,
    loggedIn: React.PropTypes.bool.isRequired,
    verified: React.PropTypes.bool.isRequired,
    page: React.PropTypes.object.isRequired
  },

  isCurrent: function(path) {
    let isCurrent = false;
    for (let i = path.length - 1; i >= 0; i--) {
      if(this.props.page.path === path[i]) {
        isCurrent = true;
      }
    };
    return classNames('header__menu__item', {'header__menu__item--selected': isCurrent});
  },

  render: function () {
    if (!this.props.loggedIn || !this.props.verified) {
      return(
        <div/>
      );
    }
    return(
      <Link href='/requests' className={this.isCurrent(['/requests'])} >
        Requests
      </Link>
    );
  }
});


const Login= React.createClass({
  displayName: 'Login',
  propTypes: {
    loggedIn: React.PropTypes.bool.isRequired,
    page: React.PropTypes.object.isRequired
  },

  /**
   * Handle a click on the logout link
   */
  _onClickLogout: function (event) {
    event.preventDefault();
    actions.logout.push();
    actions.navigate.push('/login');
  },

  render: function () {
    let loginLink;
    if (this.props.loggedIn) {
      loginLink = <a className='logout-link' href='/logout' onClick={this._onClickLogout}>Logout</a>;
    } else if (this.props.page.path === '/login') {
      loginLink = <Link className='signup-link' href='/signup'>Signup</Link>;
    } else {
      loginLink = <Link className='login-link' href='/login'>Login</Link>;
    }

    return loginLink;
  }
});


module.exports={'Login': Login,
                'Accounts': Accounts,
                'Services': Services,
                'Requests': Requests
              };
