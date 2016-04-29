# -*- coding: utf-8 -*-
# Copyright 2016 Open Permissions Platform Coalition

# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License. You may obtain a copy
# of the License at http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

# See the License for the specific language governing permissions and
# limitations under the License.
"""
 Wrapper around python's SimpleHTTPServer
 If url path does not match a file on disk, redirect
 to index.html so that React can handle the routing.
"""

import SimpleHTTPServer
import SocketServer
import urlparse
import os

PORT = 1234


class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):

        # Parse query data to find out what was requested
        parsed_params = urlparse.urlparse(self.path)

        # See if the file requested exists
        if os.access('.' + os.sep + parsed_params.path, os.R_OK):
            # File exists, serve it up
            SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        else:
            # send index.hmtl
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            with open('index.html', 'r') as fin:
                self.copyfile(fin, self.wfile)

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
