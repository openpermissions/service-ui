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
      ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
      PropTypes = require('../prop-types'),
      Immutable = require('immutable'),
      Modal = require('./modal'),
      actions = require('../actions'),
      consts = require('../constants.json'),
      RepositoryEdit = require('./repository-edit-section'),
      RepositoryForm = require('./repository-form'),
      RepositorysList = require('./repositories-list'),
      _ = require('lodash');

const RepositoriesSection = React.createClass({
  displayName: 'RepositoriesSection',
  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    services: PropTypes.Immutable.List,
    currentOrganisation: PropTypes.Immutable.Map.isRequired,
    organisations: PropTypes.Immutable.List,
    validationErrors: PropTypes.object
  },

  componentWillMount: function () {
    if (this.props.services.size === 0) {
      actions.getServices.push();
    }
  },

  getInitialState: function () {
    return {showForm: false};
  },

  /**
   * Change internal showForm state to false
   */
  _finish: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({showForm: false, editRepository: undefined});
  },

  /**
   * Change internal showForm state to true
   */
  _createRepository: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({showForm: true});
  },

  /**
   * Change internal showForm state to true and set the repository that should be edited
   */
  _editRepository: function(repositoryId) {
    this.setState({editRepository: repositoryId});
  },

  /**
   * List an organisation's repositories and a form to add a new repository
   *
   * @return {object}
   */
  render: function () {
    const currentOrganisation = this.props.currentOrganisation,
          repositories = currentOrganisation.has('repositories') ? currentOrganisation.get('repositories') : Immutable.OrderedMap(),
          editRepository = repositories.get(this.state.editRepository);

    const repositoryServices = this.props.services.filter(service =>
      service.get('service_type') == 'repository' && service.get('state') == consts.states.approved);

    if (!this.state.editRepository) {
      const orgIndexById = _.indexBy(this.props.organisations.toJS(), 'id');

      return (
        <div id='crhu_container'>
          <section id='crhu_repositories_section' className='repositories m-t-30'>
            <div className={'form-group'}>
              <button className={'btn btn-primary'} onClick={this._createRepository}>
                Create a New Repository
              </button>
            </div>

            <p className='intro' />
            <RepositorysList
              user={this.props.user}
              orgId={currentOrganisation.get('id')}
              repositories={repositories}
              editRepository={this._editRepository}
              orgIndexById={orgIndexById}
            />

            {this.props.children}

          </section>

          <ReactCSSTransitionGroup transitionName='modal'
           transitionLeaveTimeout={50} transitionEnterTimeout={50}>
            {this.state.showForm &&
              <Modal onClose={this._finish} key='modal'>
                <RepositoryForm
                 orgId={currentOrganisation.get('id')}
                 repositoryServices={repositoryServices}
                 onClose={this._finish}
                 validationErrors={this.props.validationErrors}
                 orgIndexById={orgIndexById}/>
              </Modal>
            }
          </ReactCSSTransitionGroup>
        </div>
      )
    } else {
      return (
        <div id="crhu_form_section">
          <RepositoryEdit
             repository={editRepository}
             repositoryServices={repositoryServices}
             organisations={this.props.organisations}
             onClose={this._finish}
             validationErrors={this.props.validationErrors}
          />
        </div>
      )
    }
  }
});

module.exports = RepositoriesSection;
