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
/*global describe, it, before, beforeEach, after, afterEach*/
/*jshint -W030 */

var _ = require('lodash'),
    sinon = require('sinon'),
    should = require('should'),
    Bacon = require('baconjs'),
    Store = require('../../scripts/src/store');

var streams = _.transform([
    'loggedIn',
    'logout',
    'authenticated',
    'verified',
    'users',
    'updatedUser',
    'roles',
    'selectOrganisation',
    'deletedOrganisation',
    'updatedOrganisation',
    'organisations',
    'services',
    'orgServices',
    'serviceTypes',
    'service',
    'deletedService',
    'navigate',
    'secrets',
    'passwordChanged',
    'orgRepositories',
    'repository',
    'deletedRepository',
    'repositories',
    'offerJSON',
    'savedOffer',
    'offers'
  ], (result, k) => result[k] = new Bacon.Bus(), {});

var pages = {
  '/login': {page: 'login'},
  '/offers': {page: 'offers'},
  defaultPaths: {
    login: '/login'
  }
};

var store = new Store(streams, pages);

describe('store', () => {
  var dispose;
  afterEach(() => {
    dispose && dispose();
  });

  describe('offer template', () => {
    it('should set template on "offerJSON"', done => {
      var data = {
        offer: 'offer',
        permissions: 'permission'
      };

      dispose = store.app.changes().map('.toJS').map('.template')
        .onValue(offer => {
          offer.should.eql(data);
        done();
      });
      streams.offerJSON.push(data);
    })
  });

  describe('saved offer', () => {
    it('should set template offerId on "savedOffer"', done => {
      var data = {
        repositoryId: 'repo1',
        offerId: '1234'
      };

      dispose = store.app.changes().map('.toJS').map('.template')
        .onValue(offer => {
          offer['offerId'].should.eql('1234');
        done();
      });
      streams.savedOffer.push(data);
    })
  })

  describe('get offers', () => {
    it('should set offers "offers"', done => {
      var data = [
        {
          "offer_id": "34011e5241a24760a55620594e97041f",
          "last_modified": "2016-03-03T16:29:00+00:00",
          "title": "Title 1"
        },
        {
          "offer_id": "f77120dc7b32465e9f829d7ab6e332f0",
          "last_modified": "2016-03-03T16:29:00+00:00",
          "title": "Title 2"
        }
      ];

      dispose = store.app.changes().map('.toJS').map('.offers')
        .onValue(offers => {
          offers.should.eql(data);
        done();
      });
      streams.offers.push(data);
    })
  })
});
