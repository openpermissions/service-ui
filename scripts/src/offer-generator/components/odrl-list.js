/**
 * Display a list of ODDL elements (rule, permission, prohibition, constraint)
 *
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
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      LinkedStateMixin = require('react-addons-linked-state-mixin'),
      actions = require('../../actions'),
      componentMap = require('./component-map'),
      PropTypes = require('../../prop-types'),
      {MenuItem, Menu, Wrapper, Button} = require('react-aria-menubutton');

const OdrlList = React.createClass({
  displayName: 'ODRL List',

  mixins: [ PureRenderMixin, LinkedStateMixin ],

  propTypes: {
    template: PropTypes.Immutable.Map.isRequired,
    type: React.PropTypes.string,
    value: React.PropTypes.array,
    parent: React.PropTypes.object
  },

  /**
   * Construct element of list
   * @param entity - odrl element
   * @private
   */
  _constructComponent: function(entity) {
    let attributes = _.extend({}, this.props);
    attributes['value'] = entity;
    attributes['key'] = 'Entity:' + entity.data['@id'];
    return componentMap[entity.uiClass](attributes);
  },

  /**
   * Add new element to list
   * @param value (optional) - id of existing odrl element to add
   * @private
   */
  _add(value, event) {
    actions.addOdrlEntity.push({parent: this.props.parent, type: this.props.type, key: this.props['_key'], id: value})
  },

  /**
   * Render list of odrl elements
   *
   * @returns {object}
   */
  render: function () {
    let ids = [];
    if (this.props.value) {
      ids = this.props.value.map(obj => obj['@id']);
    }

    let entities = this.props.template.get(this.props.type).toJS();
    let [newEntities, existingEntities] = _.partition(entities, obj => ids.indexOf(obj.data['@id']) == -1);

    let entityItems = _.map(existingEntities, (entity, id) => this._constructComponent(entity)) || [];
    let menuItems = [
      <MenuItem key={''} value={''} className='MenuButton-menuItem'>
        New {_.capitalize(this.props.type)}
      </MenuItem>
    ];
    menuItems = menuItems.concat(_.map(newEntities, entity => {
      return (<MenuItem key={entity.data['@id']} className='MenuButton-menuItem'>{entity.data['@id']}</MenuItem>);
    }));

    return (
      <div className='odrlList'>
        <h3>{_.capitalize(this.props.type)}</h3>
        <div>
          {entityItems}
        </div>
        <Wrapper className='MenuButton' onSelection={this._add}>
          <Button className='btn btn-primary'>Add {_.capitalize(this.props.type)}</Button>
          <Menu className='MenuButton-menu'>
            <ul>{menuItems}</ul>
          </Menu>
        </Wrapper>
      </div>
    );

  }
});

module.exports = OdrlList;
