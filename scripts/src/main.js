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

var React = require('react'),
    ReactDOM = require('react-dom'),
    Store = require('./store'),
    App = require('./app'),
    routes = require('./routes'),
    actions = require('./actions');

var store = new Store(actions, routes);

// Get the token from sessionStorage and set on the apiClient
// Means that if a user is logged in and refreshes the page we keep the
// token on the client
var token = sessionStorage.getItem('token');

if (token) {
  actions.loggedIn.push(token);
}

ReactDOM.render(React.createElement(App, store),
                document.getElementById('app'));
