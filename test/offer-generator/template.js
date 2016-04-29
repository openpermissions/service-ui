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
const rewire = require('rewire'),
      should = require('should');

let OfferTemplate = rewire('../../scripts/src/offer-generator/template.js');
let Offer = OfferTemplate.__get__('Offer');
let Permission = OfferTemplate.__get__('Permission');
let Prohibition = OfferTemplate.__get__('Prohibition');
let Duty = OfferTemplate.__get__('Duty');
let Constraint = OfferTemplate.__get__('Constraint');
let Target = OfferTemplate.__get__('Target');

describe('Offer', function() {
  it('should store data when provided', function () {
    let data = {foo: 'bar'};
    let offer = new Offer(data);
    offer.data.should.eql({foo: 'bar'});
  });

  it('should load default template if data not provided ', function () {
    let offer = new Offer();
    Object.keys(offer.data).should.eql(
      ['http://www.w3.org/ns/odrl/2/profile', 'http://www.w3.org/ns/odrl/2/undefined', '@type',
        'http://www.w3.org/ns/odrl/2/inheritAllowed', '@id', 'http://www.w3.org/ns/odrl/2/type',
        'http://www.w3.org/ns/odrl/2/conflict'])
  })
});

describe('Permission', function() {
  it('should store data when provided', function () {
    let data = {foo: 'bar'};
    let permission = new Permission(data);
    permission.data.should.eql(data)
  });

  it('should load default template if data not provided ', function () {
    let permission = new Permission();
    Object.keys(permission.data).should.eql(
      ['http://www.w3.org/ns/odrl/2/action', '@id', '@type'])
  })
});

describe('Prohibition', function() {
  it('should store data when provided', function () {
    let data = {foo: 'bar'};
    let prohibition = new Prohibition(data);
    prohibition.data.should.eql(data)
  });

  it('should load default template if data not provided ', function () {
    let prohibition = new Prohibition();
    Object.keys(prohibition.data).should.eql(
      ['http://www.w3.org/ns/odrl/2/action', '@id', '@type'])
  })
});

describe('Duty', function() {
  it('should store data when provided', function () {
    let data = {foo: 'bar'};
    let duty = new Duty(data);
    duty.data.should.eql(data)
  });

  it('should load default template if data not provided ', function () {
    let duty = new Duty();
    Object.keys(duty.data).should.eql(
      ['http://www.w3.org/ns/odrl/2/action', '@id', '@type'])
  })
});

describe('Constraint', function() {
  it('should store data when provided', function () {
    let data = {foo: 'bar'};
    let constraint = new Constraint(data);
    constraint.data.should.eql(data)
  });

  it('should load default template if data not provided ', function () {
    let constraint = new Constraint();
    Object.keys(constraint.data).should.eql(
      ['@id', '@type'])
  })
});

describe('Target', function() {
  it('should store data when provided', function () {
    let data = {foo: 'bar'};
    let constraint = new Target(data);
    constraint.data.should.eql(data)
  });

  it('should load default template if data not provided ', function () {
    let constraint = new Target();
    Object.keys(constraint.data).should.eql(
      ['@id', '@type', 'http://openpermissions.org/ns/op/1.1/count', 'http://openpermissions.org/ns/op/1.1/fromSet'])
  })
});

describe('OfferTemplate', function() {
  describe('constructor', function () {
    it('should construct a new offer template on construction', function () {
      let template = new OfferTemplate();
      Object.keys(template.offer).should.be.eql(['template', 'uiClass', 'fields', 'data']);
      template.permission.should.eql({});
      template.prohibition.should.eql({});
      template.constraint.should.eql({});
      template.duty.should.eql({});
    });
  });

  describe('loadOffer', function () {
    describe('loadOffer with data', function () {
      let data = {
        "@context": {
          "id": "http://openpermissions.org/ns/id/",
          "ol": "http://openpermissions.org/ns/op/1.1/",
          "@vocab": "http://www.w3.org/ns/odrl/2/"
        },
        '@graph': [
          {
            '@type': [
              'ol:Policy',
              'Asset',
              'Policy',
              'Offer'
            ]
          },
          {
            '@type': ['Constraint'],
            '@id': 'id:constraint1'
          },
          {
            '@type': ['Constraint',
              'Rule'],
            '@id': 'id:constraint2'
          },
          {
            '@id': 'id:perm1',
            '@type': ['Permission',
              'Rule']
          },
          {
            '@id': 'id:perm2',
            '@type': ['Permission']
          },
          {
            '@id': 'id:prohib1',
            '@type': ['Prohibition',
              'Rule']
          },
          {
            '@id': 'id:prohib2',
            '@type': ['Prohibition']
          },
          {
            '@id': 'id:duty1',
            '@type': ['Duty']
          },
          {
            '@id': 'id:duty2',
            '@type': ['Duty',
              'Rule']
          },
          {
            '@id': 'id:set1',
            '@type': ['Asset'],
            'ol:fromSet': {'@id': 'id:set1'}
          }
        ]
      };

      let template = new OfferTemplate();
      template.loadOffer(data);
      it('should store the Offer in the offer object', function () {
        template.offer.should.eql(new Offer({
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ]
        }));
      });

      it('should store the Permissions in the permission object', function () {
        template.permission.should.eql({
          'http://openpermissions.org/ns/temporary_id/perm1': new Permission({
            '@id': 'http://openpermissions.org/ns/temporary_id/perm1',
            '@type': ['http://www.w3.org/ns/odrl/2/Permission', 'http://www.w3.org/ns/odrl/2/Rule']
          }),
          'http://openpermissions.org/ns/temporary_id/perm2': new Permission({
            '@id': 'http://openpermissions.org/ns/temporary_id/perm2',
            '@type': ['http://www.w3.org/ns/odrl/2/Permission']
          })
        })
      });

      it('should store the Prohibitions in the prohibition object', function () {
        template.prohibition.should.eql({
          'http://openpermissions.org/ns/temporary_id/prohib1': new Prohibition({
            '@id': 'http://openpermissions.org/ns/temporary_id/prohib1',
            '@type': ['http://www.w3.org/ns/odrl/2/Prohibition', 'http://www.w3.org/ns/odrl/2/Rule']
          }),
          'http://openpermissions.org/ns/temporary_id/prohib2': new Prohibition({
            '@id': 'http://openpermissions.org/ns/temporary_id/prohib2',
            '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
          })
        })
      });

      it('should store the Duties in the duty object', function () {
        template.duty.should.eql({
          'http://openpermissions.org/ns/temporary_id/duty1': new Duty({
            '@id': 'http://openpermissions.org/ns/temporary_id/duty1',
            '@type': ['http://www.w3.org/ns/odrl/2/Duty']
          }),
          'http://openpermissions.org/ns/temporary_id/duty2': new Duty({
            '@id': 'http://openpermissions.org/ns/temporary_id/duty2',
            '@type': ['http://www.w3.org/ns/odrl/2/Duty', 'http://www.w3.org/ns/odrl/2/Rule']
          })
        })
      });

      it('should store the Constraints in the constraint object', function () {
        template.constraint.should.eql({
          'http://openpermissions.org/ns/temporary_id/constraint1': new Constraint({
            '@id': 'http://openpermissions.org/ns/temporary_id/constraint1',
            '@type': ['http://www.w3.org/ns/odrl/2/Constraint']
          }),
          'http://openpermissions.org/ns/temporary_id/constraint2': new Constraint({
            '@id': 'http://openpermissions.org/ns/temporary_id/constraint2',
            '@type': ['http://www.w3.org/ns/odrl/2/Constraint', 'http://www.w3.org/ns/odrl/2/Rule']
          })
        })
      });

      it('should store the Targets in the target object', function () {
        template.target.should.eql({
          'http://openpermissions.org/ns/temporary_id/set1': new Target({
            '@id': 'http://openpermissions.org/ns/temporary_id/set1',
            'http://openpermissions.org/ns/op/1.1/fromSet': [{'@id': 'http://openpermissions.org/ns/temporary_id/set1'}],
            '@type': ['http://www.w3.org/ns/odrl/2/Asset']
          })
        })
      });
  });

    describe('loadOffer with no elements', function () {
      let data = {
        "@context": {
          "id": "http://openpermissions.org/ns/id/",
          "ol": "http://openpermissions.org/ns/op/1.1/",
          "@vocab": "http://www.w3.org/ns/odrl/2/"
        },
        '@graph': [
          {
            '@type': [
              'ol:Policy',
              'Asset',
              'Policy',
              'Offer'
            ]
          }
        ]
      };

      let template = new OfferTemplate();
      template.loadOffer(data);

      it('should store the Offer in the offer object', function () {
        template.offer.should.eql(new Offer({
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ]
        }))
      });

      it('should have an empty permission', function () {
        template.permission.should.eql({})
      });

      it('should have an empty prohibition', function () {
        template.prohibition.should.eql({})
      });

      it('should have an empty duty', function () {
        template.duty.should.eql({})
      });
      it('should have an empty constraint', function () {
        template.constraint.should.eql({})
      });
      it('should have an empty target', function () {
        template.constraint.should.eql({})
      });
    });

    describe('loadOffer with already expanded data', function () {
      let data = [{
        '@type': [
          'http://openpermissions.org/ns/op/1.1/Policy',
          'http://www.w3.org/ns/odrl/2/Offer'
        ]
      }];

      let template = new OfferTemplate();
      template.loadOffer(data);

      it('should store the Offer in the offer object', function () {
        template.offer.should.eql(new Offer({
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ]
        }))
      });
    });

    describe('loadOffer with invalid odrl - no context', function () {
      let data = {
        '@graph': [
          {
            '@type': [
              'ol:Policy',
              'Asset',
              'Policy',
              'Offer'
            ]
          }
        ]
      };

      let template = new OfferTemplate();
      let result = template.loadOffer(data);

      it('should reject the promise', function () {
      return (result).should.be.rejected();
      });
    });

    describe('loadOffer with invalid odrl - no graph', function () {
      let data = {
        "@context": {
          "id": "http://openpermissions.org/ns/id/",
          "ol": "http://openpermissions.org/ns/op/1.1/",
          "@vocab": "http://www.w3.org/ns/odrl/2/"
        }
      };

      let template = new OfferTemplate();
      let result = template.loadOffer(data);

      it('should reject the promise', function () {
        return (result).should.be.rejected();
      });
    });

    describe('loadOffer with invalid data', function () {
      let data = 'invalid data';

      let template = new OfferTemplate();
      let result = template.loadOffer(data);

      it('should reject the promise', function () {
        return (result).should.be.rejected();
      });
    });
  });


  describe('updateAttribute', function() {
    let types = [
      ['permission', 'http://openpermissions.org/ns/temporary_id/perm1'],
      ['prohibition', 'http://openpermissions.org/ns/temporary_id/prohib1'],
      ['duty', 'http://openpermissions.org/ns/temporary_id/duty1'],
      ['constraint', 'http://openpermissions.org/ns/temporary_id/constraint1']];

    let data = [
      {
        '@type': ['http://www.w3.org/ns/odrl/2/Offer']
      },
      {
        '@type': ['http://www.w3.org/ns/odrl/2/Constraint'],
        '@id': 'http://openpermissions.org/ns/id/constraint1'
      },
      {
        '@id': 'http://openpermissions.org/ns/id/perm1',
        '@type': ['http://www.w3.org/ns/odrl/2/Permission']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/prohib1',
        '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/duty1',
        '@type': ['http://www.w3.org/ns/odrl/2/Duty']
      }
    ];

    let template = new OfferTemplate();
    template.loadOffer(data);

    it('should update the data key/value for offer', function() {
      template.updateAttribute('offer', 'foo', 'bar');
      template.offer.data['foo'].should.eql('bar')
    });

    types.forEach( type => {
      it('should update the data key/value for ' + type, function() {
        template.updateAttribute(type, 'foo', 'bar');
        template[type[0]][type[1]].data['foo'].should.eql('bar')
      });
    });

    it('should raise an exception if invalid type provided', function () {
      template.updateAttribute.bind(template, 'foo').should.throw('Invalid type foo');
    });
  });

  describe('addEntity new Entity', function () {
    describe('offer', function () {
      let template = new OfferTemplate();

      let types = ['permission', 'prohibition', 'duty', 'target'];
      types.forEach(type => {
        it('should add new entity to offer for type ' + type, function () {
          Object.keys(template[type]).length.should.eql(0);

          let offerId = template.offer.data['@id'];
          let key = ['http://www.w3.org/ns/odrl/2/' + type];
          template.addEntity({id: offerId, type: 'offer'}, type, key);

          Object.keys(template[type]).length.should.eql(1);
          template.offer.data[key].length.should.eql(1);
        });
      });
    });

    describe('permission', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/permission': [
            {
              '@id': 'http://openpermissions.org/ns/id/perm1'
            }
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/perm1',
          '@type': ['http://www.w3.org/ns/odrl/2/Permission']
        }
      ];
      let template = new OfferTemplate();
      template.loadOffer(data);

      let types = ['duty', 'constraint'];
      types.forEach(type => {
        it('should add new entity to permission for type ' + type, function () {
          Object.keys(template[type]).length.should.eql(0);

          let key = ['http://www.w3.org/ns/odrl/2/' + type];
          template.addEntity({id: 'http://openpermissions.org/ns/temporary_id/perm1', type: 'permission'}, type, key);

          Object.keys(template[type]).length.should.eql(1);
          template.permission['http://openpermissions.org/ns/temporary_id/perm1'].data[key].length.should.eql(1);
        });
      });
    });

    describe('prohibition', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/prohibition': [
            {
              '@id': 'http://openpermissions.org/ns/id/prohib1'
            }
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/prohib1',
          '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
        }
      ];
      let template = new OfferTemplate();
      template.loadOffer(data)
      it('should add new constraint to prohibition', function () {
        Object.keys(template.constraint).length.should.eql(0);
        let key = ['http://www.w3.org/ns/odrl/2/constraint'];
        template.addEntity({id: 'http://openpermissions.org/ns/temporary_id/prohib1', type: 'prohibition'}, 'constraint', key);

        Object.keys(template.constraint).length.should.eql(1);
        template.prohibition['http://openpermissions.org/ns/temporary_id/prohib1'].data[key].length.should.eql(1);
      });
    });


    describe('duty', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/duty': [
            {
              '@id': 'http://openpermissions.org/ns/id/duty1'
            }
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/duty1',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty']
        }
      ];

      let template = new OfferTemplate();
      template.loadOffer(data);
      it('should add new constraint to duty', function () {
        Object.keys(template.constraint).length.should.eql(0);
        let key = ['http://www.w3.org/ns/odrl/2/constraint'];
        template.addEntity({id: 'http://openpermissions.org/ns/temporary_id/duty1', type: 'duty'}, 'constraint', key);
        Object.keys(template.constraint).length.should.eql(1);
        template.duty['http://openpermissions.org/ns/temporary_id/duty1'].data[key].length.should.eql(1);
      });
    });

    describe('invalid', function () {
      let template = new OfferTemplate();
      it('should throw an error if the parent type is invalid', function () {
        template.addEntity.bind(template, {id: 'foo', type:'bar'}, 'duty').should.throw('Invalid parent with type bar and id foo')
      });
      it('should throw an error if the parent does not exist', function () {
        template.addEntity.bind(template, {id: 'foo', type:'permission'}, 'duty').should.throw('Invalid parent with type permission and id foo')
      });
      it('should throw an error if the type is invalid', function () {
        template.addEntity.bind(template, {id: 'foo', type:'bar'}, 'foo').should.throw('Invalid type foo')
      });
      it('should throw an error if try to add an invalid entity', function () {
        template.addEntity.bind(template, {id: '1', type:'offer'}, 'constraint').should.throw('Cannot add a constraint to a offer')
      });
    });
  });


  describe('addEntity existing Entity', function () {
    describe('offer', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/permission',
          '@type': ['http://www.w3.org/ns/odrl/2/Permission']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/prohibition',
          '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/duty',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty']
        }
      ];
      let template = new OfferTemplate();
      template.loadOffer(data);

      let types = ['permission', 'prohibition', 'duty'];
      types.forEach(type => {
        it('should add existing entity to offer for type ' + type, function () {
          let offerId = template.offer.data['@id'];
          let key = ['http://www.w3.org/ns/odrl/2/' + type];
          let id = 'http://openpermissions.org/ns/temporary_id/' + type;

          Object.keys(template[type]).length.should.eql(1);
          template.addEntity({id: offerId, type: 'offer'}, type, key, id);
          Object.keys(template[type]).length.should.eql(1);
          template.offer.data[key].should.eql([{'@id': id}]);
        });
      });
    });

    describe('permission', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/permission': [
            {
              '@id': 'http://openpermissions.org/ns/id/perm1'
            }
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/perm1',
          '@type': ['http://www.w3.org/ns/odrl/2/Permission']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/constraint',
          '@type': ['http://www.w3.org/ns/odrl/2/Constraint']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/duty',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty']
        }
      ];
      let template = new OfferTemplate();
      template.loadOffer(data);
      let types = ['duty', 'constraint'];
      types.forEach(type => {
        it('should add new entity to permission for type ' + type, function () {
          Object.keys(template[type]).length.should.eql(1);
          let key = ['http://www.w3.org/ns/odrl/2/' + type];
          let id = 'http://openpermissions.org/ns/temporary_id/' + type;

          template.addEntity({id: 'http://openpermissions.org/ns/temporary_id/perm1', type: 'permission'}, type, key, id);

          Object.keys(template[type]).length.should.eql(1);

          template.permission['http://openpermissions.org/ns/temporary_id/perm1'].data[key].should.eql([{'@id': id}]);
        });
      });
    });

    describe('prohibition', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/prohibition': [
            {
              '@id': 'http://openpermissions.org/ns/id/prohib1'
            }
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/prohib1',
          '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/constraint',
          '@type': ['http://www.w3.org/ns/odrl/2/Constraint']
        }
      ];
      let template = new OfferTemplate();
      template.loadOffer(data);
      it('should add new constraint to prohibition', function () {
        Object.keys(template.constraint).length.should.eql(1);
        let key = ['http://www.w3.org/ns/odrl/2/constraint'];
        let id = 'http://openpermissions.org/ns/temporary_id/constraint';

        template.addEntity({id: 'http://openpermissions.org/ns/temporary_id/prohib1', type: 'prohibition'}, 'constraint', key, id);
        Object.keys(template.constraint).length.should.eql(1);
        template.prohibition['http://openpermissions.org/ns/temporary_id/prohib1'].data[key].should.eql([{'@id': id}]);
      });
    });


    describe('duty', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/duty': [
            {
              '@id': 'http://openpermissions.org/ns/id/duty1'
            }
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/duty1',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/constraint',
          '@type': ['http://www.w3.org/ns/odrl/2/Constraint']
        }
      ];
      let template = new OfferTemplate();
      template.loadOffer(data);
      it('should add new constraint to duty', function () {
        Object.keys(template.constraint).length.should.eql(1);
        let key = ['http://www.w3.org/ns/odrl/2/constraint'];
        let id = 'http://openpermissions.org/ns/temporary_id/constraint';

        template.addEntity({id: 'http://openpermissions.org/ns/temporary_id/duty1', type: 'duty'}, 'constraint', key, id);
        Object.keys(template.constraint).length.should.eql(1);
        template.duty['http://openpermissions.org/ns/temporary_id/duty1'].data[key].should.eql([{'@id': id}]);
      });
    });

    describe('invalid', function () {
      let data = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/duty': [
            {
              '@id': 'http://openpermissions.org/ns/id/duty1'
            }
          ]
        },
        {
          '@id': 'http://openpermissions.org/ns/id/duty1',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/duty2',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty']
        },
        {
          '@id': 'http://openpermissions.org/ns/id/constraint',
          '@type': ['http://www.w3.org/ns/odrl/2/Constraint']
        }
      ];

      let template = new OfferTemplate();
      template.loadOffer(data);
      let key = ['http://www.w3.org/ns/odrl/2/duty']

      it('should throw an error if the parent type is invalid', function () {
        template.addEntity.bind(template, {id: 'foo', type:'bar'}, 'duty', key, 'http://openpermissions.org/ns/temporary_id/duty1').should.throw('Invalid parent with type bar and id foo')
      });
      it('should throw an error if the parent does not exist', function () {
        template.addEntity.bind(template, {id: 'foo', type:'permission'}, 'duty', key, 'http://openpermissions.org/ns/temporary_id/duty1').should.throw('Invalid parent with type permission and id foo')
      });
      it('should throw an error if the type is invalid', function () {
        template.addEntity.bind(template, {id: 'foo', type:'bar'}, 'foo', key, 'http://openpermissions.org/ns/temporary_id/duty1').should.throw('Invalid type foo')
      });
      it('should throw an error if try to add an invalid entity type', function () {
        template.addEntity.bind(template, {id: '1', type:'offer'}, 'constraint', key, 'http://openpermissions.org/ns/temporary_id/duty1').should.throw('Cannot add a constraint to a offer')
      });
      it('should throw an error if try to add an invalid entity', function () {
        template.addEntity.bind(template, {id: '1', type:'offer'}, 'duty', key, 'http://openpermissions.org/ns/temporary_id/duty3').should.throw('duty http://openpermissions.org/ns/temporary_id/duty3 does not exist')
      });
      it('should throw an error if try to add an entity that already belongs to parent', function () {
        template.addEntity.bind(template, {id: '1', type:'offer'}, 'duty', key, 'http://openpermissions.org/ns/temporary_id/duty1').should.throw('duty http://openpermissions.org/ns/temporary_id/duty1 has already been added to offer 1')
      });
    })
  });


  describe('removeEntity', function() {
    let data = [
      {
        '@type': [
          'http://openpermissions.org/ns/op/1.1/Policy',
          'http://www.w3.org/ns/odrl/2/Asset',
          'http://www.w3.org/ns/odrl/2/Policy',
          'http://www.w3.org/ns/odrl/2/Offer'
        ],
        'http://www.w3.org/ns/odrl/2/duty': [
          {
            '@id': 'http://openpermissions.org/ns/id/duty1'
          },
          {
            '@id': 'http://openpermissions.org/ns/id/duty2'
          }
        ]
      },
      {
        '@id': 'http://openpermissions.org/ns/id/duty1',
        '@type': ['http://www.w3.org/ns/odrl/2/Duty']
      }
    ];

    let template = new OfferTemplate();
    template.loadOffer(data);

    it('should remove entity from data of parent', function () {
      template.removeEntity({id: '1', type:'offer'}, 'http://www.w3.org/ns/odrl/2/duty', 'http://openpermissions.org/ns/temporary_id/duty1');
      template.offer.data['http://www.w3.org/ns/odrl/2/duty'].should.eql([{'@id': 'http://openpermissions.org/ns/temporary_id/duty2'}])
    });

    it('should remove entity key if there are no more entities belonging to parent parent', function () {
      template.removeEntity({id: '1', type:'offer'}, 'http://www.w3.org/ns/odrl/2/duty', 'http://openpermissions.org/ns/temporary_id/duty2');
      Object.keys(template.offer.data).indexOf('http://www.w3.org/ns/odrl/2/duty').should.eql(-1);
    });

    describe('invalid', function () {
      let template = new OfferTemplate();
      it('should throw an error if the parent type is invalid', function () {
        template.removeEntity.bind(template, {id: 'foo', type:'bar'}, 'http://www.w3.org/ns/odrl/2/duty', 'id1').should.throw('Invalid parent with type bar and id foo')
      });
      it('should throw an error if the parent does not exist', function () {
        template.removeEntity.bind(template, {id: 'foo', type:'permission'}, 'http://www.w3.org/ns/odrl/2/duty', 'id1').should.throw('Invalid parent with type permission and id foo')
      });

      it('should throw an error if the entity to remove does not belong to parent', function () {
        template.removeEntity.bind(template, {id: 'offer1', type:'offer'}, 'http://www.w3.org/ns/odrl/2/duty', 'foo').should.throw('Entity foo does not belong to parent')
      });
    })
  });

  describe('constructOffer', function () {
    let data = [
      {
        '@type': [
          'http://openpermissions.org/ns/op/1.1/Policy',
          'http://www.w3.org/ns/odrl/2/Asset',
          'http://www.w3.org/ns/odrl/2/Policy',
          'http://www.w3.org/ns/odrl/2/Offer'
        ],
        'http://www.w3.org/ns/odrl/2/permission': [{'@id': 'http://openpermissions.org/ns/id/perm1'}],
        'http://www.w3.org/ns/odrl/2/duty': [{'@id': 'http://openpermissions.org/ns/id/duty1'}]
      },
      {
        '@id': 'http://openpermissions.org/ns/id/perm1',
        '@type': ['http://www.w3.org/ns/odrl/2/Permission', 'http://www.w3.org/ns/odrl/2/Rule'],
        'http://www.w3.org/ns/odrl/2/duty': [{'@id': 'http://openpermissions.org/ns/id/duty2'}],
        'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/id/constraint2'}]
      },
      {
        '@id': 'http://openpermissions.org/ns/id/perm2',
        '@type': ['http://www.w3.org/ns/odrl/2/Permission']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/prohib1',
        '@type': ['http://www.w3.org/ns/odrl/2/Prohibition', 'http://www.w3.org/ns/odrl/2/Rule'],
        'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/id/constraint1'}]
      },
      {
        '@id': 'http://openpermissions.org/ns/id/prohib2',
        '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/duty1',
        '@type': ['http://www.w3.org/ns/odrl/2/Duty'],
        'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/id/constraint2'}]
      },
      {
        '@id': 'http://openpermissions.org/ns/id/duty2',
        '@type': ['http://www.w3.org/ns/odrl/2/Duty', 'http://www.w3.org/ns/odrl/2/Rule'],
        'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/id/constraint2'}]
      },
      {
        '@id': 'http://openpermissions.org/ns/id/duty3',
        '@type': ['http://www.w3.org/ns/odrl/2/Duty', 'http://www.w3.org/ns/odrl/2/Rule'],
        'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/id/constraint3'}]
      },
      {
        '@id': 'http://openpermissions.org/ns/id/constraint1',
        '@type': ['http://www.w3.org/ns/odrl/2/Constraint']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/constraint2',
        '@type': ['http://www.w3.org/ns/odrl/2/Constraint', 'http://www.w3.org/ns/odrl/2/Rule']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/constraint3',
        '@type': ['http://www.w3.org/ns/odrl/2/Constraint']
      }
    ];


    let template = new OfferTemplate();
    template.loadOffer(data)

    it('should build a JSONLD offer from template', function () {
      let newData = [
        {
          '@type': [
            'http://openpermissions.org/ns/op/1.1/Policy',
            'http://www.w3.org/ns/odrl/2/Asset',
            'http://www.w3.org/ns/odrl/2/Policy',
            'http://www.w3.org/ns/odrl/2/Offer'
          ],
          'http://www.w3.org/ns/odrl/2/permission': [{'@id': 'http://openpermissions.org/ns/temporary_id/perm1'}],
          'http://www.w3.org/ns/odrl/2/duty': [{'@id': 'http://openpermissions.org/ns/temporary_id/duty1'}]
        },
        {
          '@id': 'http://openpermissions.org/ns/temporary_id/perm1',
          '@type': ['http://www.w3.org/ns/odrl/2/Permission',
                    'http://www.w3.org/ns/odrl/2/Rule'],
          'http://www.w3.org/ns/odrl/2/duty': [{'@id': 'http://openpermissions.org/ns/temporary_id/duty2'}],
          'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/temporary_id/constraint2'}]
        },
        {
          '@type': ['http://www.w3.org/ns/odrl/2/Constraint',
                    'http://www.w3.org/ns/odrl/2/Rule'],
          '@id': 'http://openpermissions.org/ns/temporary_id/constraint2'
        },
        {
          '@id': 'http://openpermissions.org/ns/temporary_id/duty1',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty'],
          'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/temporary_id/constraint2'}]
        },
        {
          '@id': 'http://openpermissions.org/ns/temporary_id/duty2',
          '@type': ['http://www.w3.org/ns/odrl/2/Duty',
                    'http://www.w3.org/ns/odrl/2/Rule'],
          'http://www.w3.org/ns/odrl/2/constraint': [{'@id': 'http://openpermissions.org/ns/temporary_id/constraint2'}]
        }
      ];
    let result = template.constructOffer();
      JSON.parse(result).should.eql(newData);
    })
  });

  describe ('toJS', function () {
    let data = [
      {
        '@type': [
          'http://www.w3.org/ns/odrl/2/Offer'
        ],
        '@id': 'http://openpermissions.org/ns/id/offer1'
      },
      {
        '@id': 'http://openpermissions.org/ns/id/perm1',
        '@type': ['http://www.w3.org/ns/odrl/2/Permission']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/prohib1',
        '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
      },
      {
        '@id': 'http://openpermissions.org/ns/id/duty1',
        '@type': ['http://www.w3.org/ns/odrl/2/Duty']
      },
      {
        '@type': ['http://www.w3.org/ns/odrl/2/Constraint'],
        '@id': 'http://openpermissions.org/ns/id/constraint1'
      },
      {
        '@type': ['http://www.w3.org/ns/odrl/2/Asset'],
        '@id': 'http://openpermissions.org/ns/id/set1',
        'http://openpermissions.org/ns/op/1.1/fromSet': {'@id': 'http://openpermissions.org/ns/id/set1'}
      }
    ];
    let template = new OfferTemplate();
    template.loadOffer(data);
    it('should convert an OfferTemplate class to a flat JS object', function () {
      let result = template.toJS();
      result.should.be.eql({
        offer: {
          template: `
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
    }`,
          data: {
            '@type': [
              'http://www.w3.org/ns/odrl/2/Offer'
            ],
            '@id':'http://openpermissions.org/ns/temporary_id/offer1'
          },
          fields: [
            {
              key: ['http://purl.org/dc/terms/title', '0', '@value'],
              title: 'Title',
              placeholder: 'Title',
              uiClass: 'text-input',
              required: true,
              mutable: true
            },
            {
              key: ['http://openpermissions.org/ns/op/1.1/policyDescription', '0', '@value'],
              title: 'Policy Description',
              placeholder: 'Description',
              uiClass: 'text-area',
              required: true,
              mutable: true
            },
            {
              key: ['http://openpermissions.org/ns/op/1.1/policyText', '0', '@value'],
              title: 'Policy Text',
              placeholder: 'Text',
              uiClass: 'text-area',
              required: false,
              mutable: true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/permission'],
              type: 'permission',
              uiClass: 'odrl-list',
              required: false,
              mutable: true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/prohibition'],
              type: 'prohibition',
              uiClass: 'odrl-list',
              required: false,
              mutable: true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/target'],
              type: 'target',
              uiClass: 'odrl-list',
              required: false,
              mutable: true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/duty'],
              type: 'duty',
              uiClass: 'odrl-list',
              required: false,
              mutable: true
            }
          ],
          uiClass: 'offer'
        },
        permission:{
          'http://openpermissions.org/ns/temporary_id/perm1': {
            template: `
    {
      "{odrl}action": [{
          "@id": ""
      }],
      "@id": "{tempId}{id}",
      "@type": [
          "{odrl}Rule",
          "{odrl}{type}"
      ]
    }`,
            data: {
              '@id': 'http://openpermissions.org/ns/temporary_id/perm1',
              '@type': ['http://www.w3.org/ns/odrl/2/Permission']
            },
            fields: [{
              key: ['http://www.w3.org/ns/odrl/2/action', '0', '@id'],
              title: 'Action',
              uiClass: 'action-dropdown',
              required: true,
              mutable: true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/constraint'],
              type: 'constraint',
              uiClass: 'odrl-list',
              required: false,
              mutable: true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/duty'],
              type: 'duty',
              uiClass: 'odrl-list',
              required: false,
              mutable: true
            }],
            uiClass: 'rule'
          }
        },
        prohibition: {
          'http://openpermissions.org/ns/temporary_id/prohib1': {
            template: `
    {
      "{odrl}action": [{
          "@id": ""
      }],
      "@id": "{tempId}{id}",
      "@type": [
          "{odrl}Rule",
          "{odrl}{type}"
      ]
    }`,
            data: {
              '@id': 'http://openpermissions.org/ns/temporary_id/prohib1',
              '@type': ['http://www.w3.org/ns/odrl/2/Prohibition']
            },
            fields: [{
              key: ['http://www.w3.org/ns/odrl/2/action', '0', '@id'],
              title: 'Action',
              uiClass: 'action-dropdown',
              required: true,
              mutable: true
            },
              {
                key: ['http://www.w3.org/ns/odrl/2/constraint'],
                type: 'constraint',
                uiClass: 'odrl-list',
                required: false,
                mutable: true
              }],
            uiClass: 'rule'
          }
        },
        constraint: {
          'http://openpermissions.org/ns/temporary_id/constraint1': {
            template: `
    {
      "@id": "{tempId}{id}",
      "@type": [
        "{odrl}Constraint",
        "{opex}Constraint"
      ]
    }`,
            data: {
              '@type': ['http://www.w3.org/ns/odrl/2/Constraint'],
              '@id': 'http://openpermissions.org/ns/temporary_id/constraint1'
            },
            fields: [{
              key: ['http://www.w3.org/ns/odrl/2/operator', '0', '@id'],
              title: 'Operator',
              uiClass: 'operator-dropdown',
              required: true,
              mutable:true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/unit', '0', '@id'],
              title: 'Unit',
              uiClass: 'unit-dropdown',
              required: false,
              mutable: true
            }],
            uiClass: 'constraint'
          }
        },
        duty: {
          'http://openpermissions.org/ns/temporary_id/duty1': {
            template: `
    {
      "{odrl}action": [{
          "@id": ""
      }],
      "@id": "{tempId}{id}",
      "@type": [
          "{odrl}Rule",
          "{odrl}{type}"
      ]
    }`,
            data: {
              '@id': 'http://openpermissions.org/ns/temporary_id/duty1',
              '@type': ['http://www.w3.org/ns/odrl/2/Duty']
            },
            fields: [{
              key: ['http://www.w3.org/ns/odrl/2/action', '0', '@id'],
              title: 'Action',
              uiClass: 'action-dropdown',
              required: true,
              mutable: true
            },
            {
              key: ['http://www.w3.org/ns/odrl/2/constraint'],
              type: 'constraint',
              uiClass: 'odrl-list',
              required: false,
              mutable: true
            }],
            uiClass: 'rule'
          }
        },
        target: {
          'http://openpermissions.org/ns/temporary_id/set1': {
            template: `
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
    }`,
            data: {
              '@type': ['http://www.w3.org/ns/odrl/2/Asset'],
              '@id': 'http://openpermissions.org/ns/temporary_id/set1',
              'http://openpermissions.org/ns/op/1.1/fromSet': [{'@id': 'http://openpermissions.org/ns/temporary_id/set1'}]
            },
            fields: [{
              key: ['http://openpermissions.org/ns/op/1.1/count', '0', '@value'],
              title: 'Count',
              uiClass: 'integer-input',
              required: true,
              mutable:true
            },
            {
              key: ['http://openpermissions.org/ns/op/1.1/fromSet', '0', '@id'],
              title: 'Set',
              uiClass: 'text-input',
              required: true,
              mutable: true
            }],
            uiClass: 'target'
          }
        }
      })
    })
  })
});
