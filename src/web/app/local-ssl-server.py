"""
This script runs the FlaskWebProject1 application using a development server.
"""

import BaseHTTPServer, SimpleHTTPServer
import ssl

httpd = BaseHTTPServer.HTTPServer(('0.0.0.0', 8443), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, keyfile='../../ldap.key',certfile='../../ldap.crt',server_side=True)
httpd.serve_forever()

