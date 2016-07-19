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

var should = require('should'),
    rewire = require('rewire'),
    accApi = require('../api'),
    repoApi = require('../repository-api'),
    authApi = require('../authentication-api'),
    sinon = require('sinon'),
    Actions = require('../../scripts/src/actions/actions');


var actions = new Actions(accApi.api, repoApi.api, authApi.api);

describe('actions', function () {
  describe('loadOffer', function () {
    var offer, dispose;
    //
    before(function () {
      dispose = actions.initialOffer.onValue(v => offer = v);
      //MUT
      actions.loadOffer.push({repositoryId: 'repo1', offerId: 'offer1'});
    });

    after(function () {
      dispose();
      repoApi.reset();
    });

    it('should make a getOffer api request', function () {
      repoApi.api.getOffer.calledOnce.should.be.true;
      repoApi.api.getOffer.calledWith('repo1', 'offer1').should.be.true;
    });

    it('should pass the initial Offer to the initialOffer event stream', function () {
      let data = {
        "@context": {
          "id": "http://openpermissions.org/ns/id/",
          "@vocab": "http://www.w3.org/ns/odrl/2/"
        },
        "@graph": [
          {
            "@id": "id:12",
            "@type": [
              "Offer"
            ]
          }
        ]
      };
      offer.should.eql(data);
    });
  });

  describe('saveOffer', function () {
    var savedOffer, dispose;
    //
    before(function () {
      dispose = actions.savedOffer.onValue(v => savedOffer = v);
      //MUT
      actions.saveOffer.push({repositoryId: 'repo1'});
    });

    after(function () {
      dispose();
      repoApi.reset();
    });

    it('should trigger a saveOffer api request', function () {
      repoApi.api.saveOffer.calledOnce.should.be.true;
      repoApi.api.saveOffer.calledWith('repo1', ['graph']).should.be.true;
    });

    it('should pass the response to the savedOffer event stream', function () {
      savedOffer.should.eql({repositoryId: 'repo1', offerId: "dce9183a67f4424fb4d18917648eaf80"});
    });

    //it ('should trigger a getOffers request', function () {
    //  repoApi.api.getOffers.calledOnce.should.be.true;
    //  repoApi.api.getOffers.calledWith('repo1').should.be.true;
    //});
  });

  describe('getOffers', function() {
    var offers, dispose;
    //
    before(function () {
      dispose = actions.offers.onValue(v => offers = v);
      //MUT
      actions.getOffers.push({repositoryId: 'repo1'});
    });

    after(function () {
      dispose();
      repoApi.reset();
    });

    it('should trigger a getOffers request', function () {
      repoApi.api.getOffers.calledOnce.should.be.true;
      repoApi.api.getOffers.calledWith('repo1').should.be.true;
    });

    it('should pass a list of offers to the offers event stream', function () {
      offers.should.eql([
        {
          "offer_id": "34011e5241a24760a55620594e97041f",
          "last_modified": "2016-03-03T16:29:00+00:00"
        },
        {
          "offer_id": "f77120dc7b32465e9f829d7ab6e332f0",
          "last_modified": "2016-03-03T16:29:00+00:00"
        }
      ]);
    });
  });

  describe('getOffers no args', function() {
    var offers, dispose;
    //
    before(function () {
      dispose = actions.offers.onValue(v => offers = v);
      //MUT
      actions.getOffers.push();
    });

    after(function () {
      dispose();
      repoApi.reset();
    });

    it('should not trigger a getOffers request', function () {
      repoApi.api.getOffers.calledOnce.should.be.false;
    });

    it('should pass an empty list to the offers event stream', function () {
      offers.should.eql([]);
    });
  });

  describe('getRepoToken', function() {
    before(function () {
      actions.getRepoToken.push({serviceId: 'service1', scope: 'read'});
    });

    after(function () {
      accApi.reset();
      authApi.reset();
    });

    it('should trigger a getSecrets request', function () {
      accApi.api.getSecrets.calledOnce.should.be.true;
    });

    it('should trigger a getToken request', function () {
      authApi.api.getToken.calledOnce.should.be.true;
      authApi.api.getToken.calledWith('service1', '1234', 'read').should.be.true;
    });

    it('should set token on the repositoryClient', function () {
      repoApi.api.token.should.be.eql('token');
    });
  })
});
