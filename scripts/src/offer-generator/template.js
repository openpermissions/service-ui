/**
 * Template Generator
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

const uuid = require('uuid'),
      _ = require('lodash'),
      jsonld = require('jsonld'),
      actions = require('./util').actions,
      format = require('string-format'),
      Immutable = require('immutable'),
      util = require('./util');

format.extend(String.prototype);

function op(value) { return util.OP_PREFIX + value }
function odrl(value) { return util.ODRL_PREFIX + value }
function opex(value) { return util.OPEX_PREFIX + value }
function dcterm(value) { return util.DCTERM_PREFIX + value }

/**
 * Returns a valid uuid without hyphens
 * @returns {*}
 */
function getUuid() {
  let u = uuid.v4();
  u = u.replace(/-/gi, '');
  return u;
}

/**
 * Convert contents of entity into generic JS object that can be parsed by immutable
 * @param entity
 * @returns object
 */
function toJS(entity) {
  let data = {};
  Object.keys(entity).forEach(key => {
    if (_.some(customObjects, obj => entity[key] instanceof obj)) {
      data[key] = toJS(entity[key])
    } else {
      data[key] = entity[key]
    }
  });
  return data
}


class Rule {
  constructor(type, data) {
    this.uiClass = 'rule';
    this.template = `
    {
      "{odrl}action": [{
          "@id": ""
      }],
      "@id": "{tempId}{id}",
      "@type": [
          "{odrl}Rule",
          "{odrl}{type}"
      ]
    }`;
    this.fields = [
      {
        key: [odrl('action'), '0', '@id'],
        title: 'Action',
        uiClass: 'action-dropdown',
        required: true,
        mutable: true
      },
      {
        key: [odrl('constraint')],
        type: 'constraint',
        uiClass: 'odrl-list',
        required: false,
        mutable: true
      }
    ];

    if (!data) {
      const offerData = {type: type, id: getUuid(), tempId: util.TEMP_ID_PREFIX, odrl: util.ODRL_PREFIX};
      data = JSON.parse(this.template.format(offerData));
    }
    this.data = data;
  }
}


class Duty extends Rule {
  /**
   * Represents a duty entity.
   */
  constructor(data) {
    super('Duty', data);
  }
}

class Prohibition extends Rule{
  /**
   * Represents a prohibition entity.
   */
  constructor(data) {
    super('Prohibition', data);
  }
}

class Permission extends Rule {
  /**
   * Represents a permission entity.
   */
  constructor(data) {
    super('Permission', data);
    this.fields.push(
      {
        key: [odrl('duty')],
        type: 'duty',
        uiClass: 'odrl-list',
        required: false,
        mutable: true
      }
    );
  }
}

class Constraint {
  /**
   * Represents a constraint entity.
   */
  constructor(data) {
    this.template = `
    {
      "@id": "{tempId}{id}",
      "@type": [
        "{odrl}Constraint",
        "{opex}Constraint"
      ]
    }`;
    this.uiClass = 'constraint';
    this.fields = [
      {
        key: [odrl('operator'), '0', '@id'],
        title: 'Operator',
        uiClass: 'operator-dropdown',
        required: true,
        mutable:true
      },
      {
        key: [odrl('unit'), '0', '@id'],
        title: 'Unit',
        uiClass: 'unit-dropdown',
        required: false,
        mutable: true
      }
    ];
    if (!data) {
      const offerData = {id: getUuid(), odrl: util.ODRL_PREFIX, opex: util.OPEX_PREFIX, tempId: util.TEMP_ID_PREFIX};
      data = JSON.parse(this.template.format(offerData));
    }
    this.data = data;
  }
}

class Target {
  /**
   * Represents a target entity.
   */
  constructor(data) {
    this.template = `
    {
      "@id": "{tempId}{id}",
      "@type": [
        "{odrl}Asset",
        "{op}Asset",
        "{op}AssetSelector"
      ],
      "{op}count": [{
        "@value": 1
      }],
      "{op}fromSet": [{
        "@id": ""
      }]
    }`;
    this.uiClass = 'target';
    this.fields = [
      {
        key: [op('count'), '0', '@value'],
        title: 'Count',
        uiClass: 'integer-input',
        required: true,
        mutable:true
      },
      {
        key: [op('fromSet'),'0', '@id'],
        title: 'Set',
        uiClass: 'text-input',
        required: true,
        mutable: true
      }
    ];
    if (!data) {
      const offerData = {id: getUuid(), tempId: util.TEMP_ID_PREFIX, odrl: util.ODRL_PREFIX, op: util.OP_PREFIX};
      data = JSON.parse(this.template.format(offerData));
    }
    this.data = data;
  }
}

class Offer {
  /**
   * Represents a top-level offer.
   */
  constructor(data) {
    this.template = `
    {
      "{odrl}profile": "http://openpermissions.org/ns/op/1.1/",
      "{odrl}undefined": [{
          "@id": "{odrl}invalid"
      }],
      "@type": [
          "{odrl}Offer",
          "{odrl}Policy",
          "{op}Policy",
          "{odrl}Asset"
      ],
      "{odrl}inheritAllowed": [{
        "@value": false
      }],
      "@id": "{tempId}{id}",
      "{odrl}type": [{
        "@language": "en",
        "@value": "offer"
      }],
      "{odrl}conflict": [{
          "@id": "{odrl}invalid"
      }]
    }`;
    this.uiClass = 'offer';
    this.fields = [
      {
        key: [dcterm('title'), '0', '@value'],
        title: 'Title',
        placeholder: 'Title',
        uiClass: 'text-input',
        required: true,
        mutable:true
      },
      {
        key: [op('policyDescription'), '0', '@value'],
        title: 'Policy Description',
        placeholder: 'Description',
        uiClass: 'text-area',
        required: true,
        mutable:true
      },
      {
        key: [op('policyText'), '0', '@value'],
        title: 'Policy Text',
        placeholder: 'Text',
        uiClass: 'text-area',
        required: false,
        mutable: true
      },
      {
        key: [odrl('permission')],
        type: 'permission',
        uiClass: 'odrl-list',
        required: false,
        mutable: true
      },
      {
        key: [odrl('prohibition')],
        type: 'prohibition',
        uiClass: 'odrl-list',
        required: false,
        mutable: true
      },
      {
        key: [odrl('target')],
        type: 'target',
        uiClass: 'odrl-list',
        required: false,
        mutable: true
      },
      {
        key: [odrl('duty')],
        type: 'duty',
        uiClass: 'odrl-list',
        required: false,
        mutable: true
      }
    ];
    if (!data) {
      const offerData = {id: getUuid(), odrl: util.ODRL_PREFIX, tempId: util.TEMP_ID_PREFIX, op: util.OP_PREFIX};
      data = JSON.parse(this.template.format(offerData));
    }
    this.data = data;
  }
}


class OfferTemplate {
  /**
   *  Factory class to manage the building and editing of an ODRL offer.
   *
   *  Offers represented within this factory are stored in a data structure that splits offer entities
   *  into groups of their respective types, providing display & edit rules for these entities
   *  as well as hierarchical links.
   *
   *  Existing ODRL-format offers can be loaded into the factory and will translated to this data structure.
   *
   *  Methods are provided for adding, editing and removing entities within the offer.
   *
   *  At any point constructOffer can be called to translate the internal data structure back into and ODRL-format offer.
   */

  constructor() {
    this.offer=new Offer();
    this.permission={};
    this.prohibition={};
    this.constraint={};
    this.duty={};
    this.target={};
  }

  /**
   * Load existing offer into factory
   * @param offerData - JSONLD offer
   */
  loadOffer(offerData) {
    this.offer = null;
    this.permission={};
    this.prohibition={};
    this.constraint={};
    this.duty={};
    this.target={};

    let self = this;
    return new Promise(function (resolve, reject) {
      jsonld.expand(offerData, (error, expanded) => {
        if (error) {
          reject(error);
          return;
        }
        //Replace id with tempid
        let offer = JSON.parse(JSON.stringify(expanded).replace(new RegExp(util.ID_PREFIX, 'gi'), util.TEMP_ID_PREFIX));
        offer.forEach(i => {
          let type = i['@type'];
          if (type.indexOf(odrl('Offer')) != -1) {
            self.offer = new Offer(i);
          } else if (type.indexOf(odrl('Permission')) != -1) {
            self.permission[i['@id']] = new Permission(i);
          } else if (type.indexOf(odrl('Prohibition')) != -1) {
            self.prohibition[i['@id']] = new Prohibition(i);
          } else if (type.indexOf(odrl('Constraint')) != -1) {
            self.constraint[i['@id']] = new Constraint(i);
          } else if (type.indexOf(odrl('Duty')) != -1) {
            self.duty[i['@id']] = new Duty(i);
          } else if (Object.keys(i).indexOf(op('fromSet')) != -1) {
            self.target[i['@id']] = new Target(i);
          }
        });

        if (!self.offer) {
          reject('Cannot load data');
          return;
        }
        resolve()
      });
    })
  };

  /**
   * Update constraint type and value
   * @param id - id of constraint
   * @param key - constraint type
   * @param type - constraint type
   * @param value - constraint value
   */
  updateConstraint(id, key, type, value) {
    let constraint = this.constraint[id];
    let allConstraints = util.constraints.map(c => c[0]);
    let excessKeys = _.filter(Object.keys(constraint.data), key => allConstraints.indexOf(key) != -1);
    excessKeys.forEach( key => {
      delete constraint.data[key]
    });

    if (type && type.includes('select')) {
      value = {'@id': value};
    } else if (type == 'number') {
      value = {'@value': Number(value)};
    } else {
      value = {'@value': value}
    }

    constraint.data[key] = [value];
  }

  /**
   * Update attribute of element
   * @param type - type of element
   * @param key - key path to update (e.g. constraint.id1234)
   * @param value - value to update
   */
  updateAttribute(type, key, value) {
    let entity = _.get(this, type);
    if (!entity) {
      throw new Error('Invalid type ' + type)
    }
    _.set(entity.data, key, value);
  }

  /**
   * Get parent element
   * @param type - type of parent
   * @param id - id of parent
   * @returns Parent object
   * @private
   */
  _getParent(type, id){
    let parent;
    if (type == 'offer') {
      parent = this.offer;
    } else {
      parent = _.get(this, [type, id]);
      if (!parent) {
        throw new Error('Invalid parent with type '+type+' and id ' +id)
      }
    }
    return parent
  }

  /**
   * Add new or existing element to parent
   * @param parent - parent to add element to
   * @param type - type of element to add
   * @param key - key to add element to
   * @param id (optional) - id of existing element to add
   */
  addEntity(parent, type, key, id) {
    const typeMap = {
      permission: Permission,
      prohibition: Prohibition,
      duty: Duty,
      constraint: Constraint,
      target: Target
    };

    //Check type
    let ruleType = typeMap[type];
    if (!ruleType) {
      throw new Error('Invalid type ' + type);
    }

    //Get parent
    //TODO: Can parents be done nicer?
    let parentEntity = this._getParent(parent.type, parent.id);

    //Check that type can be added to parent
    let validFields = _.map(parentEntity.fields, f => f['type']);
    if (validFields.indexOf(type) == -1) {
      throw new Error('Cannot add a '+ type + ' to a '+ parent.type)
    }

    //Add entity to top level object
    let rule;
    if (id) {
      rule = this[type][id];
      if (!rule) {
        throw new Error(type + ' ' + id + ' does not exist')
      }
    } else {
      rule = new ruleType();
      this[type][rule.data['@id']] = rule;
    }


    //Add entity to parent data
    let data = _.get(parentEntity.data, key, []);

    if(_.find(data, e => e['@id'] == rule.data['@id'])) {
      throw new Error(type + ' ' + rule.data['@id'] + ' has already been added to ' + parent.type + ' ' + parent.id)
    }
    data.push({'@id': rule.data['@id']});
    _.set(parentEntity.data, key, data);
  }

  /**
   * Remove element from parent
   * @param parent - parent to remove element from
   * @param key - key of element to remove
   * @param id - id of element to remove
   */
  removeEntity(parent, key, id) {
    //TODO: Can parents be done nicer?
    let parentEntity = this._getParent(parent.type, parent.id);

    let result = _.remove(parentEntity.data[key], (x) => x['@id'] == id);
    if (result.length == 0) {
      throw new Error('Entity ' + id + ' does not belong to parent');
    }

    //If no more entities for parent, remove key for that entity
    if (parentEntity.data[key].length == 0) {
      delete parentEntity.data[key]
    }
  }

  /**
   * Convert contents of class into generic JS object that can be parsed by immutable
   * @param entity
   * @returns object
   */
  toJS() {
    let data = {};
    Object.keys(this).forEach(key => {
      if (_.some(customObjects, obj => this[key] instanceof obj)) {
        data[key] = toJS(this[key]);
      } else if (this[key] instanceof Object) {
        let newData = {};
        for (let k in this[key]) {
          if (_.some(customObjects, obj => this[key][k] instanceof obj)) {
            newData[k] = toJS(this[key][k])
          } else {
            newData[k] = this[key][k];
          }
        }
        data[key] = newData;
      }
      else {
        data[key] = this[key]
      }
    });
    return data;
  }

  /**
   * Recursively traverse elements and mark as in use if part of offer heirarchy
   * @param data - element currently being checked
   * @param inUse - array of elements that are marked as in use
   * @param toCheck - array of elements still to check
   * @private
   */
  _markInUse(data, inUse, toCheck) {
    let types = Object.keys(this);
    _.remove(types, 'offer');
    types.forEach(type => {
      if (data[odrl(type)]) {
        data[odrl(type)].forEach( id => {
          if (!(_.find(inUse, id['@id']))) {
            toCheck.push([type, id['@id']]);
            inUse.push(id['@id']);
          }
        })
      }
    });
  }

  /**
   * Construct serialized odrl offer from factory data
   */
  constructOffer() {
    let inUse = [];
    let toCheck = [];
    this._markInUse(this.offer.data, inUse, toCheck);

    while(toCheck.length != 0) {
      let entity = toCheck.shift();
      let data = this[entity[0]][entity[1]].data;
      this._markInUse(data, inUse, toCheck);
    }

    let graph = [this.offer.data];
    Object.keys(this).forEach( type => {
      if (type != 'offer') {
        for (let key in this[type]) {
          if (inUse.indexOf(key) != -1) {
            graph.push(this[type][key].data)

          }
        }
      }
    });
    return JSON.stringify(graph);
  }
}

const customObjects = [Offer, Rule, Constraint, Target];

module.exports = OfferTemplate;
