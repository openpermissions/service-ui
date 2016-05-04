# -*- coding: utf-8 -*-

# Based On:
# https://gist.github.com/chrisbolin/2e90bc492270802d00a6#file-serve-py

# Wrapper around python's SimpleHTTPServer
# If url path does not match a file on disk, redirect
# to index.html so that React can handle the routing.

# Useful for development / testing purposes.


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
            # send index.html
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            with open('index.html', 'r') as fin:
                self.copyfile(fin, self.wfile)

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
