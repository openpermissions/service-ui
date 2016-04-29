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
      {Login, Services, Accounts, Requests} = require('./tabs');

const Header = React.createClass({
  displayName: 'Header',
  propTypes: {
    user: React.PropTypes.object,
    loggedIn: React.PropTypes.bool.isRequired,
    verified: React.PropTypes.bool.isRequired,
    page: React.PropTypes.object.isRequired,
    version: React.PropTypes.string.isRequired
  },


  render: function () {
    const logoStyle = {
        backgroundImage: 'url(/assets/images/logo.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        height: '100%',
        width: '100%',
        margin: 0
    }
    return (
      <header className='header'>
        <div className='container'>
          <div className='row'>
            <div className='col col-xs-4'>
                <a href='/' className='header__logo' style={logoStyle}></a>
            </div>
            <div className='col col-xs-8 header__actions'>
              <h1 className='header__title'>Services Manager <small>{this.props.version}</small></h1>
              <nav role='navigation' className='header__menu header__menu--pages'>
                <Services
                  loggedIn = {this.props.loggedIn}
                  verified = {this.props.verified}
                  page = {this.props.page}
                />
                <Accounts
                  user = {this.props.user}
                  loggedIn = {this.props.loggedIn}
                  verified = {this.props.verified}
                  page = {this.props.page}
                />
                <Requests
                  user = {this.props.user}
                  loggedIn = {this.props.loggedIn}
                  verified = {this.props.verified}
                  page = {this.props.page}
                />
              </nav>

              <nav role='navigation' className='header__menu header__menu--user'>
                <Login
                  loggedIn = {this.props.loggedIn}
                  page = {this.props.page}
                />
              </nav>
            </div>
          </div>
        </div>
      </header>
    );
    /* jshint ignore:end */
  }
});

module.exports = Header;
