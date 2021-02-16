"""
The flask application package.
"""

from flask import Flask
app = Flask(__name__)
# app.secret_key = '41591ab5ba79aa4da0653ea5'
import titan_sever.views
