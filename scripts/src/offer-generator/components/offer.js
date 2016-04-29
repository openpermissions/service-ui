/**
 * Display top-level ODRL offer
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
      PropTypes = require('../../prop-types');

const OfferComponent = React.createClass({
  displayName: 'Offer Component',

  mixins: [ PureRenderMixin, LinkedStateMixin ],

  propTypes: {
    template: PropTypes.Immutable.Map.isRequired
  },

  /**
   * Update attribute of offer based on event value
   * @param key - key of attribute
   * @private
   */
  _updateAttribute: function(key) {
    return event => {
      let value = event.target.value;
      let type = event.target.type;

      if (type == 'number') {
        value = Number(value);
      }

      actions.updateAttribute.push({type: 'offer', key: key, value: value});
    }
  },


  /**
   * Construct component of offer
   * @param attributes - attributes of component
   * @param data - offer data
   * @private
   */
  _constructComponent: function(attributes, data) {
    if (attributes.get('mutable')) {
      data = data.toJS();
      attributes = attributes.toJS();
      attributes['_key'] = attributes.key;
      attributes['onChange'] = this._updateAttribute(attributes.key);
      attributes['value'] = _.get(data, attributes.key);
      attributes['template'] = this.props.template;
      attributes['parent'] = {id: this.props.template.get('offer').get('data').get('@id'), type: 'offer'};
      return componentMap[attributes.uiClass](attributes)
    }
    return _.get(data.toJS(), attributes.get('key'))
  },

  /**
   * Render the offer
   *
   * @returns {object}
   */
  render: function () {
    let items = <div class='form-group col col-xs-12 cb'/>;
    let offer = this.props.template.get('offer');
    if (offer) {
      items = offer.get('fields').map((attr, index) => <div className='form-group col col-xs-12 cb'
        key={'Field:' + index}><label className="label--big">{attr.get('title')}</label>{this._constructComponent(attr, offer.get('data'))}</div>);
    }

    return (
      <div className='offer'>
        {items}
      </div>
    );
  }
});

module.exports = OfferComponent;
