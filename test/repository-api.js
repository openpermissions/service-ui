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
var _ = require('lodash'),
    sinon = require('sinon'),
    sinonAsPromised = require('sinon-as-promised');

var mockApi = {
  getOffer: sinon.stub().resolves(
    {body: {
      "data": {
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
      }
    }
  }),
  getOffers: sinon.stub().resolves(
    {"body": {
      "data": {
        "offers": [
          {
            "offer_id": "34011e5241a24760a55620594e97041f",
            "last_modified": "2016-03-03T16:29:00+00:00"
          },
          {
            "offer_id": "f77120dc7b32465e9f829d7ab6e332f0",
            "last_modified": "2016-03-03T16:29:00+00:00"
          }
        ]
      }
    }
  }),
  saveOffer: sinon.stub().resolves(
    {body: {
      "data": {
          "id": "dce9183a67f4424fb4d18917648eaf80"
      }
    }
  })
};


module.exports = {
  /**
   * Reset the spies on the mocked out API client
   */
  reset: function () {
    _.each(mockApi, spy => {
      if (spy) {
        spy.reset()
      }
    });
  },
  /**
   * API client stubs
   */
  api: mockApi
};
