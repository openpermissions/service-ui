/**
 * Component to display and edit ODRL constraint
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
      constraints = require('./../util').constraints;


const ConstraintValue = React.createClass({
  displayName: 'Constraint Value',

  mixins: [ LinkedStateMixin ],

  propTypes: {
    template: PropTypes.Immutable.Map.isRequired,
    constraint: React.PropTypes.object
  },


  getInitialState: function () {
    let allConstraints = {};
    constraints.map(c => {allConstraints[c[0]] = c});
    return {
      allConstraints: allConstraints
    }
  },

  /**
   * Update constraint type based on value of change event
   *
   * @param id - id of constraint
   * @private
   */
  _updateConstraintType: function(id) {
    return event => {
      const value = event.target.value;
      actions.updateConstraint.push({id: id, key: value, value: undefined});
    }
  },

  /**
   * Update constraint value based on value of change event
   *
   * @param id - id of constraint
   * @param key - constraint type
   * @private
   */
  _updateConstraintValue: function(id, key) {
    return event => {
      let value = event.target.value;
      let type = event.target.type;
      actions.updateConstraint.push({id: id, key: key, type: type, value: value});
    }
  },

  /**
   * Render the constraint value
   *
   * @returns {object}
   */
  render: function() {
    let id = this.props.constraint.data['@id'];
    let key = _.find(Object.keys(this.props.constraint.data), key => Object.keys(this.state.allConstraints).indexOf(key) != -1);
    let value = this.props.constraint.data[key];
    if (value) {
      value = value[0]['@value'] || value[0]['@id'];
    }

    let sortedConstraints = _.sortBy(constraints, a => a[1]);
    const children = sortedConstraints.map( a => React.createElement('option', {key:a[0], value: a[0], label: a[1]}));
    children.unshift(React.createElement('option', {key:'', value: '', label: '-- Select a constraint --', disabled:true}));
    let keyItem = React.createElement('select', {required: true, className: 'form-control', defaultValue: '', value: key, onChange: this._updateConstraintType(id)}, children);
    let valueItem = '';

    if (key) {
      let uiClass = this.state.allConstraints[key][2];
      valueItem = componentMap[uiClass]( {required: true, value: value, onChange: this._updateConstraintValue(id, key)})
    }

    return (
      <div>
        <div className='form-group col col-xs-12 cb'>
          {keyItem}
        </div>
        <div className='form-group col col-xs-12 cb'>
          {valueItem}
        </div>
      </div>
    );
  }
});


const ConstraintComponent = React.createClass({
  displayName: 'Constraint Component',

  mixins: [ PureRenderMixin, LinkedStateMixin ],

  propTypes: {
    template: PropTypes.Immutable.Map.isRequired,
    type: React.PropTypes.string,
    value: React.PropTypes.object,
    parent: React.PropTypes.object
  },


  /**
   * Update attribute of constraint based on value of event
   * @param id - id of constraint
   * @param key - attribute key
   * @private
   */
  _updateAttribute: function(id, key) {
    return event => {
      const value = event.target.value;
      actions.updateAttribute.push({type: [this.props.type, id], key: key, value: value});
    }
  },

  /**
   * Construct component of constraint
   * @param id - id of constraint
   * @param attributes - attributes of component
   * @param data - constraint data
   * @private
   */
  _constructComponent: function(id, attributes, data) {
    if (attributes['mutable']) {
      attributes['_key'] = attributes.key;
      attributes['onChange'] = this._updateAttribute(id, attributes.key);
      attributes['value'] = _.get(data, attributes.key);
      attributes['template'] = this.props.template;
      attributes['parent'] = {id: id, type: this.props.type};
      return componentMap[attributes.uiClass](attributes)
    }
    return _.get(data, attributes.key)
  },

  /**
   * Remove constraint from parent
   * @param id - id of constraint
   * @private
   */
  _remove(id) {
    actions.removeOdrlEntity.push({parent: this.props.parent, key: this.props['_key'], id: id})
  },

  /**
   * Render constraint
   *
   * @returns {object}
   */
  render: function () {
    let constraint = this.props.value;

    let id = constraint.data['@id'];
    let items = [
      <ConstraintValue
        template={this.props.template}
        constraint={constraint}
        key={'Field:' + id}
      />
    ];

    items = items.concat(constraint.fields.map((attr, index) => <div
      key={'Field:'+id+':'+index} className='form-group col col-xs-12 cb'><label className='label--big'>{attr.title}</label> {this._constructComponent(id, attr, constraint.data)} </div>));

    items.push(
      <div key='Constraint Remove Button' className='form-group col col-xs-12 cb text-right'>
        <button type="button" className='btn btn-danger' onClick={this._remove.bind(this, id)} key={'delete:'+id}>
          Remove {_.capitalize(this.props.type)}
        </button>
      </div>
    );

    return (
      <div className='constraint row'>
        <div className='col col-sm-offset-1'>
          {items}
        </div>
      </div>
    );
  }
});

module.exports = ConstraintComponent;
