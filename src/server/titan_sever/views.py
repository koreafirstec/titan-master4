# -*- coding: utf-8 -*-
from titan_sever import app
from flask_restful import reqparse, Resource, Api

from .models import *
import platform
import secrets
from flask import Flask, request, session, escape, redirect, url_for, render_template
from flask_session import Session
from flask import Response
from flask import jsonify
import time
import hashlib
import base64
import json
import os
import logging
from logging import handlers
from sqlalchemy import or_, and_, sql, func, extract
from datetime import datetime, timedelta
import traceback
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import or_, and_
from sqlalchemy import ext
from sqlalchemy import distinct
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import random, string

from configparser import ConfigParser
import csv
from werkzeug import secure_filename
import re
from flask_cors import CORS
from openpyxl import load_workbook
import numpy as np
from numpy import random
import cv2
import glob
import pafy
import string
import secrets
import shutil
import webbrowser
from youtubesearchpython import SearchVideos

from urllib.request import urlopen
import requests as req
from bs4 import BeautifulSoup
import requests
from urllib.request import urlretrieve

############# AI PART #######################################################
import tensorflow as tf
# from .datasets import data as dataset
# from .models_.nn import YOLO as ConvNet
# from .learning.evaluators import RecallEvaluator as Evaluator
# from .learning.utils import draw_pred_boxes, predict_nms_boxes, convert_boxes
# from .learning.optimizers import MomentumOptimizer as Optimizer

import torch
# from .ai.models.experimental import attempt_load
# from .ai.utils.general import check_img_size, check_requirements, non_max_suppression, apply_classifier, scale_coords, xyxy2xywh, strip_optimizer, set_logging, increment_path
# from .ai.utils.plots import plot_one_box
# from .ai.utils.torch_utils import select_device

from .ai.models.experimental import attempt_load
from .ai.models.datasets import letterbox
from .ai.models.general import check_img_size, check_requirements, non_max_suppression, apply_classifier, scale_coords, xyxy2xywh, strip_optimizer, set_logging, increment_path
from .ai.models.plots import plot_one_box
from .ai.models.torch_utils import select_device
#############################################################################

############# ACGAN #########################################################
from .acgan import discriminator_bottom
#############################################################################

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from oauth2client.tools import argparser
# from importlib import reload

UPLOAD_FOLDER = '../web/app/images/uploads'
MAKE_IMAGE_DIR = '../web/app/make_image/'
MODEL_IMAGE_DIR = '../web/app/model_file/'
MODIFY_IMAGES_DIR = '../web/app/modify_images/'
UPLOAD_BUILDER_IMAGES_DIR = '../web/app/images/builder_uploads/'
BUILDER_GENERATED_IMAGES_DIR = '../web/app/images/builder_generated/'
CRAWLER_IMAGES_DIR = '../web/app/images/crawling/'
MODEL_DIR = './titan_sever/ai_model/'

ALL_EXTENSIONS = ['png', 'jpg', 'jpg', 'jpeg']

ALLOWED_EXTENSIONS = set(['png'])
ALLOWED_EXTENSIONS2 = set(['jpg'])
ALLOWED_EXTENSIONS3 = set(['JPG'])
ALLOWED_EXTENSIONS4 = set(['PNG'])

ALLOWED_EXTENSIONS_EXCEL1 = set(['xlsx'])
ALLOWED_EXTENSIONS_EXCEL2 = set(['XLSX'])

COMPANY_NAME = 'KOREAFIRSTEC'

password = ''


def read_from_file(filename, section, required_props=None):
    config_parser = ConfigParser()
    config_parser.optionxform = str
    data = dict()

    try:
        data_set = config_parser.read(filename)
        if len(data_set) == 0:
            return None

        if section not in config_parser.sections():
            return dict()

        for k, v in config_parser.items(section):
            data[k] = v

        return data

    except:
        print("read_from_file Open  file failed ")
        return None


config = None
config = read_from_file('./config.ini', 'info')
DB_INFO = config['DB_INFO'].replace("\"", "")

PRINT_LOG = True
print("DB_INFO : " + DB_INFO)
app.config['SQLALCHEMY_DATABASE_URI'] = DB_INFO
app.config['SECRET_KEY'] = '41591ab5ba79aa4da0653ea5'



db.init_app(app)

var_cros_v1 = {'Content-Type', 'token', 'If-Modified-Since', 'Cache-Control', 'Pragma'}
CORS(app, resources=r'/api/*', headers=var_cros_v1)

# Multilanguages
import sys

# reload(sys)
# sys.setdefaultencoding('utf-8')

# --------------------------------------------------------------------------------------------------------------------
#                                            Static Area
# --------------------------------------------------------------------------------------------------------------------
DAEMON_HEADERS = {'Content-type': 'application/json'}

g_platform = platform.system()

if g_platform == "Linux":
    LOG_DEFAULT_DIR = './log'
elif g_platform == "Windows":
    LOG_DEFAULT_DIR = '.'
elif g_platform == "Darwin":
    LOG_DEFAULT_DIR = '.'


# --------------------------------------------------------------------------------------------------------------------
#                                            Function Area
# --------------------------------------------------------------------------------------------------------------------

def result(code, notice, objects, meta, author):
    """
    html status code def
    [ 200 ] - OK
    [ 400 ] - Bad Request
    [ 401 ] - Unauthorized
    [ 404 ] - Not Found
    [ 500 ] - Internal Server Error
    [ 503 ] - Service Unavailable
    - by thingscare
    """
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

    if author is None:
        author = "by koreafirstec"

    result = {
        "status": code,
        "notice": notice,
        "author": author
    }

    log_bySisung = ''

    # [ Check ] Objects
    if objects is not None:
        result["objects"] = objects

    # [ Check ] Meta
    if meta is not None:
        result["meta"] = meta

    if code == 200:
        result["message"] = "OK"
        log_bySisung = OKBLUE
    elif code == 400:
        result["message"] = "Bad Request"
        log_bySisung = FAIL
    elif code == 401:
        result["message"] = "Unauthorized"
        log_bySisung = WARNING
    elif code == 404:
        result["message"] = "Not Found"
        log_bySisung = FAIL
    elif code == 500:
        result["message"] = "Internal Server Error"
        log_bySisung = FAIL
    elif code == 503:
        result["message"] = "Service Unavailable"
        log_bySisung = WARNING

    # log_bySisung = log_bySisung + 'RES : [' + str(code) + '] ' + str(notice) + ENDC
    # print log_bySisung
    return result


# --------------------------------------------------------------------------------------------------------------------
#                                            Class Area
# --------------------------------------------------------------------------------------------------------------------
class Helper(object):
    @staticmethod
    def get_file_logger(app_name, filename):
        log_dir_path = LOG_DEFAULT_DIR
        try:
            if not os.path.exists(log_dir_path):
                os.mkdir(log_dir_path)

            full_path = '%s/%s' % (log_dir_path, filename)
            file_logger = logging.getLogger(app_name)
            file_logger.setLevel(logging.INFO)

            file_handler = handlers.RotatingFileHandler(
                full_path,
                maxBytes=(1024 * 1024 * 10),
                backupCount=5
            )
            formatter = logging.Formatter('%(asctime)s %(message)s')

            file_handler.setFormatter(formatter)
            file_logger.addHandler(file_handler)

            return file_logger

        except:
            return logging.getLogger(app_name)


exception_logger = Helper.get_file_logger("exception", "exception.log")
service_logger = Helper.get_file_logger("service", "service.log")


def Log(msg, log_type='service'):
    try:
        if PRINT_LOG == True:
            print(msg)
        if log_type == 'service':
            service_logger.info(msg)
        elif log_type == 'model':
            model_logger.info(msg)
    except:
        print("log exception!!")


@app.errorhandler(500)
def internal_error(exception):
    exception_logger.info(traceback.format_exc())
    return 500


@app.errorhandler(404)
def internal_error(exception):
    exception_logger.info(traceback.format_exc())
    return 404


# Singleton Source from http://stackoverflow.com/questions/42558/python-and-the-singleton-pattern
class Singleton:
    """
    A non-thread-safe helper class to ease implementing singletons.
    This should be used as a decorator -- not a metaclass -- to the
    class that should be a singleton.
    The decorated class can define one `__init__` function that
    takes only the `self` argument. Other than that, there are
    no restrictions that apply to the decorated class.
    To get the singleton instance, use the `Instance` method. Trying
    to use `__call__` will result in a `TypeError` being raised.
    Limitations: The decorated class cannot be inherited from.
    """

    def __init__(self, decorated):
        self._decorated = decorated

    def instance(self):
        """
        Returns the singleton instance. Upon its first call, it creates a
        new instance of the decorated class and calls its `__init__` method.
        On all subsequent calls, the already created instance is returned.
        """
        try:
            return self._instance
        except AttributeError:
            self._instance = self._decorated()
            return self._instance

    def __call__(self):
        raise TypeError('Singletons must be accessed through `Instance()`.')

    def __instancecheck__(self, inst):
        return isinstance(inst, self._decorated)


@Singleton
class TokenManager(object):
    def generate_token(self, user_id):
        m = hashlib.sha1()
        print("user_id : ", user_id)
        m.update(user_id.encode('utf-8'))
        m.update(datetime.now().isoformat().encode('utf-8'))
        return m.hexdigest()

    def validate_token(self, token):
        token_result = TB_USER.query.filter_by(token=token).first()

        if token_result is None:
            return ""
        return token_result.user_id


def json_encoder(thing):
    list_date = str(thing).split(":")

    if hasattr(thing, 'isoformat'):
        if len(list_date[0]) == 1:
            return "0" + thing.isoformat()
        return thing.isoformat()
    else:
        if len(list_date[0]) == 1:
            return "0" + str(thing)
        return str(thing)


def imread(filename, flags=cv2.IMREAD_COLOR, dtype=np.uint8):
    try:
        n = np.fromfile(filename, dtype)
        img = cv2.imdecode(n, flags)
        return img
    except Exception as e:
        print(e)
        return None


def imwrite(filename, img, params=None):
    try:
        ext = os.path.splitext(filename)[1]
        result, n = cv2.imencode(ext, img, params)
        if result:
            with open(filename, mode='w+b') as f:
                n.tofile(f)
                return True
        else:
            return False
    except Exception as e:
        print(e)
        return False


def Paging(limit, offset, table_list, TABLE, table_name, search_name=None, search_data=None, order_by=None):
    objects = []
    limit = int(limit)
    offset = int(offset)
    total_count = len(table_list)
    if order_by is not None:
        print(order_by)
        list = TABLE.query.order_by(TABLE.create_date.desc()).limit(limit).offset(offset)
    else:
        print(order_by)
        list = TABLE.query.limit(limit).offset(offset)
    current_count = list.count()
    next = ''
    previous = ''
    previous_offset = offset - limit
    next_offset = offset + limit

    if offset == 0:
        previous = None
        next = None
    elif offset != 0:
        previous = "/" + table_name + "?limit=" + str(limit) + "&offset=" + str(previous_offset)
        if search_name is not None:
            previous = previous + "&" + search_name + "=" + str(search_data)
        if (total_count - (offset + current_count)) > limit:
            next = previous
        elif (total_count - (offset + current_count)) <= limit:
            next = None

    meta = {
        "limit": limit,
        "next": next,
        "offset": offset,
        "previous": previous,
        "total_count": total_count
    }
    if current_count == 0:
        meta = {
            "limit": limit,
            "next": 0,
            "offset": offset,
            "previous": 0,
            "total_count": 0
        }
        objects.append({
        })

    return list, objects, current_count, meta


def Paging_filter(limit, offset, TABLE, table_name, filter_and_group, filter_or_group, order_by=None):
    objects = []
    limit = int(limit)
    offset = int(offset)
    total_count = TABLE.query.filter(and_(*filter_and_group)).filter(and_(*filter_or_group)).count()
    if order_by is not None:
        list = TABLE.query.filter(and_(*filter_and_group)).filter(or_(*filter_or_group)).order_by(
            TABLE.create_date.desc()).limit(limit).offset(offset)
    else:
        list = TABLE.query.filter(and_(*filter_and_group)).filter(or_(*filter_or_group)).limit(limit).offset(offset)
    current_count = list.count()
    next = ''
    previous = ''
    previous_offset = offset - limit
    next_offset = offset + limit
    offset_tb = 0

    if offset_tb == 0:
        previous = None
        next = None
    elif offset_tb != 0:
        previous = "/" + table_name + "?limit=" + str(limit) + "&offset=" + str(previous_offset)
        # if search_name is not None:
        #     previous = previous + "&" + search_name + "=" + str(search_data)
        if (total_count - (offset + current_count)) > limit:
            next = previous
        elif (total_count - (offset + current_count)) <= limit:
            next = None

    meta = {
        "limit": limit,
        "next": next,
        "offset": offset,
        "previous": previous,
        "total_count": total_count
    }
    if current_count == 0:
        meta = {
            "limit": limit,
            "next": 0,
            "offset": offset,
            "previous": 0,
            "total_count": 0
        }
        objects.append({
        })

    return list, objects, current_count, meta

def randomword(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))


@app.route('/')
class Login(Resource):
    """
    [ Login ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("LOGIN INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("user_id", type=str, location="json")
        self.parser.add_argument("user_pw", type=str, location="json")
        self.parser.add_argument("access_time", type=str, location="json")
        self.parser.add_argument("access_type", type=str, location="json")
        self.parser.add_argument("access_browser", type=str, location="json")
        self.parser.add_argument("access_platform", type=str, location="json")
        self.token_manager = TokenManager.instance()

        self.user_id = self.parser.parse_args()["user_id"]
        self.user_pw = self.parser.parse_args()["user_pw"]
        self.access_time = self.parser.parse_args()["access_time"]
        self.access_type = self.parser.parse_args()["access_type"]
        self.access_browser = self.parser.parse_args()["access_browser"]
        self.access_platform = self.parser.parse_args()["access_platform"]
        self.access_ip = request.remote_addr
        print("user_id :", self.user_id, "user_pw :", self.user_pw)
        print("access_time :", self.access_time, "access_type :", self.access_type, "access_browser",
              self.access_browser, "access_platform", self.access_platform, "access_ip :", self.access_ip)
        super(Login, self).__init__()

    def get(self):
        user = TB_USER.query.filter_by(user_id=self.user_id).first()
        if user is not None:
            obj = {
                'user_name': user.user_name,
                'user_idx': user.idx,
                'fk_group_idx': user.fk_group_idx
            }
            return result(200, "Login successful.", obj, None, COMPANY_NAME)
        return result(402, "Login failed(Not find User).", None, None, COMPANY_NAME)

    def post(self):
        # try:
        objects = []
        Log("[LOGIN START...]")
        login_user = TB_USER.query.filter_by(user_id=self.user_id).first()

        if login_user is not None and check_password_hash(login_user.user_pw, self.user_pw):
            update_token = self.token_manager.generate_token(self.user_id)
            print("update_token : ", update_token)
            token_input = {
                "token": update_token
            }
            print("token obj : ", token_input)
            db.session.query(TB_USER).filter_by(user_id=self.user_id).update(token_input)
            print("token updated..")
            # log_insert = TB_USER_ACCESS_HIST(
            #     log_insert_object[''],
            #     log_insert_object['']
            # )
            log_insert = TB_USER_ACCESS_HIST()
            log_insert.user_id = self.user_id
            log_insert.access_time = self.access_time
            log_insert.access_type = self.access_type
            log_insert.access_browser = self.access_browser
            log_insert.access_platform = self.access_platform
            log_insert.access_ip = self.access_ip
            db.session.add(log_insert)
            Log("[LOG_INSERT]")
            db.session.commit()
            user = TB_USER.query.filter_by(user_id=self.user_id).first()
            if user is not None:
                if TB_USER.query.filter_by(user_id=self.user_id).first().auth == 1:
                    objects.append({
                        'login': True,
                        'idx': user.idx,
                        'user_id': self.user_id,
                        'user_name': user.user_name,
                        'fk_group_idx': user.fk_group_idx,
                        'token': update_token,
                        'user_right': 0
                    })
                    Log("[Login SUCCESS]")
                    return result(200, "Login successful.", objects, None, COMPANY_NAME)
                else:
                    objects.append({
                        'login': False,
                        'idx': '',
                        'user_id': '',
                        'user_name': '',
                        'fk_group_idx': '',
                        'token': '',
                        'user_right': 0
                    })
                    return result(401, "Login failed(not auth).", objects, None, COMPANY_NAME)
        else:
            objects.append({
                'login': False,
                'err_code': 100
            })
        # except :
        #     Log("[Login exception]")
        #     return result(400, "Login exception ", None, None, "by sisung ")
        return result(400, "Login failed.", objects, None, COMPANY_NAME)


class Logout(Resource):
    def __init__(self):
        print("Logout INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        self.access = ''  # Access Control
        self.parser.add_argument("user_id", type=str, location="json")
        self.parser.add_argument("access_time", type=str, location="json")
        self.parser.add_argument("access_type", type=str, location="json")
        self.parser.add_argument("access_browser", type=str, location="json")
        self.parser.add_argument("access_platform", type=str, location="json")
        self.token_manager = TokenManager.instance()

        self.user_id = self.parser.parse_args()["user_id"]
        self.access_time = self.parser.parse_args()["access_time"]
        self.access_type = self.parser.parse_args()["access_type"]
        self.access_browser = self.parser.parse_args()["access_browser"]
        self.access_platform = self.parser.parse_args()["access_platform"]
        self.access_ip = request.remote_addr
        Log("[LOGOUT SUCCESS]")
        print("access_time :", self.access_time, "access_type :", self.access_type, "access_browser",
              self.access_browser,
              "access_platform", self.access_platform)
        super(Logout, self).__init__()

    def post(self):
        objects = []
        log_insert = TB_USER_ACCESS_HIST()
        log_insert.user_id = self.user_id
        log_insert.access_time = self.access_time
        log_insert.access_type = self.access_type
        log_insert.access_browser = self.access_browser
        log_insert.access_platform = self.access_platform
        log_insert.access_ip = self.access_ip
        db.session.add(log_insert)
        # Log("[LOG_INSERT]")
        db.session.commit()
        objects.append({
            'logout': True,
            'user_id': self.user_id,
            'access_time': self.access_time,
            'access_browser': self.access_browser,
            'access_platform': self.access_platform,
            'access_ip': self.access_ip
        })
        return result(200, "Logout success.", objects, None, COMPANY_NAME)

    #
    # def get(self):
    #     return result(200, 'Logout successful', None, None, COMPANY_NAME)


class Join(Resource):
    def __init__(self):
        print("Join INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("user_id", type=str, location="json")
        self.parser.add_argument("user_pw", type=str, location="json")
        self.parser.add_argument("user_name", type=str, location="json")
        self.parser.add_argument("fk_group_idx", type=int, location="json")

        self.token_manager = TokenManager.instance()
        self.user_id = self.parser.parse_args()["user_id"]
        self.user_pw = self.parser.parse_args()["user_pw"]
        self.user_name = self.parser.parse_args()["user_name"]
        self.fk_group_idx = self.parser.parse_args()["fk_group_idx"]
        super(Join, self).__init__()

    def post(self):
        objects = []
        print("[Join START...]")
        user = TB_USER.query.filter_by(user_id=self.user_id).first()
        if user is not None:
            objects.append({
                'join': False
            })
            return result(402, "User is exist", objects, None, COMPANY_NAME)

        new_user = TB_USER()
        new_user.user_id = self.user_id
        new_user.user_pw = generate_password_hash(self.user_pw)
        new_user.user_name = self.user_name
        new_user.fk_group_idx = self.fk_group_idx
        new_user.auth = 1
        new_user.prev_model_item = 0
        db.session.add(new_user)
        db.session.commit()

        objects.append({
            'join': True,
            'user_id': self.user_id
        })
        Log("[Join SUCCESS]")

        return result(200, "Join successful.", objects, None, COMPANY_NAME)

    def get(self):
        user_id = request.args.get('user_id')

        # auth_key = []
        # auth_key[0] = random.randrange(a, z)
        # auth_key[1] = random.randrange(a, z)
        # auth_key[2] = random.randrange(1, 9)
        # auth_key[3] = random.randrange(a, z)
        # auth_key[4] = random.randrange(1, 9)

        # while i > 5:
        auth_id = randomword(5)

        app.config["AUTH_NUMBER"] = auth_id

        # 빨간 거 이메일 주소, 비밀번호니까 이거 회사 이메일로 바꾸기
        app.config['SMTP_SENDER'] = "heock4291@first2000.co.kr"
        app.config['SMTP_ADDR'] = "smtp.gmail.com"
        app.config['SMTP_PORT'] = 465
        app.config['SMTP_LOGIN_ID'] = "jaejin4291@gmail.com"
        app.config['SMTP_LOGIN_PW'] = "lrotgbwsxcdcpczf"

        message = "아래의 링크를 클릭하여 인증을 한 후에 로그인 해주세요.<br><br>"
        link_str = "인증번호 : <strong>" + app.config["AUTH_NUMBER"] + "</strong>"
        message += link_str

        server = smtplib.SMTP_SSL(app.config['SMTP_ADDR'], app.config['SMTP_PORT'])
        server.login(app.config['SMTP_LOGIN_ID'], app.config['SMTP_LOGIN_PW'])

        msg = MIMEMultipart('alternative')
        msg['From'] = "%s <%s>" % ("", app.config['SMTP_SENDER'])
        msg['To'] = user_id
        msg['Subject'] = "TITANS 회원가입 인증메일"

        msg.attach(MIMEText(message, 'html', 'utf-8'))  # 내용 인코딩

        server.sendmail(app.config['SMTP_SENDER'], user_id, msg.as_string())

        auth_number = app.config["AUTH_NUMBER"]
        object = {
            'auth_number': auth_number
        }

        return result(200, "Send email successful.", object, None, None)

class User(Resource):
    def __init__(self):
        print("User INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()

        self.parser.add_argument("user_idx", type=str, location="json")
        self.parser.add_argument("user_id", type=str, location="json")
        self.parser.add_argument("user_pw", type=str, location="json")
        self.parser.add_argument("user_name", type=str, location="json")

        self.user_idx = self.parser.parse_args()["user_idx"]
        self.user_id = self.parser.parse_args()["user_id"]
        self.user_pw = self.parser.parse_args()["user_pw"]
        self.user_name = self.parser.parse_args()["user_name"]

        super(User, self).__init__()

    def get(self):
        print("[GET] User")
        objects = []

        user_idx = request.args.get('user_idx')
        limit = request.args.get('limit')
        offset = request.args.get('offset')

        users = TB_USER.query.all()
        user_info = TB_USER.query.filter_by(idx=user_idx).first()

        if user_info is None:
            return result(404, "[GET] User is not found", None, None, COMPANY_NAME)

        if limit is None:
            if user_info.fk_group_idx == 1:
                objects.append({
                    'idx': user_info.idx,
                    'user_id': user_info.user_id,
                    'user_name': user_info.user_name
                })
                for user in users:
                    if user.idx == user_info.idx:
                        continue
                    objects.append({
                        'idx': user.idx,
                        'user_id': user.user_id,
                        'user_name': user.user_name,
                        'fk_group_idx': user.fk_group_idx
                    })
                return result(200, "[GET] Select users list successful.", objects, None, COMPANY_NAME)
            objects.append({
                'idx': user_info.idx,
                'user_id': user_info.user_id,
                'user_name': user_info.user_name
            })
            return result(200, "[GET] Select user info successful.", objects, None, COMPANY_NAME)
        order_by = 'id desc'
        list, objects, current_count, meta = Paging(limit, offset, users, TB_USER, "user", "user_idx", user_idx,
                                                    order_by)
        if current_count != 0:
            for user in list:
                objects.append({
                    'idx': user.idx,
                    'fk_group_idx': user.fk_group_idx,
                    'user_id': user.user_id,
                    'user_pw': user.user_pw,
                    'user_name': user.user_name
                })
        return result(200, "[GET] Select User list paging successful.", objects, meta, COMPANY_NAME)

    def post(self):
        print("[POST] User")
        objects = []

        user = TB_USER.query.filter_by(user_id=self.user_id).first()
        if user is not None:
            return result(409, "[POST] User is exist", objects, None, COMPANY_NAME)

        new_user = TB_USER()
        new_user.user_id = self.user_id
        new_user.user_pw = generate_password_hash(self.user_pw)
        new_user.user_name = self.user_name
        db.session.add(new_user)
        db.session.commit()

        objects.append({
            'user_add': True,
            'user_id': self.user_id
        })

        return result(200, "[POST] Insert user successful.", objects, None, COMPANY_NAME)

    def put(self):
        print("[PUT] User")
        user_info = TB_USER.query.filter_by(idx=self.user_idx).first()

        if user_info is not None:
            user_info.user_id = self.user_id
            user_info.user_name = self.user_name
            if self.user_pw is not None:
                user_info.user_pw = generate_password_hash(self.user_pw)
            db.session.commit()
            return result(200, "[PUT] Update user info successful.", None, None, COMPANY_NAME)
        return result(404, "[PUT] User is not found", None, None, COMPANY_NAME)

    def delete(self):
        print("[DELETE] User")

        user_idx = request.args.get('user_idx')

        drop_user_info = TB_USER.query.filter_by(idx=user_idx).first()
        if drop_user_info is not None:
            db.session.query(TB_USER).filter_by(idx=user_idx).delete()
            db.session.commit()
            return result(200, '[DELETE] Delete user successful', None, None, COMPANY_NAME)
        return result(404, '[DELETE] User is not found', None, None, COMPANY_NAME)


class Role(Resource):
    def __init__(self):
        print("Role INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        super(Role, self).__init__()

    def get(self):
        print("[GET] Role")
        objects = []

        roles = TB_ROLE.query.all()
        for role in roles:
            objects.append({
                'idx': role.idx,
                'role_name': role.role_name
            })
        return result(200, "[GET] Select role successful.", objects, None, COMPANY_NAME)


class user_role(Resource):
    def __init__(self):
        print("user_role INIT")
        self.parser = reqparse.RequestParser()

        self.parser.add_argument("user_idx", type=int, location="json")
        self.parser.add_argument("role_idx", type=int, location="json")

        self.user_idx = self.parser.parse_args()["user_idx"]
        self.role_idx = self.parser.parse_args()["role_idx"]

        self.token_manager = TokenManager.instance()
        super(user_role, self).__init__()

    def get(self):
        print("[GET] user_role")
        objects = []

        role_filter_and_group = []

        user_idx = request.args.get('user_idx')
        role_idx = request.args.get('role_idx')

        if user_idx is not None:
            if role_idx is not None:
                role_filter_and_group.append(TB_USER_ROLE.fk_user_idx == user_idx)
                role_filter_and_group.append(TB_USER_ROLE.fk_role_idx == role_idx)
                is_user_role = TB_USER_ROLE.query.filter_by(fk_user_idx=user_idx, fk_role_idx=role_idx).first()
                user_roles = TB_USER_ROLE.query.filter_by(fk_user_idx=user_idx, fk_role_idx=role_idx).all()
            else:
                role_filter_and_group.append(TB_USER_ROLE.fk_user_idx == user_idx)
                is_user_role = TB_USER_ROLE.query.filter_by(fk_user_idx=user_idx).first()
                user_roles = TB_USER_ROLE.query.filter_by(fk_user_idx=user_idx).all()
            # is_user_role = TB_USER_ROLE.query.filter(and_(*role_filter_and_group)).first()
            # user_roles = TB_USER_ROLE.query.filter(and_(*role_filter_and_group)).all()

            if is_user_role is not None:
                for role in user_roles:
                    objects.append({
                        'idx': role.idx,
                        'fk_user_idx': role.fk_user_idx,
                        'fk_role_idx': role.fk_role_idx
                    })
                return result(200, "[GET] Select user role successful.", objects, None, COMPANY_NAME)
            else:
                return result(404, '[GET] User role is not found', None, None, COMPANY_NAME)

        objects = self.all_user_role()
        return result(200, "[GET] Select user role successful.", objects, None, COMPANY_NAME)

    def post(self):
        print("[POST] user_role")

        new_user_role = TB_USER_ROLE()
        new_user_role.fk_user_idx = self.user_idx
        new_user_role.fk_role_idx = self.role_idx
        db.session.add(new_user_role)
        db.session.commit()

        objects = self.all_user_role()

        return result(200, "[POST] Insert user role successful.", objects, None, COMPANY_NAME)

    def delete(self):
        print("[DELETE] user_role")

        user_idx = request.args.get('user_idx')
        role_idx = request.args.get('role_idx')

        user_role_info = TB_USER_ROLE.query.filter_by(fk_user_idx=user_idx, fk_role_idx=role_idx).first()

        if user_role_info is not None:
            db.session.query(TB_USER_ROLE).filter_by(fk_user_idx=user_idx, fk_role_idx=role_idx).delete()
            db.session.commit()

            objects = self.all_user_role()

            return result(200, '[DELETE] Delete user role successful', objects, None, COMPANY_NAME)
        return result(404, '[DELETE] user role is not found.', None, None, COMPANY_NAME)

    def all_user_role(self):
        objects = []

        user_roles = TB_USER_ROLE.query.all()
        for role in user_roles:
            objects.append({
                'idx': role.idx,
                'fk_user_idx': role.fk_user_idx,
                'fk_role_idx': role.fk_role_idx
            })

        return objects


class user_access_hist(Resource):
    def __init__(self):
        print("user_access_history INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()

        super(user_access_hist, self).__init__()

    def get(self):
        print("[GET] user_access_history")
        objects = []
        access_hist = TB_USER_ACCESS_HIST.query.all()
        limit = request.args.get('limit')
        offset = request.args.get('offset')

        if access_hist is None:
            return result(404, '[GET] User access hist is not found', None, None, COMPANY_NAME)

        if limit is None:
            for history in access_hist:
                objects.append({
                    'idx': history.idx,
                    'user_id': history.user_id,
                    'access_time': str(history.access_time),
                    'access_type': history.access_type,
                    'access_browser': history.access_browser,
                    'access_platform': history.access_platform,
                    'access_ip': history.access_ip
                })
            return result(200, "[GET] Select user access hist successful.", objects, None, COMPANY_NAME)

        list, objects, current_count, meta = Paging(limit, offset, access_hist, TB_USER_ACCESS_HIST, "user_access_hist")
        if current_count != 0:
            for history in list:
                objects.append({
                    'idx': history.idx,
                    'user_id': history.user_id,
                    'access_time': str(history.access_time),
                    'access_type': history.access_type,
                    'access_browser': history.access_browser,
                    'access_platform': history.access_platform,
                    'access_ip': history.access_ip
                })
        return result(200, "[GET] Select user access Hist paging successful.", objects, meta, COMPANY_NAME)


class Video(Resource):
    def __init__(self):
        print("Video INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()

        self.parser.add_argument("video_idx", type=int, location="json")
        self.parser.add_argument("idx", type=int, location="json", action="append")
        self.parser.add_argument("video_abled", type=int, location="json", action="append")
        self.parser.add_argument("fk_user_idx", type=str, location="json")
        self.parser.add_argument("fk_group_idx", type=str, location="json")
        self.parser.add_argument("video_source", type=str, location="json")
        self.parser.add_argument("video_url", type=str, location="json")
        self.parser.add_argument("video_title", type=str, location="json")
        self.parser.add_argument("video_status_value", type=str, location="json")
        self.parser.add_argument("video_auto_preview", type=int, location="json")
        self.parser.add_argument("video_duration", type=str, location="json")
        self.parser.add_argument("video_explanation", type=str, location="json")
        self.parser.add_argument("video_category", type=str, location="json")
        self.parser.add_argument("video_shared", type=str, location="json")

        self.video_idx = self.parser.parse_args()["video_idx"]
        self.idx = self.parser.parse_args()["idx"]
        self.video_abled = self.parser.parse_args()["video_abled"]
        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.fk_group_idx = self.parser.parse_args()["fk_group_idx"]
        self.video_source = self.parser.parse_args()["video_source"]
        self.video_url = self.parser.parse_args()["video_url"]
        self.video_title = self.parser.parse_args()["video_title"]
        self.video_status_value = self.parser.parse_args()["video_status_value"]
        self.video_auto_preview = self.parser.parse_args()["video_auto_preview"]
        self.video_duration = self.parser.parse_args()["video_duration"]
        self.video_explanation = self.parser.parse_args()["video_explanation"]
        self.video_category = self.parser.parse_args()["video_category"]
        self.video_auto_preview = self.parser.parse_args()["video_shared"]
        self.video_shared = self.parser.parse_args()["video_shared"]
        self.create_date = datetime.now()

        super(Video, self).__init__()

    def overlap_obj(self, video_list, total_count, user_idx=None):
        objects = []

        for video in video_list:
            # if video.video_status_value == 0:
            user_model = TB_USER.query.filter_by(idx=user_idx).first().prev_model_item if user_idx is not None else 0
            objects.append({
                'idx': video.idx,
                'fk_user_idx': video.fk_user_idx,
                'video_source': video.video_source,
                'video_url': video.video_url,
                'video_title': video.video_title,
                'create_date': json_encoder(video.create_date),
                'modify_date': json_encoder(video.modify_date),
                'video_duration': video.video_duration,
                'video_status_value': video.video_status_value,
                'video_auto_preview': video.video_auto_preview,
                'video_shared': video.video_shared,
                'item_count': len(TB_ITEM.query.filter_by(fk_video_idx=video.idx, using=1).all()),
                'user_model': user_model,
                'total_count': total_count
            })
        return objects

    def get(self):
        print("[GET] Video")
        objects = []

        # video_id = request.args.get('video_id')
        # search_title = request.args.get('search_title')
        user_idx = request.args.get('user_idx')
        fk_group_idx = request.args.get('fk_group_idx')
        limit = None
        # limit = request.args.get('limit')
        # offset = request.args.get('offset')
        # main_type = request.args.get('main_type')

        # filter = request.args.get('filter')
        # filter_editor = request.args.get('filter_editor')
        # filter_user_idx = request.args.get('filter_user_idx')

        video_filter_and_group = []

        # if filter != None:
        #     if filter == "shared":
        #         video_filter_and_group.append(TB_VIDEO.video_shared == 1)
        #
        # if filter_editor != None:
        #     if filter_editor == "shared":
        #         video_list = TB_VIDEO.query.filter_by(video_shared=1, video_status_value=0).order_by(TB_VIDEO.create_date.desc()).all()
        #         objects = self.overlap_obj(video_list, len(video_list), filter_user_idx)
        #         return result(200, "shared video", objects, None, COMPANY_NAME)
        #
        # if search_title != None:
        #     video_filter_and_group.append(TB_VIDEO.video_title.like('%' + search_title + '%'))
        #     search_video_list = TB_VIDEO.query.filter(and_(*video_filter_and_group)).order_by(TB_VIDEO.create_date.desc()).all()
        #     total_count = len(search_video_list)
        #     item_obj = self.overlap_obj(search_video_list, total_count)
        #     return result(200, 'search video list success', item_obj, None, COMPANY_NAME)
        #
        # if fk_group_idx is not None:
        #     if int(fk_group_idx) != 1:
        #         video_filter_and_group.append(TB_VIDEO.fk_user_idx == user_idx)
        #
        # if video_id is not None:
        #     video = TB_VIDEO.query.filter(TB_VIDEO.video_url.like("%" + video_id + "%")).first()
        #     if video is None:
        #         return result(409, "[GET] Video is not exist.", None, None, COMPANY_NAME)
        #     objects.append({
        #         "video": True,
        #         "video_idx": video.idx,
        #         "video_title": video.video_title
        #     })
        #     return result(200, "[GET] Select video_id's video successful.", objects, None, COMPANY_NAME)

        # videos = TB_VIDEO.query.filter(and_(*video_filter_and_group)).order_by(TB_VIDEO.create_date.desc()).all()
        videos = TB_VIDEO.query.filter_by(fk_user_idx=user_idx).all()
        if limit is None:
            for video in videos:
                # user_model = TB_USER.query.filter_by(idx=user_idx).first().prev_model_item if user_idx is not None else 0
                objects.append({
                    'idx': video.idx,
                    # 'fk_user_idx': video.fk_user_idx,
                    # 'video_source': video.video_source,
                    'video_url': video.video_url,
                    'video_title': video.video_title,
                    'video_explanation': video.video_explanation,
                    # 'modify_date': json_encoder(video.modify_date),
                    'video_duration': video.video_duration,
                    # 'video_status_value': video.video_status_value,
                    # 'video_auto_preview': video.video_auto_preview,
                    'video_shared': video.video_shared,
                    'video_category': video.video_category,
                    'create_date': json_encoder(video.create_date),
                    # 'item_count': len(TB_ITEM.query.filter_by(fk_video_idx=video.idx).all()),
                    # 'user_model': user_model,
                    # 'total_count': len(videos)
                })
            return result(200, "[GET] Select video list successful.", objects, None, COMPANY_NAME)

        video_lim = TB_VIDEO.query.filter(and_(*video_filter_and_group)).order_by(TB_VIDEO.create_date.desc()).limit(limit).offset(offset)
        list, objects, current_count, meta = Paging(limit, offset, videos, TB_VIDEO, "video_list", None, None, 'order_by')
        if main_type is not None:
            main_type = int(main_type)
            list, objects, current_count, meta = Paging(limit, offset, videos, TB_VIDEO, "video_list", "main_type",
                                                        main_type)
        total_count = len(videos)
        if current_count != 0:
            if main_type is not None:
                for video in video_lim:
                    video_shape = TB_ITEM.query.filter_by(fk_video_idx=video.idx).order_by(TB_VIDEO.create_date.desc()).all()
                    for vs in video_shape:
                        if vs.fk_item_main_type == main_type:
                            # if video.video_status_value == 0:
                            user_model = TB_USER.query.filter_by(idx=user_idx).first().prev_model_item if user_idx is not None else 0
                            objects.append({
                                'idx': video.idx,
                                'fk_user_idx': video.fk_user_idx,
                                'video_source': video.video_source,
                                'video_url': video.video_url,
                                'video_title': video.video_title,
                                'create_date': json_encoder(video.create_date),
                                'modify_date': json_encoder(video.modify_date),
                                'video_duration': video.video_duration,
                                'video_auto_preview': video.video_auto_preview,
                                'video_shared': video.video_shared,
                                'item_count': len(TB_ITEM.query.filter_by(fk_video_idx=video.idx).all()),
                                'item_all_count': len(
                                    TB_ITEM.query.filter_by(using=1, fk_item_main_type=main_type).all()),
                                'user_model': user_model,
                                'shape_idx': vs.fk_item_sub_type,
                                'item_idx': vs.idx,
                                'item_title': vs.item_title,
                                'total_count': total_count
                            })
                return result(200, "[GET] Select video list paging successful.", objects, meta, COMPANY_NAME)
            objects.append(self.overlap_obj(video_lim, len(videos), user_idx))
        objects = objects[0]
        return result(200, "[GET] Select video list paging successful.", objects, meta, COMPANY_NAME)

    def post(self):
        print("[POST] Video")
        objects = []

        video_filter_and_group = []
        video = TB_VIDEO.query.filter_by(video_url=self.video_url).first()
        if video is not None:
            return result(409, "[POST] Video is exist.", None, None, COMPANY_NAME)

        new_video = TB_VIDEO()
        new_video.fk_user_idx = self.fk_user_idx
        new_video.video_source = self.video_source
        new_video.video_url = self.video_url
        new_video.video_title = self.video_title
        new_video.create_date = self.create_date
        new_video.modify_date = self.create_date
        new_video.video_explanation = self.video_explanation
        new_video.video_duration = self.video_duration
        new_video.video_category = self.video_category
        new_video.video_status_value = 0
        new_video.video_auto_preview = 0
        new_video.video_shape = 0
        new_video.video_shared = self.video_shared
        db.session.add(new_video)
        db.session.commit()

        if self.fk_group_idx != None:
            if int(self.fk_group_idx) != 1:
                video_filter_and_group.append(TB_VIDEO.fk_user_idx == self.fk_user_idx)
        videos = TB_VIDEO.query.filter(and_(*video_filter_and_group)).order_by(TB_VIDEO.create_date.desc()).all()
        for vid in videos:
            objects.append({
                'idx': vid.idx,
                'fk_user_idx': vid.fk_user_idx,
                'video_source': vid.video_source,
                'video_url': vid.video_url,
                'video_title': vid.video_title,
                'create_date': json_encoder(vid.create_date),
                'modify_date': json_encoder(vid.modify_date),
                'video_duration': vid.video_duration,
                'video_auto_preview': vid.video_auto_preview,
                'video_shared': vid.video_shared,
            })
        return result(200, "[POST] Insert video successful.", objects, None, COMPANY_NAME)

    def put(self):
        print("[PUT] Video")

        video_info = TB_VIDEO.query.filter_by(idx=self.video_idx).first()

        if video_info is not None and self.video_abled is None:
            if self.video_info == 0:
                video_info.video_auto_preview = 1
                video_info.create_date = video_info.create_date
                video_info.modify_date = self.create_date
                db.session.commit()
            elif self.video_info == 1:
                video_info.video_auto_preview = 0
                video_info.create_date = video_info.create_date
                video_info.modify_date = self.create_date
                db.session.commit()
        else:
            for i, e in zip(self.idx, self.video_abled):
                print(i, e)
                video_info = TB_VIDEO.query.filter_by(idx=i).first()
                video_info.create_date = video_info.create_date
                video_info.modify_date = self.create_date
                video_info.video_status_value = e
                db.session.commit()
        return result(200, "[PUT] Update video successful.", None, None, COMPANY_NAME)
        # return result(404, "[PUT] Video is not found.", None, None, COMPANY_NAME)

    def delete(self):
        print("[DELETE] Video")

        video_idx_drop = request.args.getlist('drop_idx')

        if video_idx_drop is not None:
            for i in video_idx_drop:
                db.session.query(TB_VIDEO).filter_by(idx=i).delete()
                db.session.commit()
            return result(200, '[DELETE] Delete video successful', None, None, COMPANY_NAME)
        return result(404, '[DELETE] video is not found.', None, None, COMPANY_NAME)


class Item(Resource):
    def __init__(self):
        print("Item INIT")
        self.parser = reqparse.RequestParser()

        self.parser.add_argument("item_title", type=str, location="json")
        self.parser.add_argument("item_price", type=str, location="json")
        self.parser.add_argument("item_explanation", type=str, location="json")
        self.parser.add_argument("item_url", type=str, location="json")

        self.parser.add_argument("item_idx", type=str, location="json")
        self.parser.add_argument("fk_video_idx", type=str, location="json")
        self.parser.add_argument("fk_user_idx", type=str, location="json")
        self.parser.add_argument("item_description", type=str, location="json")
        self.parser.add_argument("item_redirect_url", type=str, location="json")
        self.parser.add_argument("item_description_url", type=str, location="json")
        self.parser.add_argument("fk_item_main_type", type=str, location="json")
        self.parser.add_argument("fk_item_sub_type", type=str, location="json")
        self.parser.add_argument("item_img_path", type=str, location="json")
        self.parser.add_argument("item_shape_type", type=str, location="json")
        self.parser.add_argument("using", type=str, location="json")
        self.parser.add_argument("update_check", type=str, location="json")
        self.parser.add_argument("item_description_toggle", type=str, location="json")
        self.parser.add_argument("make_request", type=str, location="json")
        self.parser.add_argument("insert_status", type=str, location="json")
        self.parser.add_argument("img_select", type=str, location="json")
        self.parser.add_argument("video_auto_preview", type=str, location="json")
        self.parser.add_argument("classesNum", type=int, location="json")
        self.parser.add_argument("group_id", type=str, location="json")

        self.token_manager = TokenManager.instance()

        self.item_title = self.parser.parse_args()["item_title"]
        self.item_price = self.parser.parse_args()["item_price"]
        self.item_explanation = self.parser.parse_args()["item_explanation"]
        self.item_url = self.parser.parse_args()["item_url"]

        self.idx = self.parser.parse_args()["item_idx"]
        self.fk_video_idx = self.parser.parse_args()["fk_video_idx"]
        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.item_description = self.parser.parse_args()["item_description"]
        self.item_redirect_url = self.parser.parse_args()["item_redirect_url"]
        self.item_description_url = self.parser.parse_args()["item_description_url"]
        self.fk_item_main_type = self.parser.parse_args()["fk_item_main_type"]
        self.fk_item_sub_type = self.parser.parse_args()["fk_item_sub_type"]
        self.item_img_path = self.parser.parse_args()["item_img_path"]
        self.item_shape = self.parser.parse_args()["item_shape_type"]
        self.using = self.parser.parse_args()["using"]
        self.update_check = self.parser.parse_args()["update_check"]
        self.item_description_toggle = self.parser.parse_args()["item_description_toggle"]
        self.make_request = self.parser.parse_args()["make_request"]
        self.insert_status = self.parser.parse_args()["insert_status"]
        self.img_select = self.parser.parse_args()["img_select"]
        self.video_auto_preview = self.parser.parse_args()["video_auto_preview"]
        self.classesNum = self.parser.parse_args()["classesNum"]
        self.group_id = self.parser.parse_args()["group_id"]
        self.create_date = datetime.now()

        self.using_status = False
        self.description_status = False
        self.make_request_msg = '요청'
        self.group_idx = 0
        self.make_request_status = False

        super(Item, self).__init__()

    def overlap_obj(self, item_list, item_len, model_user_idx=None):
        objects = []
        for item in item_list:
            self.using_status = True if item.using == 1 else False
            self.description_status = True if item.item_description_toggle == 1 else False
            self.make_request_status = True if item.make_request == 1 else False
            self.make_request_msg = '완료' if item.make_request == 0 else '요청'
            item_list_len = item_len if item_len != None else len(item_list)
            #print(item.fk_user_idx)
            img_path = "../images/uploads/" + str(item.idx) + "_product.jpg" if os.path.isfile(
                UPLOAD_FOLDER + '/' + str(item.idx) + "_product.jpg") else "../images/common/noimg.png"
            auto_preview = TB_VIDEO.query.filter_by(
                idx=item.fk_video_idx).first().video_auto_preview if item.fk_video_idx != None else 1
            objects.append({
                "idx": item.idx,
                "fk_video_idx": item.fk_video_idx,
                "fk_user_idx": item.fk_user_idx,
                "item_title": item.item_title,
                "create_date": json_encoder(item.create_date.strftime('%Y-%m-%d')),
                "item_description": item.item_description,
                # "item_price": '{0:,}'.format(item.item_price),
                "item_price": item.item_price,
                "update_item_price": item.item_price,
                "item_redirect_url": item.item_redirect_url,
                "item_description_url": item.item_description_url,
                "fk_item_main_type": item.fk_item_main_type,
                "fk_item_sub_type": item.fk_item_sub_type,
                "item_img_path": img_path,
                "item_shape_type": item.item_shape,
                "using": item.using,
                "video_auto_preview": auto_preview,
                #"name": TB_USER.query.filter_by(idx=item.fk_user_idx).first().user_name,
                #"user_id": TB_USER.query.filter_by(idx=item.fk_user_idx).first().user_id,
                "using_status": self.using_status,
                "description_status": self.description_status,
                "request_status": self.make_request_status,
                "item_description_toggle": item.item_description_toggle,
                # "make_request": item.make_request,
                "make_request": self.make_request_msg,
                "insert_status": self.insert_status,
                "numberOfItem": item_list_len
            })
        return objects

    def get(self):
        print("[GET] Item")
        objects = []

        # item_idx = request.args.get('item_idx')
        # model_user_idx = request.args.get('model_user_idx')
        # video_idx = request.args.get('video_idx')
        user_idx = request.args.get('user_idx')
        fk_group_idx = request.args.get('fk_group_idx')
        # fk_group_idx_sample = request.args.get('fk_group_idx_sample')
        # search_item_title = request.args.get('item_title')
        # search_category = request.args.get('search_category')
        # search_item_name = request.args.get('search_item_name')
        # search_min_price = request.args.get('search_min_price')
        # search_max_price = request.args.get('search_max_price')
        # search_main_type = request.args.get('search_main_type')
        # search_sub_type = request.args.get('search_sub_type')
        # startDate = request.args.get('startDate')
        # endDate = request.args.get('endDate')
        # main_idx = request.args.get('main_idx')
        # sub_idx = request.args.get('sub_idx')
        # detail_exists = request.args.get('detail_exists')
        # limit = request.args.get('limit')
        # offset = request.args.get('offset')

        item_list = TB_ITEM.query.order_by(TB_ITEM.create_date.desc()).all()
        for item in item_list:
            objects.append({
                'idx': item.idx,
                'item_title': item.item_title,
                'item_price': item.item_price,
            })

        return result(200, "[GET] Select item list successful.", objects, None, COMPANY_NAME)

        # item_filter_and_group = []
        # item_filter_or_group = []
        # user_filter_and_group = []
        # fk_item_idx = []
        # item_and_type = []
        #
        # total_item_list = TB_ITEM.query.count()
        # # item_len = len(total_item_list)
        # if detail_exists is not None:
        #     if fk_group_idx is not None:
        #         if int(fk_group_idx) != 1:
        #             detail_list = TB_ITEM_DETAIL.query.filter_by(fk_video_idx=video_idx).all()
        #             for detail in detail_list:
        #                 fk_item_idx.append(detail.fk_item_idx)
        #             item_list = TB_ITEM.query.filter(TB_ITEM.idx.in_(fk_item_idx)).filter_by(fk_user_idx=user_idx).all()
        #             objects = self.overlap_obj(item_list, len(item_list))
        #             return result(200, 'success', objects, None, COMPANY_NAME)
        #     detail_list = TB_ITEM_DETAIL.query.filter_by(fk_video_idx=video_idx).all()
        #     for detail in detail_list:
        #         fk_item_idx.append(detail.fk_item_idx)
        #     item_list = TB_ITEM.query.filter(TB_ITEM.idx.in_(fk_item_idx)).all()
        #     objects = self.overlap_obj(item_list, len(item_list))
        #     return result(200, 'success', objects, None, COMPANY_NAME)
        # if item_idx is not None:
        #     item_filter_and_group.append(TB_ITEM.idx == item_idx)
        # if fk_group_idx is not None:
        #     if int(fk_group_idx) != 1:
        #         item_filter_and_group.append(TB_ITEM.fk_user_idx == user_idx)
        # if fk_group_idx_sample is not None:
        #     if int(fk_group_idx_sample) != 1:
        #         item_list = TB_ITEM.query.filter_by(fk_user_idx=user_idx).all()
        #         objects = self.overlap_obj(item_list, len(item_list))
        #         return result(200, "user_item_list_sample", objects, None, COMPANY_NAME)
        # if video_idx is not None:
        #     item_filter_and_group.append(TB_ITEM.fk_video_idx == video_idx)
        # if main_idx is not None:
        #     item_filter_and_group.append(TB_ITEM.fk_item_main_type == main_idx)
        # if sub_idx is not None:
        #     item_filter_and_group.append(TB_ITEM.fk_item_sub_type == sub_idx)
        # # if search_item_name is not None:
        # #     item_filter_and_group.append(TB_ITEM.item_title.like('%' + search_item_name + '%'))
        # if search_main_type is not None:
        #     item_filter_and_group.append(TB_ITEM.fk_item_main_type == search_main_type)
        # #     item_and_type.append(TB_ITEM.fk_item_main_type == search_main_type)
        # if search_sub_type is not None:
        #     item_filter_and_group.append(TB_ITEM.fk_item_sub_type == search_sub_type)
        # if search_item_title is not None:
        #     item_filter_and_group.append(TB_ITEM.item_title.like('%' + search_item_title + '%'))
        #     item_and_type.append(TB_ITEM.fk_item_sub_type == search_sub_type)
        # if startDate is not None and endDate is not None:
        #     item_filter_and_group.append(TB_ITEM.create_date >= func.str_to_date(startDate, '%Y-%m-%d'))
        #     item_filter_and_group.append(TB_ITEM.create_date <= func.str_to_date(endDate, '%Y-%m-%d'))
        #     item_and_type.append(TB_ITEM.create_date >= func.str_to_date(startDate, '%Y-%m-%d'))
        #     item_and_type.append(TB_ITEM.create_date <= func.str_to_date(endDate, '%Y-%m-%d'))
        # if search_category is not None:
        #     if search_category == 'item_title':
        #         item_filter_and_group.append(TB_ITEM.item_title.like('%' + search_item_name + '%'))
        #     if search_category == 'item_price':
        #         item_filter_and_group.append(TB_ITEM.item_price >= search_min_price)
        #         item_filter_and_group.append(TB_ITEM.item_price < search_max_price)
        #     if search_category == 'user_name':
        #         if fk_group_idx is not None:
        #             if int(fk_group_idx) != 1:
        #                 user_filter_and_group.append(TB_USER.idx == user_idx)
        #             user_filter_and_group.append(TB_USER.user_name.like('%' + search_item_name + '%'))
        #         user_list = TB_USER.query.filter(and_(*user_filter_and_group)).all()
        #         for item in user_list:
        #             fk_item_idx.append(item.idx)
        #             item_filter_or_group.append(TB_ITEM.fk_user_idx == item.idx)
        #         if limit is not None:
        #             if search_main_type is not None or search_sub_type is not None:
        #                 item_type_list = TB_ITEM.query.filter(or_(*item_filter_or_group)).filter(
        #                     and_(*item_and_type)).all()
        #                 item_list = TB_ITEM.query.filter(or_(*item_filter_or_group)).filter(
        #                     and_(*item_and_type)).limit(limit).offset(offset)
        #                 list, objects, current_count, meta = Paging(limit, offset, item_type_list, TB_ITEM, 'item')
        #                 objects = self.overlap_obj(item_list, len(item_type_list))
        #                 print("t1 ,", objects)
        #                 return result(200, "[GET] Select item_type's list successful.", objects, meta, COMPANY_NAME)
        #             if startDate is not None and endDate is not None:
        #                 item_date_list = TB_ITEM.query.filter(or_(*item_filter_or_group)).filter(
        #                     and_(*item_and_type)).all()
        #                 item_list = TB_ITEM.query.filter(or_(*item_filter_or_group)).filter(
        #                     and_(*item_and_type)).limit(limit).offset(offset)
        #                 list, objects, current_count, meta = Paging(limit, offset, item_date_list, TB_ITEM, 'item')
        #                 objects = self.overlap_obj(item_list, len(item_date_list))
        #                 print("t2 ,", objects)
        #                 return result(200, "[GET] Select create_date's list successful.", objects, meta, COMPANY_NAME)
        #             else:
        #                 item_user = TB_ITEM.query.filter(TB_ITEM.fk_user_idx.in_(fk_item_idx)).all()
        #                 item_list = TB_ITEM.query.filter(TB_ITEM.fk_user_idx.in_(fk_item_idx)).limit(limit).offset(offset)
        #                 list, objects, current_count, meta = Paging(limit, offset, item_user, TB_ITEM, 'item')
        #                 objects = self.overlap_obj(item_list, len(item_user))
        #                 print("t3 ,", objects)
        #                 return result(200, "[GET] Select user item list successful.", objects, meta, COMPANY_NAME)
        #         if search_main_type is not None or search_sub_type is not None:
        #             item_type_list = TB_ITEM.query.filter(or_(*item_filter_or_group)).filter(and_(*item_and_type)).all()
        #             objects = self.overlap_obj(item_type_list, len(item_type_list))
        #             print("t4 ,", objects)
        #             return result(200, "[GET] Select item_type's list successful.", objects, None, COMPANY_NAME)
        #         if startDate is not None and endDate is not None:
        #             item_date_list = TB_ITEM.query.filter(or_(*item_filter_or_group)).filter(and_(*item_and_type)).all()
        #             objects = self.overlap_obj(item_date_list, len(item_date_list))
        #             print("t5 ,", objects)
        #             return result(200, "[GET] Select create_date's list successful.", objects, None, COMPANY_NAME)
        #         else:
        #             item_user = TB_ITEM.query.filter(TB_ITEM.fk_user_idx.in_(fk_item_idx)).all()
        #             objects = self.overlap_obj(item_user, len(item_user))
        #             print("t6 ,", objects)
        #             return result(200, "[GET] Select user item list successful.", objects, None, COMPANY_NAME)
        # if limit is not None:
        #     item_len = TB_ITEM.query.filter(and_(*item_filter_and_group)).all()
        #     item_limit_list = TB_ITEM.query.filter(and_(*item_filter_and_group)).order_by(TB_ITEM.create_date.desc()).limit(limit).offset(offset)
        #     list, objects, current_count, meta = Paging(limit, offset, item_len, TB_ITEM, 'item')
        #     objects = self.overlap_obj(item_limit_list, len(item_len))
        #     # print("t7 ,", objects)
        #     return result(200, "[GET] Select item list successful.", objects, meta, COMPANY_NAME)
        # item_list = TB_ITEM.query.filter(and_(*item_filter_and_group)).order_by(TB_ITEM.create_date.desc()).all()
        # objects = self.overlap_obj(item_list, len(item_list), model_user_idx)
        # print("t8, ", objects)
        # , objects

    def post(self):
        print("[POST] Item")
        objects = []

        # self.input_group()
        # self.input_item()
        input = self.parser.parse_args()
        new_item = TB_ITEM()
        new_item.create_date = self.create_date
        new_item.item_title = self.item_title
        new_item.item_price = self.item_price
        new_item.item_explanation = self.item_explanation
        new_item.item_url = self.item_url
        new_item.item_img_path = self.item_img_path

        db.session.add(new_item)
        db.session.commit()
        print(new_item.idx)
        # db.session.flush()

        if os.path.isfile(UPLOAD_FOLDER + '/999_product.jpg'):
            file_old_name = UPLOAD_FOLDER + '/999_product.jpg'
            file_new_name = UPLOAD_FOLDER + '/' + str(new_item.idx) + '_product.jpg'
            if os.path.isfile(file_new_name):
                if os.path.isfile(file_old_name):
                    os.remove(file_new_name)
                    os.rename(file_old_name, file_new_name)
                else:
                    os.rename(file_old_name, file_new_name)
            elif os.path.isfile(file_old_name):
                os.rename(file_old_name, file_new_name)
            else:
                savename = str(new_item.idx) + '_product.jpg'
                print(savename)
            new_item.item_img_path = '/images/uploads/' + str(new_item.idx) + '_product.jpg'
        else:
            new_item.item_img_path = '/images/common/no_item.png'
        db.session.commit()
        db.session.refresh(new_item)

        video_item = TB_VIDEO.query.filter_by(idx=self.fk_video_idx).first()
        position_item_idx = []
        position_item = TB_ITEM.query.filter_by(fk_video_idx=self.fk_video_idx).all()
        for p in position_item:
            position_item_idx.append(p.idx)
        video_url = ''
        video_source = ''
        if video_item is not None:
            video_url = video_item.video_url
            video_source = video_item.video_source
        self.using_status = True if new_item.using == 1 else False
        self.description_status = True if new_item.item_description_toggle == 1 else False
        img_path = "../images/uploads/" + str(new_item.idx) + "_product.jpg" if os.path.isfile(
            UPLOAD_FOLDER + "/" + str(new_item.idx) + "_product.jpg") else "../images/common/noimg.png"
        objects.append({
            "idx": new_item.idx,
            "fk_video_idx": new_item.fk_video_idx,
            "fk_user_idx": new_item.fk_user_idx,
            "item_title": new_item.item_title,
            "create_date": json_encoder(new_item.create_date.strftime('%Y-%m-%d')),
            "item_description": new_item.item_description,
            "item_price": '{0:,}'.format(new_item.item_price),
            "update_item_price": new_item.item_price,
            "item_redirect_url": new_item.item_redirect_url,
            "item_description_url": new_item.item_description_url,
            "fk_item_main_type": new_item.fk_item_main_type,
            "fk_item_sub_type": new_item.fk_item_sub_type,
            "item_img_path": img_path,
            "item_shape_type": new_item.item_shape,
            "using": new_item.using,
            'video_url': video_url,
            'video_source': video_source,
            "using_status": self.using_status,
            "description_status": self.description_status,
            "item_description_toggle": new_item.item_description_toggle,
            "make_request": new_item.make_request,
            "insert_status": new_item.insert_status
        })
        return result(200, "[POST] Item Add Successful.", objects, None, "by sisung")

    def input_group(self):
        new_build_group = TB_BUILD_GROUP()
        new_build_group.group_id = self.group_id
        db.session.add(new_build_group)
        db.session.commit()
        self.group_idx = new_build_group.idx
        # print(self.group_idx)

    def input_item(self):
        new_build_item = TB_BUILD_ITEM()
        new_build_item.group_idx = self.group_idx
        new_build_item.item_number = self.idx
        new_build_item.shape_idx = self.item_shape
        new_build_item.item_name = self.item_title
        new_build_item.filename = '0_' + str(self.idx)
        new_build_item.type = 'ITEM'
        db.session.add(new_build_item)
        db.session.commit()

    def put(self):
        print("[PUT] Item")

        print("self : ", self.idx)

        old_item = TB_ITEM.query.filter_by(idx=self.idx).first()

        old_video = TB_VIDEO.query.filter_by(idx=self.fk_video_idx).first()
        file_old_name = UPLOAD_FOLDER + '/0_product.jpg'
        file_new_name = UPLOAD_FOLDER + '/' + str(self.idx) + '_product.jpg'
        if os.path.isfile(file_new_name):
            if os.path.isfile(file_old_name):
                os.remove(file_new_name)
                os.rename(file_old_name, file_new_name)
            else:
                print("image name not change")
        else:
            os.rename(file_old_name, file_new_name)

        print(old_item.fk_video_idx)

        old_item.fk_video_idx = self.fk_video_idx
        old_item.fk_user_idx = self.fk_user_idx
        old_item.create_date = self.create_date
        old_item.item_title = self.item_title
        old_item.item_description = self.item_description
        old_item.item_price = self.item_price
        old_item.item_redirect_url = self.item_redirect_url
        old_item.item_description_url = self.item_description_url
        old_item.fk_item_main_type = self.fk_item_main_type
        old_item.fk_item_sub_type = self.fk_item_sub_type
        old_item.item_img_path = '/images/uploads/' + str(self.idx) + '_product.jpg'
        old_item.item_shape = self.item_shape
        old_item.item_description_toggle = self.item_description_toggle
        old_item.make_request = self.make_request
        old_item.item_using = 1
        old_video.video_auto_preview = self.video_auto_preview
        print(old_video.video_auto_preview)
        db.session.commit()
        return result(200, "[PUT] Update Item successful.", None, None, COMPANY_NAME)

    def delete(self):
        print("[DELETE] Item")
        d_item_idx = request.args.get('d_item_idx')

        item = TB_ITEM.query.filter_by(idx=d_item_idx).first()

        if item is not None:
            db.session.query(TB_ITEM).filter_by(idx=item.idx).delete()
            db.session.commit()
            return result(200, '[DELETE] Delete Item successful', None, None, COMPANY_NAME)
        return result(404, '[DELETE] Item is not found', None, None, COMPANY_NAME)


class item_history(Resource):
    def __init__(self):
        print("item_history INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()

        self.parser.add_argument("fk_user_idx", type=int, location="json")
        self.parser.add_argument("fk_item_idx", type=int, location="json")
        self.parser.add_argument("action_status", type=int, location="json")

        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.fk_item_idx = self.parser.parse_args()["fk_item_idx"]
        self.action_status = self.parser.parse_args()["action_status"]
        self.create_date = datetime.now()

        super(item_history, self).__init__()

    def get(self):
        print("[GET] item_history")
        objects = []

        limit = request.args.get('limit')
        offset = request.args.get('offset')
        group_type = request.args.get('group_type')
        history_year = request.args.get('history_year')
        history_month = request.args.get('history_month')

        if group_type == 'year':
            history_years = TB_ITEM_HISTORY.query.group_by(func.year(TB_ITEM_HISTORY.create_date)).all()
            for history in history_years:
                objects.append(history.create_date.year)
            return result(200, '[GET] Select item history year list successful', objects, None, COMPANY_NAME)

        def year_filter(action_status, group):
            history = TB_ITEM_HISTORY.query \
                .with_entities(group, func.count(TB_ITEM_HISTORY.idx)) \
                .filter_by(action_status=action_status).filter(
                extract('year', TB_ITEM_HISTORY.create_date) == history_year) \
                .group_by(group).all()

            return history

        def month_filter(action_status, group):
            history = TB_ITEM_HISTORY.query \
                .with_entities(group, func.count(TB_ITEM_HISTORY.idx)) \
                .filter_by(action_status=action_status).filter(
                extract('year', TB_ITEM_HISTORY.create_date) == history_year) \
                .filter(extract('month', TB_ITEM_HISTORY.create_date) == history_month) \
                .group_by(group).all()

            return history

        def click_filter(action_status):
            history = TB_ITEM_HISTORY.query \
                .with_entities(func.month(TB_ITEM_HISTORY.create_date), func.count(TB_ITEM_HISTORY.idx)) \
                .filter_by(action_status=action_status).filter(
                extract('year', TB_ITEM_HISTORY.create_date) == history_year) \
                .group_by(func.month(TB_ITEM_HISTORY.create_date)).all()

            return history

        if group_type == 'item' or group_type == 'user':
            click_objects = []
            buy_objects = []
            if group_type == 'item':
                click_item_history = year_filter(0, TB_ITEM_HISTORY.fk_item_idx)
                buy_item_history = year_filter(1, TB_ITEM_HISTORY.fk_item_idx)

                if history_month != 0:
                    click_item_history = month_filter(0, TB_ITEM_HISTORY.fk_item_idx)
                    buy_item_history = month_filter(1, TB_ITEM_HISTORY.fk_item_idx)

                for history in click_item_history:
                    click_objects.append({
                        'name': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                        'y': history[1]
                    })

                for history in buy_item_history:
                    buy_objects.append({
                        'name': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                        'y': history[1]
                    })
            elif group_type == 'user':
                click_item_history = year_filter(0, TB_ITEM_HISTORY.fk_user_idx)
                buy_item_history = year_filter(1, TB_ITEM_HISTORY.fk_user_idx)

                if history_month != "0":
                    click_item_history = month_filter(0, TB_ITEM_HISTORY.fk_user_idx)
                    buy_item_history = month_filter(1, TB_ITEM_HISTORY.fk_user_idx)

                for history in click_item_history:
                    click_objects.append({
                        'name': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                        'y': history[1]
                    })

                for history in buy_item_history:
                    buy_objects.append({
                        'name': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                        'y': history[1]
                    })

            click_month_history = click_filter(0)
            click_months = []
            click_month_objects = []

            buy_month_history = click_filter(1)
            buy_months = []
            buy_month_objects = []

            for history in click_month_history:
                click_months.append(str(history[0]) + '월')
                click_month_objects.append(history[1])

            for history in buy_month_history:
                buy_months.append(str(history[0]) + '월')
                buy_month_objects.append(history[1])

            objects.append({
                'click_objects': click_objects,
                'buy_objects': buy_objects,
                'click_months': click_months,
                'click_month_objects': click_month_objects,
                'buy_months': buy_months,
                'buy_month_objects': buy_month_objects
            })
            return result(200, '[GET] Select item history by item list successful', objects, None, COMPANY_NAME)

        historys = TB_ITEM_HISTORY.query.all()
        if limit is None:
            for history in historys:
                objects.append({
                    'idx': history.idx,
                    'user_id': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                    'item_title': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                    'action_status': history.action_status,
                    'create_date': json_encoder(history.create_date)
                })
            return result(200, '[GET] Select item history list successful', objects, None, COMPANY_NAME)

        list, objects, current_count, meta = Paging(limit, offset, historys, TB_ITEM_HISTORY, "item_history")
        if current_count != 0:
            for history in list:
                objects.append({
                    'idx': history.idx,
                    'user_id': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                    'item_title': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                    'action_status': history.action_status,
                    'create_date': json_encoder(history.create_date)
                })
        return result(200, "[GET] Select item history list paging successful.", objects, meta, COMPANY_NAME)

    def post(self):
        print("[POST] item_history")

        new_history = TB_ITEM_HISTORY()
        new_history.fk_user_idx = self.fk_user_idx
        new_history.fk_item_idx = self.fk_item_idx
        new_history.action_status = self.action_status
        new_history.create_date = self.create_date
        db.session.add(new_history)
        db.session.commit()

        return result(200, '[POST] Insert item history successful', None, None, COMPANY_NAME)


class item_detail(Resource):
    def __init__(self):
        print("item_detail INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("item_idx", type=str, location="json", action="append")
        self.parser.add_argument("fk_item_idx", type=str, location="json")
        self.parser.add_argument("fk_video_idx", type=str, location="json")
        self.parser.add_argument("item_position", type=str, location="json")
        self.parser.add_argument("item_title", type=str, location="json", action="append")
        self.parser.add_argument("item_price", type=str, location="json", action="append")
        self.parser.add_argument("rect_item_idx", type=str, location="json")
        self.parser.add_argument("rect_position", type=str, location="json")
        self.parser.add_argument("using", type=str, location="json")
        self.parser.add_argument("using_status", type=str, location="json", action="append")
        self.parser.add_argument("item_shape", type=str, location="json", action="append")
        self.parser.add_argument("item_description_toggle", type=str, location="json", action="append")
        self.parser.add_argument("p_order", type=str, location="json")
        self.parser.add_argument("p_time", type=str, location="json")
        self.parser.add_argument("rect_x", type=str, location="json")
        self.parser.add_argument("rect_y", type=str, location="json")
        self.parser.add_argument("rect_w", type=str, location="json")
        self.parser.add_argument("rect_h", type=str, location="json")
        self.parser.add_argument("left", type=str, location="json")
        self.parser.add_argument("top", type=str, location="json")
        self.parser.add_argument("width", type=str, location="json")
        self.parser.add_argument("height", type=str, location="json")

        self.item_idx = self.parser.parse_args()["item_idx"]
        self.fk_item_idx = self.parser.parse_args()["fk_item_idx"]
        self.fk_video_idx = self.parser.parse_args()["fk_video_idx"]
        self.item_position = self.parser.parse_args()["item_position"]
        self.item_title = self.parser.parse_args()["item_title"]
        self.item_price = self.parser.parse_args()["item_price"]
        self.rect_item_idx = self.parser.parse_args()["rect_item_idx"]
        self.rect_position = self.parser.parse_args()["rect_position"]
        self.using = self.parser.parse_args()["using"]
        self.update_using_status = self.parser.parse_args()["using_status"]
        self.item_shape = self.parser.parse_args()["item_shape"]
        self.item_description_toggle = self.parser.parse_args()["item_description_toggle"]
        self.p_order = self.parser.parse_args()["p_order"]
        self.p_time = self.parser.parse_args()["p_time"]
        self.rect_x = self.parser.parse_args()["rect_x"]
        self.rect_y = self.parser.parse_args()["rect_y"]
        self.rect_w = self.parser.parse_args()["rect_w"]
        self.rect_h = self.parser.parse_args()["rect_h"]
        self.left = self.parser.parse_args()["left"]
        self.top = self.parser.parse_args()["top"]
        self.width = self.parser.parse_args()["width"]
        self.height = self.parser.parse_args()["height"]
        self.token_manager = TokenManager.instance()

        super(item_detail, self).__init__()

    def get(self):
        print("[GET] item_detail")

        video_id = request.args.get('video_id')
        video_idx = request.args.get('video_idx')
        fk_item_idx = request.args.get('fk_item_idx')
        index = 0
        objects = []
        all_objects = []
        items_idx = []

        if (video_idx == None):
            video_info = TB_VIDEO.query.filter(TB_VIDEO.video_url.like("%" + video_id + "%")).first()
            if (video_info):
                video_idx = video_info.idx
            else:
                return result(402, "[GET] Video is not exist.", objects, None, COMPANY_NAME)

        if fk_item_idx == None:
            # .filter_by(fk_video_idx=video_idx)
            item_idx1 = TB_ITEM.query.all()
            for item in item_idx1:
                items_idx.append(item.idx)
            # item_detail_list = TB_ITEM_DETAIL.query.filter(TB_ITEM_DETAIL.fk_item_idx.in_(items_idx), TB_ITEM_DETAIL.fk_video_idx == video_idx).order_by(TB_ITEM_DETAIL.position.asc()).all()
            item_detail_list = TB_ITEM_DETAIL.query.filter_by(fk_video_idx=video_idx).order_by(TB_ITEM_DETAIL.position.asc()).all()
            for item_detail in item_detail_list:
                objects.append({
                    'index': index,
                    'idx': item_detail.idx,
                    'fk_item_idx': item_detail.fk_item_idx,
                    'fk_video_idx': item_detail.fk_video_idx,
                    'position': item_detail.position,
                    'position_order': item_detail.position_order,
                    'image_time': item_detail.position_time,
                    'position_time': int(item_detail.position_time),
                    'position_time_d': str(int((item_detail.position_time%3600)/60)).zfill(2)+":"+str(int(item_detail.position_time%60)).zfill(2),
                    'draw_item_type': item_detail.draw_item_type,
                    # 'draw_img_name': '/modify_images/' + str(video_idx) + "/" + str(fk_item_idx) + '_images/' + str(item_detail.position).zfill(5) + '.jpg',
                    'draw_img_name': '/make_image/' + str(video_idx) + "/images/" + str(item_detail.position).zfill(5) + '.jpg',
                    'x': item_detail.x,
                    'y': item_detail.y,
                    'width': item_detail.width,
                    'height': item_detail.height,
                    'classification_item': item_detail.classification_item
                })
            return result(200, '[GET] Select item_detail successful', objects, None, COMPANY_NAME)
        else:
            item_detail_video_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=fk_item_idx, fk_video_idx=video_idx).order_by(TB_ITEM_DETAIL.position.asc()).all()
            if item_detail_video_list is not None:
                for item_detail in item_detail_video_list:
                # if item_detail.position_order == 1:
                    index += 1
                    objects.append({
                        'index': index,
                        'idx': item_detail.idx,
                        'fk_item_idx': item_detail.fk_item_idx,
                        'fk_video_idx': item_detail.fk_video_idx,
                        'position': item_detail.position,
                        'position_order': item_detail.position_order,
                        'image_time': item_detail.position_time,
                        'position_time': int(item_detail.position_time),
                        'position_time_d': str(int((item_detail.position_time%3600)/60)).zfill(2)+":"+str(int(item_detail.position_time%60)).zfill(2),
                        'draw_item_type': item_detail.draw_item_type,
                        # 'draw_img_name': '/modify_images/' + str(video_idx) + "/" + str(fk_item_idx) + '_images/' + str(item_detail.position).zfill(5) + '.jpg',
                        'draw_img_name': '/make_image/' + str(video_idx) + "/images/" + str(item_detail.position).zfill(5) + '.jpg',
                        'x': item_detail.x,
                        'y': item_detail.y,
                        'width': item_detail.width,
                        'height': item_detail.height,
                        'classification_item': item_detail.classification_item
                    })
                a = list({timeP['position_time']: timeP for timeP in objects}.values())
                all_objects.append({
                    "objects": objects,
                    "objects_set": a
                })
                return result(200, '[GET] Select item_detail successful', all_objects, None, COMPANY_NAME)
            return result(404, '[GET] item_detail is not found', None, None, COMPANY_NAME)

    def post(self):
        objects = []
        rect_position = []
        item_detail_exists = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.fk_item_idx, fk_video_idx=self.fk_video_idx, position=self.item_position).first()

        new_detail = TB_ITEM_DETAIL()
        new_detail.fk_item_idx = self.fk_item_idx
        new_detail.fk_video_idx = self.fk_video_idx
        # new_detail.fk_video_idx = 108
        new_detail.position = self.item_position
        new_detail.position_order = self.p_order
        new_detail.position_time = self.p_time
        # self.p_time
        new_detail.x = self.rect_x
        new_detail.y = self.rect_y
        new_detail.width = self.rect_w
        new_detail.height = self.rect_h
        new_detail.make_type = 1
        db.session.add(new_detail)
        db.session.commit()

        item_detail_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.fk_item_idx, fk_video_idx=self.fk_video_idx, position=self.item_position).all()
        detail_exists = True if item_detail_exists != None else False
        for detail_list in item_detail_list:
            rect_position.append({
                'fk_item_idx': detail_list.fk_item_idx,
                'detail_exists': detail_exists,
                'position': detail_list.position,
                'draw_img_name': str(detail_list.position).zfill(5),
                'position_time': int(detail_list.position_time),
                'position_order': detail_list.position_order,
                'x': detail_list.x,
                'y': detail_list.y,
                'width': detail_list.width,
                'height': detail_list.height
            })
        objects.append({
            "rect_position": rect_position
        })
        # for i, t, p, s, d, u in zip(self.item_idx, self.item_title, self.item_price, self.item_shape,
        #                             self.item_description_toggle, self.update_using_status):
        #     print(i, t, p, s, d, u)
        #     item_status = TB_ITEM.query.filter_by(idx=i).first()
        #     item_status.item_title = t
        #     item_status.item_price = p
        #     item_status.item_shape = s
        #     item_status.item_description_toggle = d
        #     item_status.using = u
        #     db.session.commit()
        return result(200, "[POST] item_detail insert successful.", objects, None, COMPANY_NAME)

    def put(self):
        objects = []
        print(self.fk_item_idx, self.item_position, self.p_order)
        rect_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.fk_item_idx, fk_video_idx=self.fk_video_idx, position=self.item_position,
                                                     position_order=self.p_order).first()
        if rect_detail is not None:
            rect_detail.x = int(float(self.rect_x))
            rect_detail.y = int(float(self.rect_y))
            rect_detail.width = int(float(self.rect_w))
            rect_detail.height = int(float(self.rect_h))
            db.session.commit()

        modify_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.fk_item_idx, fk_video_idx=self.fk_video_idx, position=self.item_position).all()
        for mody in modify_detail:
            objects.append({
                'fk_item_idx': mody.fk_item_idx,
                'position': mody.position,
                'position_order': mody.position_order,
                'x': mody.x,
                'y': mody.y,
                'width': mody.width,
                'height': mody.height
            })
        return result(200, "[PUT] item detail update Success", objects, None, COMPANY_NAME)
        # return result(404, "[PUT] item detail update Fail", None, None, COMPANY_NAME)

    def delete(self):
        objects = []
        rect_item_idx = request.args.get('rect_item_idx')
        rect_video_idx = request.args.get('rect_video_idx')
        rect_item_position = request.args.get('rect_position')
        p_order = request.args.get('p_order')

        print(rect_item_idx, rect_item_position, p_order)
        drop_detail_info = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=rect_item_idx, fk_video_idx=rect_video_idx, position=rect_item_position,
                                                          position_order=p_order).first()
        print(drop_detail_info.fk_item_idx, drop_detail_info.position)
        if drop_detail_info is not None:
            db.session.query(TB_ITEM_DETAIL).filter_by(fk_item_idx=rect_item_idx, fk_video_idx=rect_video_idx, position=rect_item_position,
                                                       position_order=p_order).delete()
            db.session.commit()
        modify_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=rect_item_idx, fk_video_idx=rect_video_idx, position=rect_item_position).all()
        if modify_detail != None:
            for mody in modify_detail:
                objects.append({
                    'fk_item_idx': mody.fk_item_idx,
                    'position': mody.position,
                    'position_order': mody.position_order,
                    'x': mody.x,
                    'y': mody.y,
                    'width': mody.width,
                    'height': mody.height
                })
        return result(200, '[DELETE] item detail delete successful', objects, None, COMPANY_NAME)


class Shape(Resource):
    def __init__(self):
        print("Shape INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()

        self.parser.add_argument("video_status_change", type=int, location="json")
        self.parser.add_argument("fk_user_idx", type=int, location="json")
        self.parser.add_argument("main_model", type=int, location="json")
        self.parser.add_argument("video_status_value", type=int, location="json")
        self.parser.add_argument("video_idx", type=int, location="json")

        self.video_status_change = self.parser.parse_args()["video_status_change"]
        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.main_model = self.parser.parse_args()["main_model"]
        self.video_status_value = self.parser.parse_args()["video_status_value"]
        self.video_idx = self.parser.parse_args()["video_idx"]

        super(Shape, self).__init__()

    def get(self):
        print("[GET] Shape")
        objects = []

        all_shape = TB_SHAPE.query.all()
        all_item = TB_ITEM.query.filter_by(using=1).all()
        all_item_count = len(all_item)
        all_video = TB_VIDEO.query.all()
        all_video_list = len(all_video)
        for shape in all_shape:
            all_shape_item = len(TB_ITEM.query.filter_by(fk_item_sub_type=shape.idx).all())
            objects.append({
                'idx': shape.idx,
                'shape_title': shape.shape_title,
                'shape_type': shape.shape_type,
                'shape_img': shape.shape_img,
                'video_total': all_video_list,
                'item_count': all_item_count,
                'all_shape_item': all_shape_item
            })
        return result(200, '[GET] Select shape list successful', objects, None, COMPANY_NAME)

    def post(self):
        objects = []
        modify_model_item = TB_USER.query.filter_by(idx=self.fk_user_idx).first()
        file_absUrl = os.getcwd()
        model_path = file_absUrl + '/titan_sever/ai_model/' + str(self.main_model) + '/model.ckpt.index'
        if os.path.exists(model_path):
            if modify_model_item != None:
                modify_model_item.prev_model_item = self.main_model
                db.session.commit()

                objects.append({'model_status': True, 'user_model': str(modify_model_item.prev_model_item)})
        else:
            objects.append({'model_status': False, 'user_model': '0'})
        return result(200, "[UPDATE] prev_model_item", objects, None, COMPANY_NAME)

    def put(self):
        video_list = TB_VIDEO.query.filter_by(idx=self.video_idx, video_status_value=self.video_status_value).first()

        if video_list is not None:
            video_list.video_status_value = self.video_status_change
            db.session.commit()
        return result(200, '[PUT] video_list able successful', None, None, COMPANY_NAME)


class search_video(Resource):
    """
    [ search_video ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("video_auto_pre", type=int, location="json", action="append")
        self.parser.add_argument("video_auto_change", type=int, location="json")
        self.parser.add_argument("video_pre_idx", type=int, location="json", action="append")

        self.token_manager = TokenManager.instance()
        self.video_auto_pre = self.parser.parse_args()["video_auto_pre"]
        self.video_auto_change = self.parser.parse_args()["video_auto_change"]
        self.video_pre_idx = self.parser.parse_args()["video_pre_idx"]
        super(search_video, self).__init__()

    def get(self):
        objects = []
        video_idx = request.args.get('video_idx')
        fk_group_idx = request.args.get('fk_group_idx')
        search_title = request.args.get('search_title')
        print(search_title)
        search_video_list = TB_VIDEO.query.filter(TB_VIDEO.video_title.like("%" + search_title + "%")).all()
        print(search_video_list)
        # video_all_list = TB_VIDEO.query.all()

        input = self.parser.parse_args()
        limit = int(request.args.get('limit'))
        offset = int(request.args.get('offset'))

        total_count = len(search_video_list)
        video_list = TB_VIDEO.query.filter(TB_VIDEO.video_title.like("%" + search_title + "%")).limit(limit).offset(
            offset)
        current_count = video_list.count()
        next = ''
        previous = ''
        previous_offset = offset - limit
        next_offset = offset + limit
        # Creating a Pagenation
        if offset == 0:
            previous = None
            next = None
        elif offset != 0:
            previous = "/search_video?limit=" + str(limit) + "&offset=" + str(previous_offset)
            if (total_count - (offset + current_count)) > limit:
                next = "/search_video?limit=" + str(limit) + "&offset=" + str(next_offset)
            elif (total_count - (offset + current_count)) <= limit:
                next = None

        meta = {
            "limit": limit,
            "next": next,
            "offset": offset,
            "previous": previous,
            "total_count": total_count
        }
        if current_count == 0:
            meta = {
                "limit": limit,
                "next": 0,
                "offset": offset,
                "previous": 0,
                "total_count": 0
            }
        else:
            for video in video_list:
                objects.append({
                    'idx': video.idx,
                    'fk_user_idx': video.fk_user_idx,
                    'video_source': video.video_source,
                    'video_url': video.video_url,
                    'video_title': video.video_title,
                    'create_date': json_encoder(video.create_date),
                    'video_duration': video.video_duration,
                    'video_status_value': video.video_status_value,
                    'video_auto_preview': video.video_auto_preview
                })
        return result(200, "Video List successful.", objects, meta, COMPANY_NAME)

    def put(self):
        for i, j in zip(self.video_pre_idx, self.video_auto_pre):
            video_status = TB_VIDEO.query.filter_by(idx=i, video_auto_preview=j).first()
            if video_status is not None:
                video_status.video_auto_preview = self.video_auto_change
                db.session.commit()
        return result(200, "video_status change successful.", None, None, COMPANY_NAME)


class shape_video_list(Resource):
    """
    [ shape_video_list ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("shape_video_list INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        self.video_shape_idx = 0
        super(shape_video_list, self).__init__()

    def get(self):
        objects = []

        video_id = request.args.get('video_id')
        main_type = int(request.args.get('main_type'))
        shape_idx = request.args.get('shape_idx')
        # search_title = request.args.get('search_title')
        if video_id != None:
            video_item = TB_VIDEO.query.filter(TB_VIDEO.video_url.like("%" + video_id + "%")).first()
            if video_item == None:
                return result(402, "Video is not exist.", objects, None, COMPANY_NAME)
            objects.append({
                "video": True,
                "video_idx": video_item.idx,
                "video_title": video_item.video_title
            })
            return result(200, "Video play successful.", objects, None, COMPANY_NAME)

        input = self.parser.parse_args()
        limit = int(request.args.get('limit'))
        offset = int(request.args.get('offset'))

        total_video_list = TB_VIDEO.query.all()
        total_count = len(total_video_list)
        # video_list = TB_VIDEO.query.filter_by(fk_user_idx=user_idx).limit(limit).offset(offset)
        video_list = TB_VIDEO.query.limit(limit).offset(offset)
        current_count = video_list.count()
        next = ''
        previous = ''
        previous_offset = offset - limit
        next_offset = offset + limit
        # Creating a Pagenation
        if offset == 0:
            previous = None
            next = None
        elif offset != 0:
            previous = "/shape_video_list?limit=" + str(limit) + "&offset=" + str(previous_offset)
            if (total_count - (offset + current_count)) > limit:
                next = "/shape_video_list?limit=" + str(limit) + "&offset=" + str(next_offset)
            elif (total_count - (offset + current_count)) <= limit:
                next = None

        meta = {
            "limit": limit,
            "next": next,
            "offset": offset,
            "previous": previous,
            "total_count": total_count
        }
        if current_count == 0:
            meta = {
                "limit": limit,
                "next": 0,
                "offset": offset,
                "previous": 0,
                "total_count": 0
            }
        count = 0
        for video in video_list:
            video_shape = TB_ITEM.query.filter_by(fk_video_idx=video.idx, using=1).all()
            for vs in video_shape:
                if shape_idx is not None:
                    self.video_shape_idx = shape_idx
                if vs.fk_item_sub_type == int(self.video_shape_idx) and vs.fk_item_main_type == main_type:
                    if video.video_status_value == 0:
                        objects.append({
                            'idx': video.idx,
                            'fk_user_idx': video.fk_user_idx,
                            'video_source': video.video_source,
                            'video_url': video.video_url,
                            'video_title': video.video_title,
                            'create_date': json_encoder(video.create_date),
                            'video_duration': video.video_duration,
                            'video_auto_preview': video.video_auto_preview,
                            'item_count': len(TB_ITEM.query.filter_by(fk_video_idx=video.idx, using=1).all()),
                            'item_all_count': len(TB_ITEM.query.filter_by(using=1, fk_item_sub_type=vs.fk_item_sub_type,
                                                                          fk_item_main_type=vs.fk_item_main_type).all()),
                            'shape_idx': vs.fk_item_sub_type,
                            'item_idx': vs.idx,
                            'item_title': vs.item_title,
                            'total_count': total_count
                        })
        return result(200, "Shape Video List successful.", objects, meta, COMPANY_NAME)

    def delete(self):
        video_idx = request.args.get('video_idx')

        drop_video_info = TB_VIDEO.query.filter_by(idx=video_idx).first()
        if drop_video_info is not None:
            db.session.query(TB_VIDEO).filter_by(idx=video_idx).delete()
            db.session.commit()
            return result(200, 'video delete successful', None, None, COMPANY_NAME)
        return result(401, 'video delete fail', None, None, COMPANY_NAME)


class admin_video_list(Resource):
    """
        [ admin_video_list ]
        For Mobile Auth
        @ GET : Returns Result
    """

    def __init__(self):
        print("admin_video_list INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("idx", type=str, location="json")
        self.parser.add_argument("video_title", type=str, location="json")
        self.parser.add_argument("video_status_value", type=str, location="json")
        self.parser.add_argument("video_shared", type=str, location="json")
        self.parser.add_argument("video_status_change", type=str, location="json")

        self.token_manager = TokenManager.instance()
        self.idx = self.parser.parse_args()["idx"]
        self.video_title = self.parser.parse_args()["video_title"]
        self.video_status_value = self.parser.parse_args()["video_status_value"]
        self.video_shared = self.parser.parse_args()["video_shared"]
        self.video_status_change = self.parser.parse_args()["video_status_change"]
        self.total_video_list = None

        super(admin_video_list, self).__init__()

    def overlap_obj(self, video_list, total_count):
        objects = []

        for video in video_list:
            if video.video_status_value == 0:
                objects.append({
                    'idx': video.idx,
                    'fk_user_idx': video.fk_user_idx,
                    'video_source': video.video_source,
                    'video_url': video.video_url,
                    'video_title': video.video_title,
                    'create_date': json_encoder(video.create_date),
                    'video_duration': video.video_duration,
                    'video_status_value': video.video_status_value,
                    'video_auto_preview': video.video_auto_preview,
                    'video_shared': video.video_shared,
                    'selectedVideo': True,
                    'selectedPreview': True,
                    'item_count': len(TB_ITEM.query.filter_by(fk_video_idx=video.idx, using=1).all()),
                    'total_count': total_count
                })
            else:
                objects.append({
                    'idx': video.idx,
                    'fk_user_idx': video.fk_user_idx,
                    'video_source': video.video_source,
                    'video_url': video.video_url,
                    'video_title': video.video_title,
                    'create_date': json_encoder(video.create_date),
                    'video_duration': video.video_duration,
                    'video_status_value': video.video_status_value,
                    'video_auto_preview': video.video_auto_preview,
                    'video_shared': video.video_shared,
                    'selectedVideo': False,
                    'selectedPreview': False,
                    'item_count': len(TB_ITEM.query.filter_by(fk_video_idx=video.idx, using=1).all()),
                    'total_count': total_count
                })
        return objects

    def get(self):
        objects = []

        video_id = request.args.get('video_id')
        user_idx = request.args.get('user_idx')
        fk_group_idx = int(request.args.get('fk_group_idx'))
        input = self.parser.parse_args()

        video_filter_and_group = []

        if video_id != None:
            video_item = TB_VIDEO.query.filter(TB_VIDEO.video_url.like("%" + video_id + "%")).first()
            if video_item == None:
                return result(402, "Video is not exist.", objects, None, COMPANY_NAME)
            objects.append({
                "video": True,
                "video_idx": video_item.idx,
                "video_title": video_item.video_title
            })
            return result(200, "Video play successful.", objects, None, COMPANY_NAME)

        if fk_group_idx is not None:
            if fk_group_idx != 1:
                video_filter_and_group.append(TB_VIDEO.fk_user_idx == user_idx)
        video_list = TB_VIDEO.query.filter(and_(*video_filter_and_group)).order_by(TB_VIDEO.create_date.desc()).all()
        total_count = TB_VIDEO.query.filter(and_(*video_filter_and_group)).count()
        # video_list = TB_VIDEO.query.filter(and_(*video_filter_and_group)).limit(limit).offset(offset)
        # total_count = len(total_video_list)
        # print(total_count)
        # current_count = video_list.count()
        # print(current_count)
        # next = ''
        # previous = ''
        # previous_offset = offset - limit
        # next_offset = offset + limit
        # # Creating a Pagenation
        # if offset == 0:
        #     previous = None
        #     next = None
        # elif offset != 0:
        #     previous = "/admin_video_list?limit=" + str(limit) + "&offset=" + str(previous_offset)
        #     if (total_count - (offset + current_count)) > limit:
        #         next = "/admin_video_list?limit=" + str(limit) + "&offset=" + str(next_offset)
        #     elif (total_count - (offset + current_count)) <= limit:
        #         next = None
        #
        # meta = {
        #     "limit": limit,
        #     "next": next,
        #     "offset": offset,
        #     "previous": previous,
        #     "total_count": total_count
        # }
        # if current_count == 0:
        #     meta = {
        #         "limit": limit,
        #         "next": 0,
        #         "offset": offset,
        #         "previous": 0,
        #         "total_count": 0
        #     }
        # else:
        objects = self.overlap_obj(video_list, total_count)
        return result(200, "Video List successful.", objects, None, COMPANY_NAME)

    def put(self):
        video_info = TB_VIDEO.query.filter_by(idx=self.idx).first()

        if video_info is not None:
            video_info.video_title = self.video_title
            video_info.video_status_value = int(self.video_status_value)
            video_info.video_shared = int(self.video_shared)
            db.session.commit()
            return result(200, "[PUT] Update video option successful.", None, None, COMPANY_NAME)
        else:
            return result(500, "[PUT] Update video option failed.", None, None, COMPANY_NAME)

    def delete(self):
        video_drop_idx = request.args.get('video_drop_idx')

        # for j in self.video_drop_idx:
        video_status = TB_VIDEO.query.filter_by(idx=video_drop_idx).first()
        if video_status is not None:
            print(video_status.idx)
            db.session.query(TB_VIDEO).filter_by(idx=video_drop_idx).delete()
            db.session.commit()
        return result(200, "video delete successful.", None, None, COMPANY_NAME)


class search_video(Resource):
    """
    [ search_video ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("video_auto_pre", type=int, location="json", action="append")
        self.parser.add_argument("video_auto_change", type=int, location="json")
        self.parser.add_argument("video_pre_idx", type=int, location="json", action="append")

        self.token_manager = TokenManager.instance()
        self.video_auto_pre = self.parser.parse_args()["video_auto_pre"]
        self.video_auto_change = self.parser.parse_args()["video_auto_change"]
        self.video_pre_idx = self.parser.parse_args()["video_pre_idx"]
        super(search_video, self).__init__()

    def get(self):
        objects = []
        video_idx = request.args.get('video_idx')
        fk_group_idx = request.args.get('fk_group_idx')
        search_title = request.args.get('search_title')
        print(search_title)
        search_video_list = TB_VIDEO.query.filter(TB_VIDEO.video_title.like("%" + search_title + "%")).all()
        print(search_video_list)
        # video_all_list = TB_VIDEO.query.all()

        input = self.parser.parse_args()
        limit = int(request.args.get('limit'))
        offset = int(request.args.get('offset'))

        total_count = len(search_video_list)
        video_list = TB_VIDEO.query.filter(TB_VIDEO.video_title.like("%" + search_title + "%")).limit(limit).offset(
            offset)
        current_count = video_list.count()
        next = ''
        previous = ''
        previous_offset = offset - limit
        next_offset = offset + limit
        # Creating a Pagenation
        if offset == 0:
            previous = None
            next = None
        elif offset != 0:
            previous = "/search_video?limit=" + str(limit) + "&offset=" + str(previous_offset)
            if (total_count - (offset + current_count)) > limit:
                next = "/search_video?limit=" + str(limit) + "&offset=" + str(next_offset)
            elif (total_count - (offset + current_count)) <= limit:
                next = None

        meta = {
            "limit": limit,
            "next": next,
            "offset": offset,
            "previous": previous,
            "total_count": total_count
        }
        if current_count == 0:
            meta = {
                "limit": limit,
                "next": 0,
                "offset": offset,
                "previous": 0,
                "total_count": 0
            }
        else:
            for video in video_list:
                objects.append({
                    'idx': video.idx,
                    'fk_user_idx': video.fk_user_idx,
                    'video_source': video.video_source,
                    'video_url': video.video_url,
                    'video_title': video.video_title,
                    'create_date': json_encoder(video.create_date),
                    'video_duration': video.video_duration,
                    'video_status_value': video.video_status_value,
                    'video_auto_preview': video.video_auto_preview
                })
        return result(200, "Video List successful.", objects, meta, COMPANY_NAME)

    def put(self):
        for i, j in zip(self.video_pre_idx, self.video_auto_pre):
            video_status = TB_VIDEO.query.filter_by(idx=i, video_auto_preview=j).first()
            if video_status is not None:
                video_status.video_auto_preview = self.video_auto_change
                db.session.commit()
        return result(200, "video_status change successful.", None, None, COMPANY_NAME)


class shape_list(Resource):
    """
    [ shape_list ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("shape_list INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        super(shape_list, self).__init__()

    def get(self):
        objects = []

        all_shape = TB_SHAPE.query.all()
        all_item = TB_ITEM.query.filter_by(using=1).all()
        all_item_count = len(all_item)
        all_video = TB_VIDEO.query.all()
        all_video_list = len(all_video)
        for shape in all_shape:
            all_shape_item = len(TB_ITEM.query.filter_by(fk_item_sub_type=shape.idx, using=1).all())
            objects.append({
                'idx': shape.idx,
                'shape_title': shape.shape_title,
                'shape_type': shape.shape_type,
                'shape_img': shape.shape_img,
                'video_total': all_video_list,
                'item_count': all_item_count,
                'all_shape_item': all_shape_item
            })
        return result(200, 'get shape_list successful', objects, None, COMPANY_NAME)


class item_history(Resource):
    def __init__(self):
        print("item_history INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()

        self.parser.add_argument("fk_user_idx", type=int, location="json")
        self.parser.add_argument("fk_item_idx", type=int, location="json")
        self.parser.add_argument("action_status", type=int, location="json")

        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.fk_item_idx = self.parser.parse_args()["fk_item_idx"]
        self.action_status = self.parser.parse_args()["action_status"]
        self.create_date = datetime.now()

        super(item_history, self).__init__()

    def get(self):
        print("[GET] item_history")
        objects = []

        limit = request.args.get('limit')
        offset = request.args.get('offset')
        group_type = request.args.get('group_type')
        history_year = request.args.get('history_year')
        history_month = request.args.get('history_month')

        if group_type == 'year':
            history_years = TB_ITEM_HISTORY.query.group_by(func.year(TB_ITEM_HISTORY.create_date)).all()
            for history in history_years:
                objects.append(history.create_date.year)
            return result(200, '[GET] Select item history year list successful', objects, None, COMPANY_NAME)

        def year_filter(action_status, group):
            history = TB_ITEM_HISTORY.query \
                .with_entities(group, func.count(TB_ITEM_HISTORY.idx)) \
                .filter_by(action_status=action_status).filter(
                extract('year', TB_ITEM_HISTORY.create_date) == history_year) \
                .group_by(group).all()

            return history

        def month_filter(action_status, group):
            history = TB_ITEM_HISTORY.query \
                .with_entities(group, func.count(TB_ITEM_HISTORY.idx)) \
                .filter_by(action_status=action_status).filter(
                extract('year', TB_ITEM_HISTORY.create_date) == history_year) \
                .filter(extract('month', TB_ITEM_HISTORY.create_date) == history_month) \
                .group_by(group).all()

            return history

        def click_filter(action_status):
            history = TB_ITEM_HISTORY.query \
                .with_entities(func.month(TB_ITEM_HISTORY.create_date), func.count(TB_ITEM_HISTORY.idx)) \
                .filter_by(action_status=action_status).filter(
                extract('year', TB_ITEM_HISTORY.create_date) == history_year) \
                .group_by(func.month(TB_ITEM_HISTORY.create_date)).all()

            return history

        if group_type == 'item' or group_type == 'user':
            click_objects = []
            buy_objects = []
            if group_type == 'item':
                click_item_history = year_filter(0, TB_ITEM_HISTORY.fk_item_idx)
                buy_item_history = year_filter(1, TB_ITEM_HISTORY.fk_item_idx)

                if history_month != "0":
                    click_item_history = month_filter(0, TB_ITEM_HISTORY.fk_item_idx)
                    buy_item_history = month_filter(1, TB_ITEM_HISTORY.fk_item_idx)

                for history in click_item_history:
                    click_objects.append({
                        'name': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                        'y': history[1]
                    })

                for history in buy_item_history:
                    buy_objects.append({
                        'name': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                        'y': history[1]
                    })
            elif group_type == 'user':
                click_item_history = year_filter(0, TB_ITEM_HISTORY.fk_user_idx)
                buy_item_history = year_filter(1, TB_ITEM_HISTORY.fk_user_idx)

                if history_month != "0":
                    click_item_history = month_filter(0, TB_ITEM_HISTORY.fk_user_idx)
                    buy_item_history = month_filter(1, TB_ITEM_HISTORY.fk_user_idx)

                print('click_item_history', click_item_history)
                for history in click_item_history:
                    click_objects.append({
                        'name': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                        'y': history[1]
                    })

                for history in buy_item_history:
                    buy_objects.append({
                        'name': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                        'y': history[1]
                    })

            click_month_history = click_filter(0)
            click_months = []
            click_month_objects = []

            buy_month_history = click_filter(1)
            buy_months = []
            buy_month_objects = []

            for history in click_month_history:
                click_months.append(str(history[0]) + '월')
                click_month_objects.append(history[1])

            for history in buy_month_history:
                buy_months.append(str(history[0]) + '월')
                buy_month_objects.append(history[1])

            objects.append({
                'click_objects': click_objects,
                'buy_objects': buy_objects,
                'click_months': click_months,
                'click_month_objects': click_month_objects,
                'buy_months': buy_months,
                'buy_month_objects': buy_month_objects
            })
            return result(200, '[GET] Select item history by item list successful', objects, None, COMPANY_NAME)

        historys = TB_ITEM_HISTORY.query.all()
        if limit is None:
            for history in historys:
                objects.append({
                    'idx': history.idx,
                    'user_id': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                    'item_title': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                    'action_status': history.action_status,
                    'create_date': json_encoder(history.create_date)
                })
            return result(200, '[GET] Select item history list successful', objects, None, COMPANY_NAME)

        list, objects, current_count, meta = Paging(limit, offset, historys, TB_ITEM_HISTORY, "item_history")
        if current_count != 0:
            for history in list:
                objects.append({
                    'idx': history.idx,
                    'user_id': TB_USER.query.filter_by(idx=history.fk_user_idx).first().user_id,
                    'item_title': TB_ITEM.query.filter_by(idx=history.fk_item_idx).first().item_title,
                    'action_status': history.action_status,
                    'create_date': json_encoder(history.create_date)
                })
        return result(200, "[GET] Select item history list paging successful.", objects, meta, COMPANY_NAME)

    def post(self):
        new_history = TB_ITEM_HISTORY()
        new_history.fk_user_idx = self.fk_user_idx
        new_history.fk_item_idx = self.fk_item_idx
        new_history.action_status = self.action_status
        new_history.create_date = self.create_date
        db.session.add(new_history)
        db.session.commit()

        return result(200, 'post item_history successful', None, None, COMPANY_NAME)


class item_list(Resource):
    """
    [ item_list ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("item_list INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        super(item_list, self).__init__()

    def get(self):
        objects = []

        video_idx = request.args.get('video_idx')
        user_idx = request.args.get('user_idx')

        if user_idx != None:
            user_item = TB_ITEM.query.filter_by(fk_user_idx=user_idx).all()
            for item in user_item:
                objects.append({
                    "idx": item.idx,
                    "fk_video_idx": item.fk_video_idx,
                    "fk_user_idx": item.fk_user_idx,
                    "item_title": item.item_title,
                    "item_description": item.item_description,
                    "item_price": item.item_price,
                    "item_redirect_url": item.item_redirect_url,
                    "item_description_url": item.item_description_url,
                    "fk_item_main_type": item.fk_item_main_type,
                    "fk_item_sub_type": item.fk_item_sub_type,
                    "item_img_path": item.item_img_path,
                    "item_shape_type": item.item_shape,
                    "using": item.using,
                    "name": TB_USER.query.filter_by(idx=item.fk_user_idx).first().user_name,
                    "item_description_toggle": item.item_description_toggle
                })
            return result(200, "user_idx item select successful.", objects, None, COMPANY_NAME)
        if video_idx != None:
            video_list = TB_VIDEO.query.filter_by(idx=video_idx).first()
            item_list = TB_ITEM.query.filter_by(fk_video_idx=video_idx).all()
            if item_list == None:
                return result(402, "ITEM is not exist.", objects, None, COMPANY_NAME)

            for item in item_list:
                objects.append({
                    "idx": item.idx,
                    "fk_video_idx": item.fk_video_idx,
                    "fk_user_idx": item.fk_user_idx,
                    "item_title": item.item_title,
                    "item_description": item.item_description,
                    "item_price": item.item_price,
                    "item_redirect_url": item.item_redirect_url,
                    "item_description_url": item.item_description_url,
                    "fk_item_main_type": item.fk_item_main_type,
                    "fk_item_sub_type": item.fk_item_sub_type,
                    "item_img_path": item.item_img_path,
                    "item_shape_type": item.item_shape,
                    "using": item.using,
                    "video_auto_preview": video_list.video_auto_preview,
                    "name": TB_USER.query.filter_by(idx=item.fk_user_idx).first().user_name,
                    "item_description_toggle": item.item_description_toggle
                })
            return result(200, "Item review successful.", objects, None, COMPANY_NAME)

        item_list = TB_ITEM.query.all()
        video_list = TB_VIDEO.query.filter_by(idx=video_idx).first()
        for item in item_list:
            objects.append({
                "idx": item.idx,
                "fk_video_idx": item.fk_video_idx,
                "fk_user_idx": item.fk_user_idx,
                "item_title": item.item_title,
                "item_description": item.item_description,
                "item_price": item.item_price,
                "item_redirect_url": item.item_redirect_url,
                "item_description_url": item.item_description_url,
                "fk_item_main_type": item.fk_item_main_type,
                "fk_item_sub_type": item.fk_item_sub_type,
                "item_img_path": item.item_img_path,
                "item_shape_type": item.item_shape,
                "using": item.using,
                "name": TB_USER.query.filter_by(idx=item.fk_user_idx).first().user_name,
                "item_description_toggle": item.item_description_toggle
            })
        return result(200, "Item list successful.", objects, None, COMPANY_NAME)


class one_item(Resource):
    """
    [ one_item ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("one_item INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        # self.x, y, width, height = 0
        super(one_item, self).__init__()

    def get(self):
        objects = []
        item_idx = request.args.get('item_idx')
        video_idx = request.args.get('video_idx')

        one_item_list = TB_ITEM.query.filter_by(fk_video_idx=video_idx, idx=item_idx).first()
        one_video_list = TB_VIDEO.query.filter_by(idx=video_idx).first()
        if one_item_list and one_video_list is not None:
            objects.append({
                "idx": one_item_list.idx,
                "fk_video_idx": one_item_list.fk_video_idx,
                "fk_user_idx": one_item_list.fk_user_idx,
                "item_title": one_item_list.item_title,
                "item_description": one_item_list.item_description,
                "item_price": one_item_list.item_price,
                "item_redirect_url": one_item_list.item_redirect_url,
                "item_description_url": one_item_list.item_description_url,
                "fk_item_main_type": one_item_list.fk_item_main_type,
                "fk_item_sub_type": one_item_list.fk_item_sub_type,
                "item_img_path": one_item_list.item_img_path,
                "item_shape_type": one_item_list.item_shape,
                "using": one_item_list.using,
                "video_auto_preview": one_video_list.video_auto_preview,
                "name": TB_USER.query.filter_by(idx=one_item_list.fk_user_idx).first().user_name,
                "item_description_toggle": one_item_list.item_description_toggle
            })
            return result(200, "current_item_idx success", objects, None, COMPANY_NAME)
        return result(200, "current_item_idx success", objects, None, COMPANY_NAME)

    def delete(self):
        fk_item_idx = request.args.get('fk_item_idx')

        delItem = TB_ITEM.query.filter_by(idx=fk_item_idx).first()
        if delItem is not None:
            db.session.query(TB_ITEM).filter_by(idx=fk_item_idx).delete()
            db.session.commit()
            return result(200, 'not update item delete success', None, None, COMPANY_NAME)
        return result(401, 'not delete', None, None, COMPANY_NAME)


class get_item(Resource):
    def __init__(self):
        print("get_item INIT")
        self.parser = reqparse.RequestParser()
        self.idx = request.item_idx
        self.token_manager = TokenManager.instance()
        super(get_item, self).__init__()

    def get(self):
        objects = []

        item_idx = request.args.get('item_idx')
        if item_idx != None:
            print("checking!")

            item = TB_ITEM.query.filter_by(idx=item_idx).first()

            if item == None:
                return result(402, "ITEM is not exist.", objects, None, COMPANY_NAME)

            print("item -> ", item)

            objects = {
                "idx": item.idx,
                "item_title": item.item_title,
                "item_description": item.item_description,
                "item_price": item.item_price,
                "item_redirect_url": item.item_redirect_url,
                "fk_item_main_type": item.fk_item_main_type,
                "fk_item_sub_type": item.fk_item_sub_type,
                "item_img_path": item.item_img_path
            }
            return result(200, "Item review successful.", objects, None, COMPANY_NAME)
        return result(200, "Item list success ful.", objects, None, COMPANY_NAME)


class video_add(Resource):
    """
    [ item_list ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("video_add INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("idx", type=str, location="json")
        self.parser.add_argument("fk_user_idx", type=str, location="json")
        self.parser.add_argument("video_source", type=str, location="json")
        self.parser.add_argument("video_url", type=str, location="json")
        self.parser.add_argument("video_title", type=str, location="json")

        self.token_manager = TokenManager.instance()
        self.idx = self.parser.parse_args()["idx"]
        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.video_source = self.parser.parse_args()["video_source"]
        self.video_url = self.parser.parse_args()["video_url"]
        self.video_title = self.parser.parse_args()["video_title"]
        self.create_date = datetime.now()

        super(video_add, self).__init__()

    def post(self):
        objects = []

        new_video = TB_VIDEO()
        new_video.fk_user_idx = self.fk_user_idx
        new_video.video_source = self.video_source
        new_video.video_url = self.video_url
        new_video.video_title = self.video_title
        new_video.create_date = self.create_date
        new_video.video_duration = 0
        new_video.video_status_value = 0
        new_video.video_auto_preview = 0
        new_video.video_shape = 0
        db.session.add(new_video)
        db.session.commit()

        video_idx = request.args.get('video_idx')
        if video_idx != None:
            item = TB_ITEM.query.filter_by(fk_video_idx=video_idx).first()
            if item == None:
                return result(402, "ITEM is not exist.", None, None, COMPANY_NAME)
            objects.append({
                "idx": item.idx,
                "item_title": item.item_title,
                "item_description": item.item_description,
                "item_price": item.item_price,
                "item_redirect_url": item.item_redirect_url,
                "fk_item_main_type": item.fk_item_main_type,
                "fk_item_sub_type": item.fk_item_sub_type,
                "item_img_path": item.item_img_path
            })
            return result(200, "Item review successful.", objects, None, COMPANY_NAME)
        return result(200, "video_add successful.", objects, None, COMPANY_NAME)


# video_make 라는 api와 팝업창을 이용해 디비 값을 저장할 수 있는 그엇
class video_make(Resource):
    """
    [ video_make ]
    For Mobile Auth
    @ GET : Returns Result
    by sisung
    """

    def __init__(self):
        print("video_make INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("item_idx", type=str, location="json")
        self.parser.add_argument("fk_video_idx", type=str, location="json")
        self.parser.add_argument("fk_user_idx", type=str, location="json")
        self.parser.add_argument("item_title", type=str, location="json")
        self.parser.add_argument("item_description", type=str, location="json")
        self.parser.add_argument("item_price", type=str, location="json")
        self.parser.add_argument("item_redirect_url", type=str, location="json")
        self.parser.add_argument("item_description_url", type=str, location="json")
        self.parser.add_argument("fk_item_main_type", type=str, location="json")
        self.parser.add_argument("fk_item_sub_type", type=str, location="json")
        self.parser.add_argument("item_img_path", type=str, location="json")
        self.parser.add_argument("item_shape_type", type=str, location="json")
        self.parser.add_argument("using", type=str, location="json")
        self.parser.add_argument("update_check", type=str, location="json")
        self.parser.add_argument("item_description_toggle", type=str, location="json")
        self.parser.add_argument("video_auto_preview", type=str, location="json")
        self.parser.add_argument("classesNum", type=int, location="json")

        self.token_manager = TokenManager.instance()
        self.idx = self.parser.parse_args()["item_idx"]
        self.fk_video_idx = self.parser.parse_args()["fk_video_idx"]
        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.item_title = self.parser.parse_args()["item_title"]
        self.item_description = self.parser.parse_args()["item_description"]
        self.item_price = self.parser.parse_args()["item_price"]
        self.item_redirect_url = self.parser.parse_args()["item_redirect_url"]
        self.item_description_url = self.parser.parse_args()["item_description_url"]
        self.fk_item_main_type = self.parser.parse_args()["fk_item_main_type"]
        self.fk_item_sub_type = self.parser.parse_args()["fk_item_sub_type"]
        self.item_img_path = self.parser.parse_args()["item_img_path"]
        self.item_shape = self.parser.parse_args()["item_shape_type"]
        self.using = self.parser.parse_args()["using"]
        self.update_check = self.parser.parse_args()["update_check"]
        self.item_description_toggle = self.parser.parse_args()["item_description_toggle"]
        self.video_auto_preview = self.parser.parse_args()["video_auto_preview"]
        self.classesNum = self.parser.parse_args()["classesNum"]
        self.create_date = datetime.now()

        super(video_make, self).__init__()

    def post(self):
        print("item post start")

        objects = []
        input = self.parser.parse_args()
        new_item = TB_ITEM()
        new_item.fk_video_idx = self.fk_video_idx
        new_item.fk_user_idx = self.fk_user_idx
        new_item.create_date = self.create_date
        new_item.item_title = self.item_title
        new_item.item_description = self.item_description
        new_item.item_price = self.item_price
        new_item.item_redirect_url = self.item_redirect_url
        new_item.item_description_url = self.item_description_url
        new_item.fk_item_main_type = self.fk_item_main_type
        new_item.fk_item_sub_type = self.fk_item_sub_type
        new_item.item_img_path = self.item_img_path
        new_item.item_shape = self.item_shape
        new_item.using = self.using
        new_item.item_description_toggle = self.item_description_toggle
        db.session.add(new_item)
        db.session.commit()
        db.session.refresh(new_item)

        video_item = TB_VIDEO.query.filter_by(idx=self.fk_video_idx).first()
        position_item_idx = []
        position_item = TB_ITEM.query.filter_by(fk_video_idx=self.fk_video_idx).all()
        for p in position_item:
            position_item_idx.append(p.idx)
        video_url = ''
        video_source = ''
        if video_item is not None:
            video_url = video_item.video_url
            video_source = video_item.video_source

        objects.append({
            'fk_item_idx': new_item.idx,
            'item_title': new_item.item_title,
            'item_description': new_item.item_description,
            'item_price': new_item.item_price,
            'item_redirect_url': new_item.item_redirect_url,
            'item_description_url': new_item.item_description_url,
            'fk_item_main_type': new_item.fk_item_main_type,
            'fk_item_sub_type': new_item.fk_item_sub_type,
            'item_img_path': new_item.item_img_path,
            'item_shape_type': new_item.item_shape,
            'video_url': video_url,
            'video_source': video_source,
            'position_item': position_item_idx,
            'video_idx': self.fk_video_idx,
            'using': self.using,
            'update_check': self.update_check,
            'item_description_toggle': new_item.item_description_toggle,
            'classesNum': self.classesNum
        })
        return result(200, "item Add successful.", objects, None, "by sisung")

    def put(self):
        print("item update start")
        input = self.parser.parse_args()

        old_item = TB_ITEM.query.filter_by(idx=self.idx).first()
        old_video = TB_VIDEO.query.filter_by(idx=self.fk_video_idx).first()
        file_old_name = UPLOAD_FOLDER + '/0_product.jpg'
        file_new_name = UPLOAD_FOLDER + '/' + str(self.idx) + '_product.jpg'
        if os.path.isfile(file_new_name):
            if os.path.isfile(file_old_name):
                os.remove(file_new_name)
                os.rename(file_old_name, file_new_name)
            else:
                print("image name not change")
        else:
            os.rename(file_old_name, file_new_name)

        old_item.fk_video_idx = self.fk_video_idx
        old_item.fk_user_idx = self.fk_user_idx
        old_item.create_date = self.create_date
        old_item.item_title = self.item_title
        old_item.item_description = self.item_description
        old_item.item_price = self.item_price
        old_item.item_redirect_url = self.item_redirect_url
        old_item.item_description_url = self.item_description_url
        old_item.fk_item_main_type = self.fk_item_main_type
        old_item.fk_item_sub_type = self.fk_item_sub_type
        old_item.item_img_path = '/images/uploads/' + str(self.idx) + '_product.jpg'
        old_item.item_shape = self.item_shape
        old_item.item_description_toggle = self.item_description_toggle
        old_item.item_using = 1
        old_video.video_auto_preview = self.video_auto_preview
        print(old_video.video_auto_preview)
        db.session.commit()
        return result(200, "item Update successful.", None, None, COMPANY_NAME)

    def delete(self):
        print("item delete start")
        d_item_idx = request.args.get('d_item_idx')

        drop_item_info = TB_ITEM.query.filter_by(idx=d_item_idx).first()
        if drop_item_info is not None or self.update_check == 0:
            print("삭제될 idx는?", d_item_idx)
            db.session.query(TB_ITEM).filter_by(idx=d_item_idx).delete()
            db.session.commit()
            return result(200, 'item delete successful', None, None, COMPANY_NAME)
        return result(401, 'item delete fail', None, None, COMPANY_NAME)


class item_detail_list(Resource):
    """
    [ item_detail_list ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("item_detail_list INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        super(item_detail_list, self).__init__()

    def get(self):
        video_id = request.args.get('video_id')
        # video_idx = ''
        video_idx = request.args.get('video_idx')
        objects = []
        items_idx = []

        if (video_idx == None):
            video_info = TB_VIDEO.query.filter(TB_VIDEO.video_url.like("%" + video_id + "%")).first()
            if (video_info):
                video_idx = video_info.idx
            else:
                return result(402, "VIDEO is not exist.", objects, None, COMPANY_NAME)
        item_idx1 = TB_ITEM.query.filter_by(fk_video_idx=video_idx).all()
        for item in item_idx1:
            items_idx.append(item.idx)
        item_detail_list = TB_ITEM_DETAIL.query.filter(TB_ITEM_DETAIL.fk_item_idx.in_(items_idx)).all()
        if item_detail_list is not None:
            for item_detail in item_detail_list:
                objects.append({
                    'idx': item_detail.idx,
                    'fk_item_idx': item_detail.fk_item_idx,
                    'position': item_detail.position,
                    'x': item_detail.x,
                    'y': item_detail.y,
                    'width': item_detail.width,
                    'height': item_detail.height
                })
            return result(200, 'item_detail success', objects, None, COMPANY_NAME)
        return result(401, 'item_detail fail', None, None, COMPANY_NAME)


class item_detail_to_file(Resource):
    """
    [ video_item_detail_to_file ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("video_item_detail_to_file INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        super(item_detail_to_file, self).__init__()

    def get(self):
        input = self.parser.parse_args()
        objects = []
        # shirt_idx = request.args.get('shirt_idx')
        # jean_idx = request.args.get('jean_idx')
        # cap_idx = request.args.get('cap_idx')
        # shoes_idx = request.args.get('shoes_idx')
        # r_idx = request.args.get('r_idx')
        # g_idx = request.args.get('g_idx')
        # b_idx = request.args.get('b_idx')
        # met_idx = request.args.get('met_idx')
        dam_idx = request.args.get('dam_idx')
        # item_detail_r_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=r_idx).all()
        # item_detail_g_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=g_idx).all()
        # item_detail_b_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=b_idx).all()
        # item_detail_met_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=met_idx).all()
        item_detail_dam_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=dam_idx).all()
        w_path = 'test'

        # anotation_path = 'C:\\TitansProj\\titan_ai\\test\\v2Image\\{0}\\annotations\\'.format(w_path)
        # print(anotation_path)
        # for item_detail_r, item_detail_g, item_detail_b, item_detail_met, item_detail_dam in zip(item_detail_r_list, item_detail_g_list, item_detail_b_list, item_detail_met_list, item_detail_dam_list):
        for item_detail_dam in item_detail_dam_list:
            # anotation_path = 'C:\\TitansProj\\titan_ai\\test\\v2Image\\{0}\\annotations\\'.format(w_path) + str(
            anotation_path = 'C:\\TitansProj\\titan_ai\\test\\v2Image\\make\\annotations\\'.format(w_path) + str(
                item_detail_dam.fk_item_idx) + \
                             "_" + str(item_detail_dam.position).zfill(4) + ".anno"
            print("anotation_path :", anotation_path)
            r_area_list = []
            g_area_list = []
            b_area_list = []
            met_area_list = []
            dam_area_list = []

            r_list = []
            g_list = []
            b_list = []
            met_list = []
            dam_list = []
            # if item_detail_shirt.position == item_detail_jean.position:
            # area_r = ((item_detail_r.x/1920)*416, (item_detail_r.y/1080)*416, (item_detail_r.width/1920)*416, (item_detail_r.height/1080)*416)
            # area_g = ((item_detail_g.x/1920)*416, (item_detail_g.y/1080)*416, (item_detail_g.width/1920)*416, (item_detail_g.height/1080)*416)
            # area_b = ((item_detail_b.x/1920)*416, (item_detail_b.y/1080)*416, (item_detail_b.width/1920)*416, (item_detail_b.height/1080)*416)
            # area_met = ((item_detail_met.x/1920)*416, (item_detail_met.y/1080)*416, (item_detail_met.width/1920)*416, (item_detail_met.height/1080)*416)
            area_dam = (
                (item_detail_dam.x / 1920) * 416, (item_detail_dam.y / 1080) * 416,
                (item_detail_dam.width / 1920) * 416,
                (item_detail_dam.height / 1080) * 416)

            # for r in area_r:
            #     r_list.append(float(r))
            # for g in area_g:
            #     g_list.append(float(g))
            # for b in area_b:
            #     b_list.append(float(b))
            # for met in area_met:
            #     met_list.append(float(met))
            for dam in area_dam:
                dam_list.append(float(dam))

            r_area_list.append(r_list)
            g_area_list.append(g_list)
            b_area_list.append(b_list)
            met_area_list.append(met_list)
            dam_area_list.append(dam_list)

            obj = {
                # "recode": r_area_list,
                # "cauldron": g_area_list,
                # "fan": b_area_list,
                # "metdol": met_area_list,
                "face": dam_area_list
            }

            print("obj : ", obj)
            with open(anotation_path, 'w') as f:
                json.dump(obj, f, ensure_ascii=False)
        return result(200, "Video item detail List successful.", None, None, COMPANY_NAME)


class item_position_detail(Resource):
    """
        [ item_position_detail ]
        For Mobile Auth
        @ GET : Returns Result
        """

    def __init__(self):
        print("item_position_detail INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("item_idx", type=str, location="json")
        self.parser.add_argument("position_time", type=str, location="json")
        # self.parser.add_argument("item_idx", type=str, location="json", action="append")
        self.parser.add_argument("image_frame", type=str, location="json")
        self.parser.add_argument("video_idx", type=str, location="json")

        self.token_manager = TokenManager.instance()
        self.item_idx = self.parser.parse_args()["item_idx"]
        self.position_time = self.parser.parse_args()["position_time"]
        self.image_frame = self.parser.parse_args()["image_frame"]
        self.video_idx = self.parser.parse_args()["video_idx"]
        self.position_detail = ''
        super(item_position_detail, self).__init__()

    def post(self):
        objects = []
        # image_frame = request.args.get('image_frame')
        # item_idx = request.args.get('item_idx')
        # video_idx = request.args.get('video_idx')
        if self.image_frame != None:
            # for i in self.item_idx:
            position_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.item_idx, fk_video_idx=self.video_idx, position=self.image_frame, position_time=self.position_time).all()
            for p_detail in position_detail:
                # if p_detail.draw_item_type == 2:
                objects.append({
                    'draw_img_name': '/modify_images/' + str(self.video_idx) + "/" + str(self.item_idx) + '_images/' + str(p_detail.position).zfill(5) + '.jpg',
                    'position': p_detail.position,
                    'position_time': p_detail.position_time,
                    'position_order': p_detail.position_order,
                    'draw_item_type': p_detail.draw_item_type,
                    'fk_item_idx': p_detail.fk_item_idx,
                    'fk_video_idx': p_detail.fk_video_idx,
                    'x': p_detail.x,
                    'y': p_detail.y,
                    'width': p_detail.width,
                    'height': p_detail.height,
                    'classification_item': p_detail.classification_item if p_detail.classification_item != None else None
                })
        else:
            # for i in self.item_idx:
            #     print(i)
            image_modify_frame = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.item_idx, fk_video_idx=self.video_idx).first()
            if image_modify_frame == None:
                return result(404, "item_modify_frame not found", None, None, COMPANY_NAME)
            self.image_frame = image_modify_frame.position
            position_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.item_idx, fk_video_idx=self.video_idx, position=self.image_frame).all()
            for p_detail in position_detail:
                # if p_detail.draw_item_type == 2:
                objects.append({
                    'draw_img_name': '/modify_images/' + str(self.video_idx) + "/" + str(self.item_idx) + '_images/' + str(p_detail.position).zfill(5) + '.jpg',
                    'position': p_detail.position,
                    'position_time': p_detail.position_time,
                    'position_order': p_detail.position_order,
                    'draw_item_type': p_detail.draw_item_type,
                    'fk_item_idx': p_detail.fk_item_idx,
                    'fk_video_idx': p_detail.fk_video_idx,
                    'x': p_detail.x,
                    'y': p_detail.y,
                    'width': p_detail.width,
                    'height': p_detail.height,
                    'classification_item': p_detail.classification_item if p_detail.classification_item != None else None
                })
        return result(200, "item_position_detail get success", objects, None, COMPANY_NAME)

class video_capture(Resource):
    def __init__(self):
        print("videoCapture INIT")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("video_idx", type=str, location="json")
        self.parser.add_argument("fk_video_idx", type=str, location="json")
        self.parser.add_argument("video_url", type=str, location="json")
        # self.parser.add_argument("image_frame", type=str, location="json", action="append")
        # self.parser.add_argument("item_idx", type=str, location="json", action="append")
        self.parser.add_argument("image_frame", type=str, location="json")
        self.parser.add_argument("item_idx", type=str, location="json")
        self.parser.add_argument("video_current_time", type=int, location="json")
        self.parser.add_argument("video_duration_time", type=int, location="json")
        self.parser.add_argument("show_item_idx", type=str, location="json")
        self.parser.add_argument("fk_user_idx", type=str, location="json")

        self.token_manager = TokenManager.instance()
        self.video_idx = self.parser.parse_args()["video_idx"]
        self.fk_video_idx = self.parser.parse_args()["fk_video_idx"]
        self.video_url = self.parser.parse_args()["video_url"]
        self.image_frame = self.parser.parse_args()["image_frame"]
        self.item_idx = self.parser.parse_args()["item_idx"]
        self.video_current_time = self.parser.parse_args()["video_current_time"]
        self.duration_time = self.parser.parse_args()["video_duration_time"]
        self.show_item_idx = self.parser.parse_args()["show_item_idx"]
        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.cur = 0
        self.count = 0
        self.image_fps = 0
        self.divide_number = 10
        self.last_position = ''
        self.last_time = 0
        super(video_capture, self).__init__()

    def get(self):
        objects = []
        video_url = request.args.get('video_url')
        folder_name = str(request.args.get('folder_name'))
        init = str(request.args.get('init'))

        image_path = MODEL_IMAGE_DIR + folder_name + '/all_images'

        if init == '1':
            if os.path.exists(image_path):
                shutil.rmtree(image_path, ignore_errors=True)
            os.makedirs(image_path)

        try:
            vPafy = pafy.new(video_url)
        except Exception as e:
            print(e)
            return result(500, "capture fail", None, None, COMPANY_NAME)

        best = vPafy.getbest(preftype="mp4")
        cap = cv2.VideoCapture(best.url)
        retval, frame = cap.read()
        total_frame = int(cap.get(7))
        position = 1

        while (retval):
            retval, frame = cap.read()
            if position % 10 == 0:
                image_name = str(total_frame) + '_' + str(position).zfill(5)
                image = image_path + '/' + image_name + '.jpg'
                cv2.imwrite(image, frame)
                objects.append(image_name)

            position += 1

        cap.release()
        cv2.destroyAllWindows()

        return result(200, "capture successful", objects, None, COMPANY_NAME)

    def post(self):
        objects = []
        print(self.video_idx)
        print(self.item_idx)
        file_path = MODIFY_IMAGES_DIR + str(self.video_idx) + '/'
        if self.video_url == None:
            self.video_url = TB_VIDEO.query.filter_by(idx=self.video_idx).first().video_url

        images_file_path = file_path + str(self.item_idx) + '_images/'
        directory = os.path.dirname(images_file_path)
        if not os.path.exists(directory):
            os.makedirs(directory)
        # files = glob.glob(images_file_path + '*')
        # for f in files:
        #     os.remove(f)
        url = self.video_url
        vPafy = pafy.new(url)
        position = 0
        try:
            vPafy = pafy.new(url)
        except Exception as e:
            print(e)
            return result(500, 'fail capture', None, None, COMPANY_NAME)
        # for im, idx in zip(self.image_frame, self.item_idx):
        if self.image_frame != None:
            play = vPafy.getbest(preftype="mp4")
            cap = cv2.VideoCapture(play.url)
            current_frame = int(self.image_frame)
            cap.set(1, current_frame)
            file_name = images_file_path + str(current_frame).zfill(5) + '.jpg'
            success, image = cap.read()
            cv2.imwrite(file_name, image)
            current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
        else:
            play = vPafy.getbest(preftype="mp4")
            cap = cv2.VideoCapture(play.url)
            # success, frame = cap.read()
            # while(success):
            # success, frame = cap.read()
            image_frame = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.item_idx,
                                                         fk_video_idx=self.video_idx).all()
            for i in image_frame:
                if int(i.position) % 3000 == 0:
                    self.image_frame = int(i.position)
                    cap.set(1, self.image_frame)
                    file_name = images_file_path + str(self.image_frame).zfill(5) + '.jpg'
                    success, image = cap.read()
                    cv2.imwrite(file_name, image)
                    current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000

                    position_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.item_idx, position=self.image_frame, fk_video_idx=self.video_idx).all()
                    for p_detail in position_detail:
                        objects.append({
                            'fk_item_idx': p_detail.fk_item_idx,
                            'fk_video_idx': p_detail.fk_video_idx,
                            'position': p_detail.position,
                            'position_time': current_time,
                            'draw_img_name': '../modify_images/'+ str(self.video_idx) + "/" + str(self.item_idx) + '_images/' + str(p_detail.position).zfill(5)+ '.jpg',
                            'position_order': p_detail.position_order,
                            'x': p_detail.x,
                            'y': p_detail.y,
                            'width': p_detail.width,
                            'height': p_detail.height
                        })
        cap.release()
        cv2.destroyAllWindows()

        # self.add_image_capture()

        # images_file_path = file_path + str(self.show_item_idx) + '_images/'
        # directory = os.path.dirname(images_file_path)
        # if not os.path.exists(directory):
        #     os.makedirs(directory)
        # files = glob.glob(images_file_path + '*')
        # for f in files:
        #     os.remove(f)
        # url = video_url
        # vPafy = pafy.new(url)
        # play = vPafy.getbest(preftype="mp4")
        # cap = cv2.VideoCapture(play.url)
        # total_frame = int(cap.get(7))
        # current_frame = round(total_frame / self.duration_time * self.video_current_time)
        # if current_frame <= 0:
        #     success, image = cap.read()
        #     self.cur = 10
        # else:
        #     cap.set(1, current_frame)
        #     success, image = cap.read()
        #     self.cur = int(cap.get(1))
        #
        # last_position = db.session.query(func.max(TB_ITEM_DETAIL.position)).filter_by(
        #     fk_item_idx=self.show_item_idx).first()
        #
        # while (success):
        #     success, frame = cap.read()
        #     Isposition = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=self.show_item_idx, position=self.cur).first()
        #     if Isposition is not None:
        #         if int(Isposition.position) % self.divide_number == 0:
        #             file_name = images_file_path + str(Isposition.position).zfill(5) + '.jpg'
        #             cv2.imwrite(file_name, frame)
        #             self.count += len(glob.glob(file_name))
        #             self.last_position = str(Isposition.position).zfill(5)
        #             self.last_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
        #             # self.modify_image_capture(str(Isposition.position).zfill(5), 0, self.last_time)
        #             objects.append({
        #                 str(Isposition.position): str(Isposition.position).zfill(5),
        #                 "image_name": "/modify_images/" + str(self.video_idx) + "/" + str(
        #                     self.show_item_idx) + "_images/" + str(Isposition.position).zfill(5) + ".jpg",
        #                 "image_count": self.count,
        #                 "image_frame": str(Isposition.position).zfill(5),
        #                 "second": cap.get(cv2.CAP_PROP_POS_MSEC) / 1000,
        #                 "current_position": str(Isposition.position).zfill(5),
        #                 "total_frame": int(last_position[0]),
        #                 "divide_number": self.divide_number,
        #                 "Isposition": True
        #             })
        #         if self.count == 7:
        #             cap.release()
        #             cv2.destroyAllWindows()
        #             break
        #     self.cur += 1
        #
        # # self.modify_image_capture(self.last_position, 1, self.last_time)
        # cap.release()
        # cv2.destroyAllWindows()
        return result(200, "capture successful", objects, None, COMPANY_NAME)

    def add_image_capture(self):
        editors = TB_EDITOR.query.filter_by(fk_item_idx=self.show_item_idx).first()
        if editors == None:
            new_editor = TB_EDITOR()
            new_editor.fk_user_idx = self.fk_user_idx
            new_editor.fk_item_idx = self.show_item_idx
            new_editor.modify_position = None
            new_editor.modify_second = 0
            new_editor.editor_status = 0
            db.session.add(new_editor)
            db.session.commit()
        else:
            editors.fk_item_idx = self.show_item_idx
            editors.fk_user_idx = self.fk_user_idx
            editors.modify_position = None
            editors.modify_second = 0
            editors.editor_status = 0
            db.session.commit()

    def modify_image_capture(self, draw_img, progress_num, last_time):
        editors = TB_EDITOR.query.filter_by(fk_item_idx=self.show_item_idx).first()
        if editors is not None:
            editors.fk_item_idx = self.show_item_idx
            editors.fk_user_idx = self.fk_user_idx
            editors.modify_position = draw_img
            editors.modify_second = last_time
            editors.editor_status = progress_num
            db.session.commit()


class editor_list(Resource):
    def __init__(self):
        print("editor_list INIT")
        self.parser = reqparse.RequestParser()
        self.check = False
        self.token_manager = TokenManager.instance()
        super(editor_list, self).__init__()

    def get(self):
        objects = []
        item_idx = request.args.get('item_idx')
        fk_video_idx = request.args.get('fk_video_idx')

        file_path = MODIFY_IMAGES_DIR + str(fk_video_idx) + '/' + str(item_idx) + '_images/'

        editor_list = TB_EDITOR.query.filter_by(fk_item_idx=item_idx).first()
        if editor_list is not None:
            img_file = file_path + str(editor_list.modify_position).zfill(5) + '.jpg'
            if editor_list.modify_position != None:
                item_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_idx). \
                    filter_by(position=editor_list.modify_position).first()
                item_detail_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_idx). \
                    filter_by(position=editor_list.modify_position).all()
                if item_detail is None:
                    objects.append({
                        "fk_item_idx": editor_list.fk_item_idx,
                        "modify_position": str(editor_list.modify_position).zfill(5),
                        "second": editor_list.modify_second,
                        "editor_status": int(editor_list.editor_status),
                        "current_position": str(editor_list.modify_position).zfill(5),
                        "check": self.check
                    })
                else:
                    if os.path.isfile(img_file):
                        self.check = True
                    else:
                        self.check = False
                    objects.append({
                        "fk_item_idx": editor_list.fk_item_idx,
                        "modify_position": str(editor_list.modify_position).zfill(5),
                        "second": editor_list.modify_second,
                        "editor_status": int(editor_list.editor_status),
                        "current_position": str(editor_list.modify_position).zfill(5),
                        "check": self.check
                    })

            return result(200, "[GET] Editor list successful", objects, None, COMPANY_NAME)
        return result(404, "[GET] Editor list fail", None, None, COMPANY_NAME)


class train_thum_List(Resource):
    """
    [ train_thum_List ]
    For Mobile Auth
    @ GET : Returns Result
    """

    def __init__(self):
        print("train_thum_List INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        super(train_thum_List, self).__init__()

    def get(self):
        input = self.parser.parse_args()
        objects = []
        limit = int(request.args.get('limit'))
        offset = int(request.args.get('offset'))
        item_index = int(request.args.get('item_index'))
        print("item_index : ", item_index)

        total_item_detail_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_index).all()
        print("total_item_detail_list len:", len(total_item_detail_list))
        total_count = len(total_item_detail_list)
        item_detail_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_index).order_by('position').limit(
            limit).offset(offset)
        current_count = item_detail_list.count()
        next = ''
        previous = ''

        previous_offset = offset - limit
        next_offset = offset + limit
        # Creating a Pagenation
        if offset == 0:
            previous = None
            next = None
        elif offset != 0:
            previous = "/train_thum_List?limit=" + str(limit) + "&offset=" + str(
                previous_offset) + "&item_index=" + str(item_index)
            if (total_count - (offset + current_count)) > limit:
                next = "/train_thum_List?limit=" + str(limit) + "&offset=" + str(next_offset) + "&item_index=" + str(
                    item_index)
            elif (total_count - (offset + current_count)) <= limit:
                next = None

        meta = {
            "limit": limit,
            "next": next,
            "offset": offset,
            "previous": previous,
            "total_count": total_count
        }
        if current_count == 0:
            meta = {
                "limit": limit,
                "next": 0,
                "offset": offset,
                "previous": 0,
                "total_count": 0
            }

            objects.append({
            })
        else:
            for item_detail in item_detail_list:
                objects.append({
                    'idx': item_detail.idx,
                    'fk_item_idx': item_detail.fk_item_idx,
                    'position': item_detail.position,
                    'x': item_detail.x,
                    'y': item_detail.y,
                    'width': item_detail.width,
                    'height': item_detail.height
                })
        return result(200, "train_thum_List List successful.", objects, meta, COMPANY_NAME)


###########################################################################################
# class YOLO_SAVER:
#     def __init__(self, yolo_version=2, model_path='./titan_sever/ai_model/0_8/model.ckpt'):
#         # def __init__(self, yolo_version=3, model_path=cfg.TEST.WEIGHT_FILE):
#         self.yolo_version = yolo_version
#         self.model_path = model_path
#
#     def main(self):
#         global SESS
#
#         graph = tf.get_default_graph()
#         config = tf.ConfigProto()
#         config.gpu_options.allow_growth = True
#         # tf.reset_default_graph()
#         if self.yolo_version == 2:
#             self.version = YOLO_V2()
#         elif self.yolo_version == 3:
#             self.version = YOLO_V3()
#
#         self.version.input_data()
#         SESS = tf.Session(graph=graph, config=config)
#         # self.saver = tf.train.Saver()
#         # self.yolo_restore()
#
#         return self.version
#
#     def yolo_restore(self):
#         self.saver.restore(SESS, self.model_path)


class YOLO_V2:
    def __init__(self, model_idx):
        self.model_idx = model_idx
        self.im_size = (416, 416)
        self.model_path = './titan_sever/ai_model/' + model_idx
        # if os.path.isfile(self.model_path):
        self.model_name = "/model.ckpt"
        self.anchors = dataset.load_json('anchors.json')
        self.classes = dataset.load_json(self.model_path + '/classes.json')
        self.num_classes = len(self.classes)

        graph = tf.get_default_graph()
        config = tf.ConfigProto()
        config.gpu_options.allow_growth = True
        self.sess = tf.Session(graph=graph, config=config)

    def input_data(self):
        self.model = ConvNet([self.im_size[0], self.im_size[1], 3], self.num_classes, self.anchors,
                             grid_size=(self.im_size[0] // 32, self.im_size[1] // 32))

    def make_model(self, data_dir, epochs):
        X_trainval, y_trainval = dataset.read_data(data_dir, self.im_size, model_idx=self.model_idx)
        trainval_size = X_trainval.shape[0]
        val_size = int(trainval_size * 0.1)
        val_set = dataset.DataSet(X_trainval[:val_size], y_trainval[:val_size])
        train_set = dataset.DataSet(X_trainval[val_size:], y_trainval[val_size:])

        hp_d = dict()
        hp_d['batch_size'] = 2
        hp_d['num_epochs'] = epochs
        hp_d['init_learning_rate'] = 1e-4
        hp_d['momentum'] = 0.9
        hp_d['learning_rate_patience'] = 10
        hp_d['learning_rate_decay'] = 0.1
        hp_d['eps'] = 1e-8
        hp_d['score_threshold'] = 1e-4
        hp_d['nms_flag'] = True

        model = ConvNet([self.im_size[0], self.im_size[1], 3], self.num_classes, self.anchors,
                        grid_size=(self.im_size[0] // 32, self.im_size[1] // 32))

        evaluator = Evaluator()
        optimizer = Optimizer(model, train_set, evaluator, val_set=val_set, **hp_d)

        train_results = optimizer.train(self.sess, save_dir=self.model_path, details=True, verbose=True, **hp_d)

    def restore(self):
        self.input_data()
        saver = tf.train.Saver()
        saver.restore(self.sess, self.model_path + self.model_name)

    def draw(self, image, detection=False):
        X_test, y_test = dataset.read_data(image, self.im_size, no_label=True)
        test_set = dataset.DataSet(X_test, y_test)
        nms_flag = True
        hp_d = dict()
        hp_d['batch_size'] = 16
        hp_d['nms_flag'] = nms_flag
        draw_image = None
        boxes = []
        class_idx = -1

        test_y_pred = self.model.predict(self.sess, test_set, **hp_d)
        for img, y_pred in zip(test_set.images, test_y_pred):
            if nms_flag:
                bboxes = predict_nms_boxes(y_pred, conf_thres=0.5, iou_thres=0.45)
            else:
                bboxes = convert_boxes(y_pred)
            bboxes = bboxes[np.nonzero(np.any(bboxes > 0, axis=1))]
            if len(str(bboxes)) > 2:
                draw_image = draw_pred_boxes(img, bboxes, self.classes)
                if detection:
                    for box in bboxes:
                        boxes.append({
                            "left": box[0] * 1920,
                            "top": box[1] * 1080,
                            "width": box[2] * 1920,
                            "height": box[3] * 1080,
                            "shape": int(np.argmax(box[5:]))
                        })
                else:
                    for box in bboxes:
                        boxes.append({
                            "left": box[0] * 1920,
                            "top": box[1] * 1080,
                            "width": box[2] * 1920,
                            "height": box[3] * 1080
                        })
        return draw_image, boxes


class AI_MODEL:
    def __init__(self, model_name='detect', img_size=640):
        sys.path.insert(0, './titan_sever/ai')
        self.model_path = './titan_sever/ai/model/'
        self.model = self.model_path + model_name + '.pt'

        self.device = select_device('')
        self.half = self.device.type != 'cpu'
        self.model = attempt_load(self.model, map_location=self.device)
        if self.half:
            self.model.half()
        self.img_size = check_img_size(img_size, s=self.model.stride.max())
        self.names = self.model.module.names if hasattr(self.model, 'module') else self.model.names
        self.colors = [[random.randint(0, 255) for _ in range(3)] for _ in self.names]

        self.items = {'top': [], 'bottom': [], 'skirt': [], 'shoes': [], 'cap': [], 'golfball': [], 'golfbag': [], 'golfclub': []}

    def detect(self, image, position):
        ori_img = image.copy()
        height, width, channels = image.shape
        h = 1080 / height
        w = 1920 / width

        img = image.copy()
        img = letterbox(img, new_shape=self.img_size)[0]
        img = img[:, :, ::-1].transpose(2, 0, 1)
        img = np.ascontiguousarray(img)
        img = torch.from_numpy(img).to(self.device)
        img = img.half() if self.half else img.float()
        img /= 255.0
        if img.ndimension() == 3:
            img = img.unsqueeze(0)

        pred = self.model(img, augment='')[0]
        pred = non_max_suppression(pred)

        boxes = []
        for i, det in enumerate(pred):
            if len(det):
                det[:, :4] = scale_coords(img.shape[2:], det[:, :4], image.shape).round()

                for *xyxy, conf, cls in reversed(det):
                    label = f'{self.names[int(cls)]} {conf:.2f}'
                    self.items, c1, c2 = plot_one_box(xyxy, image, label=label, color=self.colors[int(cls)], line_thickness=3,
                                         items=self.items, frame=position, ori_img=ori_img)

                    boxes.append({
                        "item_type": int(cls),
                        "x": c1[0] * w,
                        "y": c1[1] * h,
                        "width": (c2[0] - c1[0]) * w,
                        "height": (c2[1] - c1[1]) * h
                    })
        return image, boxes


##########################################################################################

class titan_model(Resource):
    def __init__(self):
        print("titan_model INIT")
        self.parser = reqparse.RequestParser()

        self.parser.add_argument("classes", type=list, location="json")
        self.parser.add_argument("annotations", type=str, location="json")
        self.classes = self.parser.parse_args()["classes"]
        self.annotations = self.parser.parse_args()["annotations"]

        self.parser.add_argument("user_idx", type=str, location="json")
        self.parser.add_argument("model_idx", type=str, location="json")
        self.parser.add_argument("model_title", type=str, location="json")
        self.parser.add_argument("model_description", type=str, location="json")
        self.parser.add_argument("model_epochs", type=int, location="json")
        self.parser.add_argument("model_access", type=str, location="json")
        self.parser.add_argument("create_model", type=int, location="json")
        self.parser.add_argument("update", type=int, location="json")

        self.user_idx = self.parser.parse_args()["user_idx"]
        self.model_idx = self.parser.parse_args()["model_idx"]
        self.model_title = self.parser.parse_args()["model_title"]
        self.model_description = self.parser.parse_args()["model_description"]
        self.model_epochs = self.parser.parse_args()["model_epochs"]
        self.model_access = self.parser.parse_args()["model_access"]
        self.create_model = self.parser.parse_args()["create_model"]
        self.update = self.parser.parse_args()["update"]
        self.create_date = datetime.now()

        super(titan_model, self).__init__()

    def get(self):
        print("[GET] titan_model")
        objects = []

        limit = request.args.get('limit')
        offset = request.args.get('offset')
        model_idx = request.args.get('model_idx')
        epochs = request.args.get('epochs')

        if model_idx and epochs is not None:
            self.train_model(model_idx, int(epochs))
            return result(200, "successful", None, None, COMPANY_NAME)

        models = TB_MODEL.query.all()

        if model_idx is not None:
            model = TB_MODEL.query.filter_by(idx=model_idx).first()

            if model is None:
                return result(404, "Model is not found.", None, None, COMPANY_NAME)

            model_info = {
                'idx': model.idx,
                'user_id': TB_USER.query.filter_by(idx=model.fk_user_idx).first().user_id,
                'model_title': model.model_title,
                'model_description': model.model_description,
                'model_epochs': model.model_epochs,
                'model_access': model.model_access,
                'model_status': model.model_status,
                'create_date': json_encoder(model.create_date),
            }

            upload_images_path = UPLOAD_BUILDER_IMAGES_DIR + model_idx
            builder_images_path = BUILDER_GENERATED_IMAGES_DIR + model_idx + '/all_images'
            crawling_images_path = CRAWLER_IMAGES_DIR + model_idx

            upload_image_list = []
            builder_image_list = []
            crawling_image_list = []

            if os.path.exists(upload_images_path):
                images = os.listdir(upload_images_path)
                for image in images:
                    upload_image_list.append(image)

            if os.path.exists(builder_images_path):
                images = os.listdir(builder_images_path)
                for image in images:
                    builder_image_list.append(image)

            if os.path.exists(crawling_images_path):
                images = os.listdir(crawling_images_path)
                for image in images:
                    crawling_image_list.append(image)

            anno_list = TB_ANNOTATION.query.filter_by(fk_model_idx=model_idx).all()

            anno = {}
            class_list = []
            for an in anno_list:
                class_name = TB_SHAPE.query.filter_by(idx=an.fk_shape_idx).first().shape_type
                if class_name not in class_list:
                    class_list.append(class_name)
                image_name = an.image_name
                rect = [an.xmin, an.ymin, an.xmax, an.ymax]
                if image_name in anno:
                    if class_name in anno[image_name]:
                        anno[image_name][class_name].append(rect)
                    else:
                        anno[image_name][class_name] = [rect]
                else:
                    anno[image_name] = {}
                    anno[image_name][class_name] = [rect]

            objects.append({
                'model_info': model_info,
                'upload_image_list': upload_image_list,
                'builder_image_list': builder_image_list,
                'crawling_image_list': crawling_image_list,
                'anno_list': anno,
                'class_list': class_list
            })
            return result(200, "[GET] Select image (name) list successful.", objects, None, COMPANY_NAME)

        if limit is not None:
            list, objects, current_count, meta = Paging(limit, offset, models, TB_MODEL, "titan_model")
            if current_count != 0:
                for model in list:
                    objects.append({
                        'idx': model.idx,
                        'user_id': TB_USER.query.filter_by(idx=model.fk_user_idx).first().user_id,
                        'model_title': model.model_title,
                        'model_description': model.model_description,
                        'model_epochs': model.model_epochs,
                        'model_access': model.model_access,
                        'model_status': model.model_status,
                        'create_date': json_encoder(model.create_date),
                    })
            return result(200, "[GET] Select titan model list paging successful.", objects, meta, COMPANY_NAME)

        for model in models:
            objects.append({
                'idx': model.idx,
                'user_id': TB_USER.query.filter_by(idx=model.fk_user_idx).first().user_id,
                'model_title': model.model_title,
                'model_description': model.model_description,
                'model_epochs': model.model_epochs,
                'model_access': model.model_access,
                'model_status': model.model_status,
                'create_date': json_encoder(model.create_date),
            })
        return result(200, "[GET] Select titan model list successful.", objects, None, COMPANY_NAME)

        # return result(200, "[GET] Select user_idx's titan model list successful.", objects, None, COMPANY_NAME)

    def post(self):
        objects = []
        print("[POST] titan_model")

        new_model = TB_MODEL()
        new_model.fk_user_idx = self.user_idx
        new_model.model_title = self.model_title
        new_model.model_description = self.model_description
        new_model.model_epochs = self.model_epochs
        new_model.model_access = self.model_access
        new_model.create_date = self.create_date
        new_model.model_status = 0
        db.session.add(new_model)
        db.session.commit()

        model_idx = new_model.idx
        generated_image_path = BUILDER_GENERATED_IMAGES_DIR + str(model_idx) + '/all_images'
        if os.path.exists(generated_image_path):
            shutil.rmtree(generated_image_path, ignore_errors=True)
        os.makedirs(generated_image_path)

        upload_image_path = UPLOAD_BUILDER_IMAGES_DIR + str(model_idx)
        if os.path.exists(upload_image_path):
            shutil.rmtree(upload_image_path, ignore_errors=True)
        os.makedirs(upload_image_path)

        objects.append({
            'model_idx': model_idx
        })

        return result(200, "Model make successful", objects, None, COMPANY_NAME)

    def put(self):
        print("[PUT] titan_model")

        if update is None:
            model = TB_MODEL.query.filter_by(model_title=self.model_title).all()
            if model is not None:
                return result(402, "Model is exist", None, None, COMPANY_NAME)

        model_info = TB_MODEL.query.filter_by(idx=self.model_idx).first()
        if model_info is not None:
            model_info.model_title = self.model_title
            model_info.model_description = self.model_description
            model_info.model_epochs = self.model_epochs
            model_info.model_access = self.model_access
            model_info.create_date = self.create_date
            model_info.model_status = 0
            db.session.commit()

            self.add_schedule()

            return result(200, "successful", None, None, COMPANY_NAME)
        return result(404, "[PUT] Model is not found", None, None, COMPANY_NAME)

    def delete(self):
        print("[DELETE] titan_model")

        model_idx = request.args.get('model_idx')
        model = TB_MODEL.query.filter_by(idx=model_idx).first()

        if model is not None:
            db.session.query(TB_MODEL).filter_by(idx=model_idx).delete()
            db.session.commit()

            build_image_path = BUILDER_GENERATED_IMAGES_DIR + model_idx
            if os.path.exists(build_image_path):
                shutil.rmtree(build_image_path, ignore_errors=True)

            crawling_image_path = CRAWLER_IMAGES_DIR + model_idx
            if os.path.exists(crawling_image_path):
                shutil.rmtree(crawling_image_path, ignore_errors=True)

            upload_image_path = UPLOAD_BUILDER_IMAGES_DIR + model_idx
            if os.path.exists(upload_image_path):
                shutil.rmtree(upload_image_path, ignore_errors=True)

            anno_list = TB_ANNOTATION.query.filter_by(fk_model_idx=model_idx).first()
            if anno_list is not None:
                db.session.query(TB_ANNOTATION).filter_by(fk_model_idx=model_idx).delete()
                db.session.commit()

            model_path = MODEL_DIR + model_idx
            if os.path.exists(model_path):
                shutil.rmtree(model_path, ignore_errors=True)

            return result(200, '[DELETE] Delete model successful', None, None, COMPANY_NAME)
        return result(404, '[DELETE] Model is not found', None, None, COMPANY_NAME)

    def train_model(self, model_idx, model_epochs):
        ai = YOLO_V2(model_idx)
        ai.make_model(BUILDER_GENERATED_IMAGES_DIR + model_idx, model_epochs)

        db.session.query(TB_MODEL_SCHEDULE).filter_by(fk_model_idx=model_idx).delete()
        db.session.commit()

        TB_MODEL.query.filter_by(idx=self.model_idx).first().model_status = 1
        db.session.commit()

    def add_schedule(self):
        data_dir = BUILDER_GENERATED_IMAGES_DIR + self.model_idx

        class_path = data_dir + '/classes.json'
        if os.path.isfile(class_path):
            os.remove(class_path)
        classes = {}
        for i in enumerate(self.classes[0:]):
            classes[str(i[0])] = i[1]
        classes = str(classes).replace('\'', '\"')
        with open(class_path, 'w') as f:
            f.write(classes)

        # Create annotations file && image copy (annotations count == image count)
        anno_list = TB_ANNOTATION.query.filter_by(fk_model_idx=self.model_idx).first()
        if anno_list is not None:
            db.session.query(TB_ANNOTATION).filter_by(fk_model_idx=self.model_idx).delete()
            db.session.commit()

        all_image_path = data_dir + '/all_images/'
        image_path = data_dir + '/images'
        if os.path.exists(image_path):
            shutil.rmtree(image_path, ignore_errors=True)
        os.makedirs(image_path)

        annotations = json.loads(self.annotations.replace('\'', '\"'))
        for image_name in annotations:
            image = imread(all_image_path + image_name + '.jpeg')
            # 이미지 확장자 여러개 (미완)
            # for ext in ALL_EXTENSIONS:
            #     image = glob.glob(os.path.join(all_image_path + image_name + '.' + ext))
            #     if image:
            #         break
            imwrite(image_path + '/' + image_name + '.jpg', image)
            for class_name in annotations[image_name]:
                for anno in annotations[image_name][class_name]:

                    class_idx = TB_SHAPE.query.filter_by(shape_type=class_name).first()
                    if class_idx is None:
                        new_class = TB_SHAPE()
                        new_class.shape_title = ''
                        new_class.shape_type = class_name
                        new_class.shape_img = ''
                        db.session.add(new_class)
                        db.session.commit()
                        class_idx = new_class.idx
                    else:
                        class_idx = class_idx.idx

                    new_anno = TB_ANNOTATION()
                    new_anno.fk_model_idx = self.model_idx
                    new_anno.fk_shape_idx = class_idx
                    new_anno.image_name = image_name
                    new_anno.xmin = anno[0]
                    new_anno.ymin = anno[1]
                    new_anno.xmax = anno[2]
                    new_anno.ymax = anno[3]
                    db.session.add(new_anno)
                    db.session.commit()

        model_path = MODEL_DIR + self.model_idx
        if self.create_model == 1:
            if os.path.exists(model_path):
                shutil.rmtree(model_path, ignore_errors=True)
            os.makedirs(model_path)
            with open(model_path + '/classes.json', 'w') as f:
                f.write(classes)
            # ai = YOLO_V2(self.model_idx)
            # ai.make_model(data_dir, self.model_epochs, self.model_idx)

            schedule = TB_MODEL_SCHEDULE.query.filter_by(fk_model_idx=self.model_idx).first()
            new_schedule = TB_MODEL_SCHEDULE()
            if schedule is not None:
                new_schedule = schedule
            new_schedule.fk_model_idx = self.model_idx
            new_schedule.epochs = self.model_epochs
            db.session.add(new_schedule)
            db.session.commit()
        else:
            if os.path.exists(old_model_path):
                os.rename(old_model_path, model_path)


class model_schedule(Resource):
    def __init__(self):
        print("model_schedule INIT")
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()
        super(model_schedule, self).__init__()

    def get(self):
        objects = []

        schdule = TB_MODEL_SCHEDULE.query.first()

        if schdule is not None:
            objects.append({
                'idx': schdule.idx,
                'fk_model_idx': schdule.fk_model_idx,
                'epochs': schdule.epochs
            })
            return result(200, "successful.", objects, None, COMPANY_NAME)
        return result(404, "model_schdule is not found.", None, None, COMPANY_NAME)

# ======================================================================================

class Session_stored():
    def get_session(self, user_idx):
        if session.get(user_idx + '_make') is None:
            session[user_idx + '_make'] = 1
        return session.get(user_idx + '_make')

    def set_session(self, user_idx, make_status):
        session[user_idx + '_make'] = make_status
        # return session.get(self.user_idx+'_make')


# ======================================================================================

class make_titan_video(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("video_idx", type=str, location="json")
        self.parser.add_argument("video_url", type=str, location="json")
        self.parser.add_argument("fk_user_idx", type=str, location="json")
        self.parser.add_argument("fk_item_idx", type=str, location="json")
        self.parser.add_argument("model_title", type=str, location="json")
        self.parser.add_argument("fk_item_main_type", type=str, location="json")
        self.parser.add_argument("fk_item_sub_type", type=str, location="json")
        self.parser.add_argument("getSession", type=str, location="json")

        self.video_idx = self.parser.parse_args()["video_idx"]
        self.video_url = self.parser.parse_args()["video_url"]
        self.fk_user_idx = self.parser.parse_args()["fk_user_idx"]
        self.fk_item_idx = self.parser.parse_args()["fk_item_idx"]
        self.model_title = self.parser.parse_args()["model_title"]
        self.fk_item_main_type = self.parser.parse_args()["fk_item_main_type"]
        self.fk_item_sub_type = self.parser.parse_args()["fk_item_sub_type"]
        self.getSession = self.parser.parse_args()["getSession"]

        self.last_image_name = ''
        self.objects = ''
        self.current_time = 0
        super(make_titan_video, self).__init__()

    def get(self):
        boxes_obj = []

        model_title = request.args.get('model_title')
        file_absUrl = os.getcwd()
        model_path = file_absUrl + '/titan_sever/ai_model/' + str(model_title) + '/model.ckpt.index'
        # if os.path.exists(model_path):
        #     ai = Detect()
        #
        #     video_current_time = request.args.get('video_current_time')
        #     video_duration_time = request.args.get('video_duration_time')
        #
        #     url = request.args.get('video_url')
        #     try:
        #         vPafy = pafy.new(url)
        #     except Exception as ex:
        #         return result(500, str(ex), None, None, COMPANY_NAME)
        #
        #     best = vPafy.getbest(preftype="mp4")
        #     cap = cv2.VideoCapture(best.url)
        #     position = 1
        #
        #     if video_current_time != None and video_duration_time != None:
        #         print('current_time, duration_time is true')
        #         total_frame = int(cap.get(7))
        #         find_frame = round(total_frame / float(video_duration_time) * float(video_current_time))
        #         cap.set(1, find_frame)
        #         retval, frame = cap.read()
        #         draw_image, objects = ai.draw(frame)
        #         self.objects = objects
        #         self.current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
        #     else:
        #         print('current_time, duration_time is false')
        #         retval, frame = cap.read()
        #         while (retval):
        #             retval, frame = cap.read()
        #             if position % 10 == 0:
        #                 draw_image, boxes = ai.draw(frame)
        #                 if draw_image is not None:
        #                     if boxes is not None:
        #                         self.objects = boxes
        #                         self.current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
        #                         break
        #             if position == 1000:
        #                 return result(403, "item position not found", None, None, COMPANY_NAME)
        #             position += 1
        #
        #     boxes_obj.append({
        #         'boxes': self.objects,
        #         'current_time': self.current_time
        #     })
        #
        #     objects = boxes_obj[0]
        #     cap.release()
        #     cv2.destroyAllWindows()
        #
        #     return result(200, "item_detection frame successful.", objects, None, COMPANY_NAME)
        return result(404, "model not exists", None, None, COMPANY_NAME)

    def add_video_editor(self, fk_user_idx):
        new_editor = TB_EDITOR()
        new_editor.fk_user_idx = fk_user_idx
        new_editor.editor_status = 0
        new_editor.editor_selected = 0
        db.session.add(new_editor)
        db.session.commit()

    def post(self):
        objects = []

        file_absUrl = os.getcwd()
        # model_path = file_absUrl + '/titan_sever/ai_model/' + str(self.model_title) + '/model.ckpt.index'
        self.delete_process_ai()
        # if os.path.exists(model_path):
            # if item_insert_status != 1:
            # ai = YOLO_V2(self.model_title)
        ai = AI_MODEL()
            # ai.restore()

            # progress 데이터 생성 및 수정/삭제
        self.add_process_ai()
            # self.update_item_info(0, 1)
        self.delete_item_detail()

            # ../web/app/make_image/{item_idx}
        video_image_path = MAKE_IMAGE_DIR + str(self.video_idx) + '/'
        # modify_image_path = MODIFY_IMAGES_DIR + str(self.video_idx) + '/' + str(self.fk_item_idx) + '_images/'

            # ../web/app/make_image/{item_idx} 하위 디렉터리 및 파일 삭제 ignore_errors=True - 에러 무시
        if os.path.exists(video_image_path): shutil.rmtree(video_image_path, ignore_errors=True)

        image_dir = video_image_path + 'images'  # 영상 캡쳐 이미지
        draw_image_dir = video_image_path + 'draw_images'  # rect 그려진 이미지
        try:
            os.makedirs(image_dir)
            os.mkdir(draw_image_dir)
        except:
            pass

        images_file_path = video_image_path + 'images/'
        draw_images_file_path = video_image_path + 'draw_images/'
        # directory = os.path.dirname(images_file_path)
        # modify_directory = os.path.dirname(modify_image_path)
        # # draw_directory = os.path.dirname(draw_images_file_path)
        # if not os.path.exists(directory):
        #     os.makedirs(directory)
        # # if not os.path.exists(draw_directory):
        # #     os.makedirs(draw_directory)
        # files = glob.glob(images_file_path + '*')
        # for f in files:
        #     os.remove(f)
        # # files = glob.glob(draw_images_file_path + '*')
        # # for f in files:
        # #     os.remove(f)
        # if not os.path.exists(modify_directory):
        #     os.makedirs(modify_directory)

            # 유튜브 영상 캡쳐
        url = self.video_url
        vPafy = pafy.new(url)
        best = vPafy.getbest(preftype="mp4")
        cap = cv2.VideoCapture(best.url)
        retval, image = cap.read()
        total_frame = int(cap.get(7))
        start_time = time.time()
        position = 1
        while (retval):
            image_name = str(position).zfill(5)
            image_path = images_file_path + image_name + '.jpg'
            # # draw_image_path = draw_images_file_path + '/' + image_name + '.jpg'
            # modify_file_path = modify_image_path + '/' + image_name + '.jpg'
            cv2.imwrite(image_path, image)
            # cv2.imwrite(modify_file_path, image)
            # zposition = str(position).zfill(5)
            # objects.append({
            #     str(position): position,
            #     'item_idx': self.fk_item_idx,
            #     'position': zposition,
            #     'position_time': cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
            # })

            # progress_item = TB_PROCCESS_AI.query.filter_by(fk_item_idx=self.fk_item_idx).first()
            # if progress_item == None:
            #     print('종료합니다.')
            #     return result(400, "make_titan_out", None, None, COMPANY_NAME)
            process_num = (position / total_frame) * 100
            process_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
            # self.current_time = process_time
            image, boxes = ai.detect(image, position)
            draw_image_path = draw_images_file_path + '/' + image_name + '.jpg'
            cv2.imwrite(draw_image_path, image)

            if len(boxes):
                lenP = 0
                # cv2.imwrite(draw_image_path, draw_image)
                for box in boxes:
                    lenP += 1
                    current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
                    self.add_item_detail(lenP, position, current_time, box['x'], box['y'], box['width'],
                                         box['height'], 1, box['item_type'], self.video_idx)
            # self.last_image_name = image_name
            self.update_process_ai(image_name, process_time, process_num, 0)
            # has_item = TB_ITEM.query.filter_by(idx=self.fk_item_idx).first()
            # if has_item is None:
            #     break
            position += 1
            retval, image = cap.read()
        # self.update_process_ai(self.last_image_name, self.current_time,  100, 1)
        # self.update_item_info(1, 0)


        elapsed_time = time.time() - start_time
        print('make_titan_video Time:', elapsed_time)
        cap.release()
        cv2.destroyAllWindows()
        # if has_item is False:
        #     return result(200, "make_titan_video fail.", None, None, COMPANY_NAME)
        return result(200, "make_titan_video successful.", objects, None, COMPANY_NAME)
        # return result(404, "model is not exists", None, None, COMPANY_NAME)

    def delete_process_ai(self):
        delete_ai = TB_PROCCESS_AI.query.filter_by(fk_video_idx=self.video_idx).first()
        if delete_ai is not None:
            db.session.query(TB_PROCCESS_AI).filter_by(fk_video_idx=self.video_idx).delete()
            db.session.commit()

    def update_item_info(self, using, insert_status):
        modify_item = TB_ITEM.query.filter_by(idx=self.fk_item_idx).first()
        if modify_item is not None:
            modify_item.fk_video_idx = self.video_idx
            modify_item.using = using
            modify_item.insert_status = insert_status
            db.session.commit()

    def add_item_detail(self, lenP, position, current_time, x, y, width, height, m_type, item_type, video_idx):
        new_detail = TB_ITEM_DETAIL()
        # new_detail.fk_item_idx = self.fk_item_idx
        new_detail.fk_item_idx = self.fk_item_idx
        new_detail.position = position
        new_detail.position_time = current_time
        new_detail.position_order = lenP
        new_detail.x = x
        new_detail.y = y
        new_detail.width = width
        new_detail.height = height
        new_detail.make_type = m_type
        new_detail.draw_item_type = item_type
        new_detail.fk_video_idx = video_idx
        db.session.add(new_detail)
        db.session.commit()

    def delete_item_detail(self):
        # modify_item = TB_ITEM.query.filter_by(fk_video_idx=self.video_idx).all()
        # for m in modify_item:
        #     modify_item_idx.append(m.idx)
        # modify_detail = TB_ITEM_DETAIL.query.filter(TB_ITEM_DETAIL.fk_item_idx == modify_item_idx).first()
        # modify_detail = TB_ITEM_DETAIL.query.join(TB_ITEM, TB_ITEM_DETAIL.fk_item_idx == TB_ITEM.idx).filter(TB_ITEM.fk_video_idx == self.video_idx).first()
        item_detail = TB_ITEM_DETAIL.query.filter_by(fk_video_idx=self.video_idx).first()
        if item_detail is not None:
            db.session.query(TB_ITEM_DETAIL).filter_by(fk_video_idx=self.video_idx).delete()
            db.session.commit()

    def add_process_ai(self):
        progress = TB_PROCCESS_AI.query.filter_by(fk_video_idx=self.video_idx).first()
        if progress is None:
            new_process = TB_PROCCESS_AI()
            new_process.fk_video_idx = self.video_idx
            new_process.progress = 0
            new_process.draw_img_name = ''
            new_process.draw_img_time = 0
            new_process.ai_status = 0
            db.session.add(new_process)
            db.session.commit()

    def update_process_ai(self, draw_img, current_time, progress_num, ai_status):
        progress = TB_PROCCESS_AI.query.filter_by(fk_video_idx=self.video_idx).first()
        if progress is not None:
            progress.fk_video_idx = self.video_idx
            progress.progress = progress_num
            progress.draw_img_name = draw_img
            progress.draw_img_time = current_time
            progress.ai_status = ai_status
            db.session.commit()


class progress_process(Resource):
    def __init__(self):
        print("progress_process INIT")
        self.parser = reqparse.RequestParser()
        self.x = 0
        self.y = 0
        self.width = 0
        self.height = 0
        self.position_order = 1
        self.check = False
        self.draw_item_type = 0
        self.position_time = 0
        self.token_manager = TokenManager.instance()
        super(progress_process, self).__init__()

    def get(self):
        fk_video_idx = request.args.get('fk_video_idx')

        # file_path = MAKE_IMAGE_DIR + str(item_idx) + '/' + 'draw_images/'

        objects = []
        process = TB_PROCCESS_AI.query.filter_by(fk_video_idx=fk_video_idx).first()

        if process is not None:
            objects.append({
                'fk_video_idx': process.fk_video_idx,
                'progress': process.progress,
                'draw_img_name': process.draw_img_name,
                'draw_img_time': process.draw_img_time,
                'ai_status': process.ai_status
            })
            # img_file = file_path + str(process.draw_img_name) + '.jpg'
            # item_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_idx, fk_video_idx=video_idx). \
            #     filter_by(position=process.draw_img_name).first()
            # item_detail_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_idx, fk_video_idx=video_idx). \
            #     filter_by(position=process.draw_img_name).all()
            # self.total_position = len(item_detail_list)
            # if item_detail is None:
            #     objects.append({
            #         'progress': process.progress,
            #         'fk_item_idx': process.fk_item_idx,
            #         'draw_img_name': process.draw_img_name,
            #         'ai_status': process.ai_status,
            #         'x': self.x,
            #         'left': self.x,
            #         'y': self.y,
            #         'top': self.y,
            #         'width': self.width,
            #         'height': self.height,
            #         'position_order': self.position_order,
            #         'total_position': self.total_position,
            #         'position_time': process.draw_img_time,
            #         # 'draw_item_type': self.classes[str(self.draw_item_type)],
            #         'check': self.check
            #     })
            # else:
            #     if os.path.isfile(img_file):
            #         self.check = True
            #     else:
            #         self.check = False
            #     for d in item_detail_list:
            #         self.x = d.x
            #         self.y = d.y
            #         self.width = d.width
            #         self.height = d.height
            #         self.draw_item_type = d.draw_item_type
            #         self.position_order = d.position_order
            #         self.position_time = d.position_time
            #         objects.append({
            #             'progress': process.progress,
            #             'fk_item_idx': process.fk_item_idx,
            #             'draw_img_name': process.draw_img_name,
            #             'ai_status': process.ai_status,
            #             'x': self.x,
            #             'left': self.x,
            #             'y': self.y,
            #             'top': self.y,
            #             'width': self.width,
            #             'height': self.height,
            #             'position_order': self.position_order,
            #             'total_position': self.total_position,
            #             'position_time': process.draw_img_time,
            #             # 'draw_item_type': self.classes[str(self.draw_item_type)],
            #             'check': self.check
            #         })
            return result(200, "progress_process successful.", objects, None, COMPANY_NAME)
        return result(401, "progress_process fail", objects, None, COMPANY_NAME)

    def delete(self):
        d_progress_item_idx = request.args.get('d_progress_item_idx')
        print("drop progress fk_item_idx: ", d_progress_item_idx)
        item = TB_PROCCESS_AI.query.filter_by(fk_item_idx=d_progress_item_idx).first()
        print("progress list: ", item.fk_item_idx)
        if item is not None:
            db.session.query(TB_PROCCESS_AI).filter_by(fk_item_idx=item.fk_item_idx).delete()
            db.session.commit()
            return result(200, '[DELETE] Delete Progress successful', None, None, COMPANY_NAME)
        return result(404, '[DELETE] Progress is not found', None, None, COMPANY_NAME)


# #######################################################################################################################################################################################################################################################################
class item_type_api(Resource):
    def __init__(self):
        self.idx = 0
        self.item_main_type = 0
        self.item_sub_type = 0
        self.item_main_type_name = ""
        self.item_sub_type_name = ""
        super(item_type_api, self).__init__()

    def get(self):
        query = db.session.query(TB_ITEM_MAIN, TB_ITEM_SUB). \
            from_statement(db.text("""
            SELECT sub.idx, main.item_main_type, sub.item_sub_type, main.item_main_type_name, sub.item_sub_type_name
            FROM
             tb_item_main_type AS main
              RIGHT outer JOIN tb_item_sub_type AS sub
              ON main.item_main_type = sub.fk_item_main_type
            """)).all()
        if query is not None:
            objects = []
            for data in query:
                count = TB_ITEM.query.filter_by(fk_item_main_type=data.TB_ITEM_MAIN.item_main_type,
                                                fk_item_sub_type=data.TB_ITEM_SUB.item_sub_type).count()
                objects.append({
                    "item_main_type": data.TB_ITEM_MAIN.item_main_type,
                    "item_sub_type": data.TB_ITEM_SUB.item_sub_type,
                    "item_main_type_name": data.TB_ITEM_MAIN.item_main_type_name,
                    "item_sub_type_name": data.TB_ITEM_SUB.item_sub_type_name,
                    "item_count": count
                })
            return result(200, "item_type_api successful.", objects, None, COMPANY_NAME)
        return result(404, 'item_type_api fail', None, None, COMPANY_NAME)


class FileUploadAPI(Resource):
    # __tablename__ = "tb_user"
    # id = db.Column(db.String)
    # =======================================================================
    def __init__(self):
        print("File UPLOAD")
        self.parser = reqparse.RequestParser()
        super(FileUploadAPI, self).__init__()

    # =======================================================================
    def allowed_file(self, filename):
        return '.' in filename and \
               (filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
                or filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS2
                or filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS3
                or filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS4
                )

    # =======================================================================
    def isKorean(self, text):
        hangul = re.compile('[\u3131-\u3163\uac00-\ud7a3]+')

        result = hangul.findall(text)
        # print("len : " + str(len(result)))
        if len(result) == 2:
            return True

        return False

    # ========================================================================
    def post(self):
        log = ''
        # try :
        file = request.files['file']
        item_idx = request.args.get('item_idx')
        umm = request.args.get('umm')
        group_idx = request.args.get('group_idx')
        image_name = request.args.get('image_name')
        user_idx = str(request.args.get('user_idx'))
        log = file.filename
        file_name = str(file.filename).encode('utf-8')

        if item_idx is not None:
            try:
                os.stat(UPLOAD_FOLDER)
            except:
                os.mkdir(UPLOAD_FOLDER)
            if file:
                file_name = secure_filename(str(file_name))
                if str(file_name).find('.') != -1:
                    print("path : ", os.path.join(UPLOAD_FOLDER))
                    savename = str(item_idx) + "_product.jpg"
                    print(savename)
                    file.save(os.path.join(UPLOAD_FOLDER, savename))
                    object = {
                        "fileurl": "/images/uploads/" + savename
                    }
                    print(object)
                    return result(200, "file upload successful", object, log, COMPANY_NAME)
                else:
                    return result(400, "file upload exception!!", None, log, COMPANY_NAME)
            else:
                object = {
                    "fileurl": ''
                }
                return result(400, "file upload exception!!", object, log, COMPANY_NAME)

        if group_idx is not None:
            sample_path = "../web/app/images/sample/" + group_idx
            if os.path.exists(sample_path):
                shutil.rmtree(sample_path, ignore_errors=True)
            os.makedirs(sample_path)
            if file:
                file_name = secure_filename(str(file_name))
                sample_savename = str(group_idx) + "_" + str(umm) + ".jpg"
                file.save(os.path.join(sample_path, sample_savename))
                # object = {
                #     "fileurl": "/model_file/" + user_idx + '/all_images/' + image_name + '.jpg'
                # }
                return result(200, "file upload successful", None, None, COMPANY_NAME)
        if file:
            file_name = secure_filename(str(file_name))
            if str(file_name).find('.') != -1:
                file.save(os.path.join(image_path, image_name + '.jpg'))
                object = {
                    "fileurl": "/model_file/" + user_idx + '/all_images/' + image_name + '.jpg'
                }
                return result(200, "file upload successful", object, log, COMPANY_NAME)
            else:
                return result(400, "file upload exception!!", None, log, COMPANY_NAME)
        else:
            object = {
                "fileurl": ''
            }
            return result(400, "file upload exception!!", object, log, COMPANY_NAME)
        # return result(400, "file upload failed", None, None, COMPANY_NAME)
        # return result(400, "file upload exception!!", object, log, "by sisung ")
        # return result(400, "file upload failed", None, log, "by sisung ")


class TemporaryPassword(Resource):
    def __init__(self):
        print("TemporaryPassword")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("user_name", type=str, location="json")
        self.parser.add_argument("user_id", type=str, location="json")
        self.token_manager = TokenManager.instance()

        self.user_name = self.parser.parse_args()["user_name"]
        self.user_id = self.parser.parse_args()["user_id"]
        print(self.user_name)
        print(self.user_id)
        super(TemporaryPassword, self).__init__()

    def post(self):
        # user_info = TB_USER.query.filter_by(user_id=self.user_id, user_name=self.user_name).first()
        global password
        user_info = TB_USER.query.filter_by(user_id=self.user_id).first()
        if user_info is not None:
            # app.config["AUTH_URL"] = 'http://localhost/api/ext/auth'
            alphabet = string.ascii_letters + string.digits
            while True:
                password = ''.join(secrets.choice(alphabet) for i in range(8))
                if (any(c.islower() for c in password)
                        and any(c.isupper() for c in password)
                        and sum(c.isdigit() for c in password) >= 3):
                    break

            user_info.user_pw = generate_password_hash(password)
            db.session.commit()

            app.config['SMTP_SENDER'] = "koreafirstec1988@gmail.com"
            app.config['SMTP_ADDR'] = "smtp.gmail.com"
            app.config['SMTP_PORT'] = 465
            app.config['SMTP_LOGIN_ID'] = "koreafirstec1988@gmail.com"
            app.config['SMTP_LOGIN_PW'] = "first2000"

            message = "아래 비밀번호를 입력해 로그인하시고 비밀번호를 변경해주세요.<br><br>" + password

            server = smtplib.SMTP_SSL(app.config['SMTP_ADDR'], app.config['SMTP_PORT'])
            server.login(app.config['SMTP_LOGIN_ID'], app.config['SMTP_LOGIN_PW'])

            msg = MIMEMultipart('alternative')
            msg['From'] = "%s <%s>" % ("", app.config['SMTP_SENDER'])
            msg['To'] = self.user_id
            msg['Subject'] = "TITANS 임시 비밀번호 입니다."
            msg.attach(MIMEText(message, 'html', 'utf-8'))  # 내용 인코딩
            server.sendmail(app.config['SMTP_SENDER'], self.user_id, msg.as_string())
            object = {}
            return result(200, "TemporaryPassword successfully created!", object, None, "by heockjin")
        else:
            return result(500, "TemporaryPassword failed", None, None, "by heockjin")


class auth(Resource):
    def get(self):
        id = request.args.get('id')
        print(id)

        user = TB_USER.query.filter(TB_USER.user_id == id).first()

        if user is None:
            return result(500, "failed", None, None, "by heockjin")

        user.auth = 1
        db.session.commit()

        return result(200, "successful", None, None, "by heockjin")


class model_request(Resource):
    def get(self):
        print("[GET] model_request")
        objects = []

        limit = request.args.get('limit')
        offset = request.args.get('offset')
        order_by = "create_date desc"
        filter_and_group = []
        filter_or_group = []
        filter_and_group.append(TB_ITEM.make_request == 1)
        # list, objects, current_count, meta = Paging_filter(limit, offset, TB_ITEM, "model_request", filter_and_group,
        #                                                    filter_or_group, order_by)
        # if current_count != 0:
        list = TB_ITEM.query.order_by(TB_ITEM.create_date.desc())
        for i in list:
            img_path = "../images/uploads/" + str(i.idx) + "_product.jpg" if os.path.isfile(
                UPLOAD_FOLDER + "/" + str(i.idx) + "_product.jpg") else "../images/common/noimg.png"
            objects.append({
                'idx': i.idx,
                'item_title': i.item_title,
                'user_id': TB_USER.query.filter_by(idx=i.fk_user_idx).first().user_id,
                'item_img_path': img_path,
                'create_date': json_encoder(i.create_date),
                'make_request': i.make_request
            })
        return result(200, "[GET] Select titan model list paging successful.", objects, None, COMPANY_NAME)

        # for model in models:
        #     objects.append({
        #         'idx': model.idx,
        #         'user_id': TB_USER.query.filter_by(idx=model.fk_user_idx).first().user_id,
        #         'model_title': model.model_title,
        #         'model_description': model.model_description,
        #         'model_epochs': model.model_epochs,
        #         'model_access': model.model_access,
        #         'model_status': model.model_status,
        #         'create_date': json_encoder(model.create_date),
        #     })
        # return result(200, "[GET] Select titan model list successful.", objects, None, COMPANY_NAME)

    def delete(self):
        print("[DELETE] titan_model")

        item_idx = request.args.get('item_idx')
        item = TB_ITEM.query.filter_by(idx=item_idx).first()
        if item is not None:
            item_title = item.item_title
            db.session.query(TB_ITEM).filter_by(idx=item_idx).delete()
            db.session.commit()
            return result(200, '[DELETE] Delete model successful', None, None, COMPANY_NAME)
        return result(404, '[DELETE] Model is not found', None, None, COMPANY_NAME)


# ========================================================================
class build_item(Resource):
    def get(self):
        objects = []
        item_idx = request.args.get('item_idx')
        model_idx = str(request.args.get('model_idx'))

        items = TB_BUILD_ITEM.query.filter_by(item_number=item_idx).all()

        if items is not None:
            for item in items:
                image = imread(UPLOAD_BUILDER_IMAGES_DIR + item.filename)
                imwrite(UPLOAD_BUILDER_IMAGES_DIR + model_idx + '/' + item.filename, image)
                group_code = db.session.query(TB_BUILD_GROUP).filter_by(idx=item.group_idx).all()
                objects.append({
                    'group_idx': item.group_idx,
                    'group_code': group_code[0].group_id,
                    'item_number': item.item_number,
                    'shape_idx': item.shape_idx,
                    'item_name': item.item_name,
                    'filename': item.filename,
                    'type': item.type
                })

            return result(200, "successful", objects, None, COMPANY_NAME)
        return result(500, "failed", objects, None, COMPANY_NAME)

    def delete(self):
        image_name = request.args.get('image_name')
        model_idx = str(request.args.get('model_idx'))

        image = UPLOAD_BUILDER_IMAGES_DIR + model_idx + '/' + image_name
        if os.path.isfile(image):
            os.remove(image)
            return result(200, "successful", None, None, COMPANY_NAME)

        return result(404, "fail", None, None, COMPANY_NAME)


class build_group(Resource):
    def __init__(self):
        print("build_group")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("group_id", type=str, location="json")
        self.token_manager = TokenManager.instance()

        self.group_id = self.parser.parse_args()["group_id"]
        super(build_group, self).__init__()

    def post(self):
        objects = []
        new_build_group = TB_BUILD_GROUP()
        new_build_group.group_id = self.group_id
        db.session.add(new_build_group)
        db.session.commit()

        objects.append({
            'group_idx': new_build_group.idx
        })

        return result(200, "successful", objects, None, COMPANY_NAME)


class build_process(Resource):
    def get(self):
        objects = []
        group_idx = request.args.get('group_idx')

        models = db.session.query(TB_BUILD_PROCESS).filter_by(group_idx=group_idx).first()

        if models is not None:
            objects.append({
                'idx': models.idx,
                'group_idx': models.group_idx,
                'max_value': models.max_value,
                'process': models.process
            })

            return result(200, "successful", objects, None, COMPANY_NAME)
        return result(500, "failed", objects, None, COMPANY_NAME)


class crawling_process(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.token_manager = TokenManager.instance()

        super(crawling_process, self).__init__()

    def get(self):
        objects = []
        process_idx = request.args.get('process_idx')

        process = TB_CRAWLING_PROCESS.query.filter_by(idx=process_idx).first()

        if process is not None:
            objects.append({
                'idx': process.idx,
                'max_value': process.max_value,
                'process': process.process
            })

            return result(200, "successful", objects, None, COMPANY_NAME)
        return result(500, "failed", None, None, COMPANY_NAME)

    def post(self):
        objects = []

        new_crawling_process = TB_CRAWLING_PROCESS()
        new_crawling_process.max_value = 0
        new_crawling_process.process = 0
        db.session.add(new_crawling_process)
        db.session.commit()

        objects.append({
            'process_idx': new_crawling_process.idx,
        })

        return result(200, "successful", objects, None, COMPANY_NAME)



class crawling_image(Resource):
    def __init__(self):
        print("crawling_image")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("model_idx", type=str, location="json")
        self.parser.add_argument("process_idx", type=str, location="json")
        self.parser.add_argument("update_item_idx", type=str, location="json")
        self.token_manager = TokenManager.instance()

        self.model_idx = self.parser.parse_args()["model_idx"]
        self.process_idx = self.parser.parse_args()["process_idx"]
        self.update_item_idx = self.parser.parse_args()["update_item_idx"]
        super(crawling_image, self).__init__()

    def get(self):
        objects = []
        image_name = request.args.get('image_name')
        model_idx = str(request.args.get('model_idx'))
        x_min = int(request.args.get('x_min'))
        y_min = int(request.args.get('y_min'))
        x_max = int(request.args.get('x_max'))
        y_max = int(request.args.get('y_max'))

        image = imread(CRAWLER_IMAGES_DIR + model_idx + '/' + image_name)
        image = cv2.resize(image, dsize=(416, 416))
        name = image_name.split('.')[0]
        extention = image_name.split('.')[1]
        n = 1
        new_image = UPLOAD_BUILDER_IMAGES_DIR + model_idx + '/' + name + '_' + str(n) + '.' + extention
        while os.path.isfile(new_image):
            n += 1
            new_image = UPLOAD_BUILDER_IMAGES_DIR + model_idx + '/' + name + '_' + str(n) + '.' + extention
        imwrite(new_image, image[y_min:y_max, x_min:x_max])

        objects.append({
            'image_name': name + '_' + str(n) + '.' + extention,
        })

        return result(200, "successful", objects, None, COMPANY_NAME)

    def post(self):
        image_path = CRAWLER_IMAGES_DIR + self.model_idx
        if os.path.exists(image_path):
            shutil.rmtree(image_path, ignore_errors=True)
        os.makedirs(image_path)

        search = TB_ITEM.query.filter_by(idx=self.update_item_idx).first().item_title

        url = 'https://www.google.co.kr/search?q=' + search + '&source=lnms&tbm=isch&sa=X&ved=0ahUKEwic-taB9IXVAhWDHpQKHXOjC14Q_AUIBigB&biw=1842&bih=990'

        text = requests.get(url, headers={
            'user-agent': ':Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'}).text

        bs_object = BeautifulSoup(text, "html.parser")
        image_data = bs_object.find_all("img")

        image_list = []
        for i in image_data:
            try:
                image = i.attrs['data-src']
                if image not in image_list:
                    image_list.append(image)
            except KeyError:
                pass

        progress = TB_CRAWLING_PROCESS.query.filter_by(idx=self.process_idx).first()
        if progress is not None:
            for i in enumerate(image_list[0:]):
                # filename = search + '_' + str(i[0] + 1)
                filename = 'crawling_' + str(i[0] + 1)
                urlretrieve(i[1], image_path + '/' + filename + '.jpg')

                progress.process = i[0] + 1
                progress.max_value = len(image_list)
                db.session.commit()

        return result(200, "successful", None, None, COMPANY_NAME)

class SearchYoutube(Resource):
    def get(self):
        objects = []

        search_title = request.args.get('search_title')
        try:
            search = SearchVideos(str(search_title), mode="json", max_results=50)
            list = json.loads(search.result())
            for i in list["search_result"]:
                objects.append({
                    "id": i["id"],
                    "title": i["title"],
                    "channel": i["channel"],
                    "duration": i["duration"],
                })
            # DEVELOPER_KEY = "AIzaSyAmEqE9mZWPIY0qSIkQfHok7ugaR0t871s"
            # YOUTUBE_API_SERVICE_NAME = "youtube"
            # YOUTUBE_API_VERSION = "v3"
            #
            # youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY)
            #
            # search_response2 = youtube.search().list(
            #     q=search_title,
            #     pageToken="CDIQAA",
            #     order="date",
            #     part="snippet",
            #     maxResults=50
            #     ).execute()
            #
            # for search_result in search_response2.get("items", []):
            #     print(search_result)
            #     if search_result["id"]["kind"] == "youtube#video":
            #         search_detail = youtube.videos().list(
            #             id=search_result["id"]["videoId"],
            #             part="id,snippet,contentDetails,statistics"
            #         ).execute()
            #         objects.append({
            #             "id": search_result["id"]["videoId"],
            #             "title": search_result["snippet"]["title"],
            #             "channel": search_result["snippet"]["channelTitle"],
            #             "duration": search_detail['items'][0]['contentDetails']['duration'],
            #         })
        except Exception as e:
            print(e)
            search = SearchVideos(str(search_title), mode="json", max_results=50)
            list = json.loads(search.result())
            for i in list["search_result"]:
                objects.append({
                    "id": i["id"],
                    "title": i["title"],
                    "channel": i["channel"],
                    "duration": i["duration"],
                })
            return result(404, "search fail", objects, None, COMPANY_NAME)
        return result(200, "search success", objects, None, COMPANY_NAME)

class acgan_classification(Resource):
    def __init__(self):
        print("acgan_classification")
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("draw_item_type", type=str, location="json")
        self.parser.add_argument("all_detail", type=str, location="json")
        self.parser.add_argument("fk_video_idx", type=str, location="json")
        self.parser.add_argument("item_idx", type=str, location="json")
        self.token_manager = TokenManager.instance()

        self.draw_item_type = self.parser.parse_args()["draw_item_type"]
        self.all_detail = self.parser.parse_args()["all_detail"]
        self.fk_video_idx = self.parser.parse_args()["fk_video_idx"]
        self.item_idx = self.parser.parse_args()["item_idx"]
        super(acgan_classification, self).__init__()

    def post(self):
        objects = []
        image_detection = ['shirt', 'pants', 'skirt', 'shoes', 'cap', 'golfball', 'golfbag', 'golfclub']
        dis = discriminator_bottom.Discriminator(image_detection[int(self.draw_item_type)], "model/netD_epoch_6000.pth", self.draw_item_type, self.all_detail, self.fk_video_idx, self.item_idx)
        check = dis.imageCrop()
        if check:
           index = 0
           j = 0
           path, pred, item_idx, video_idx = dis.discriminator_func()
           for i in path:
               position = i.split('\\')[len(i.split('\\'))-1]
               position_name = int(position.split(".")[0])
               order = int(position.split(".")[1])
               update_detail = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_idx, position=position_name, position_order=order, fk_video_idx=video_idx, draw_item_type=self.draw_item_type).first()
               update_detail.classification_item = pred[j]
               db.session.add(update_detail)
               db.session.commit()
               j+=1
           detail_list = TB_ITEM_DETAIL.query.filter_by(fk_item_idx=item_idx, fk_video_idx=video_idx).order_by(TB_ITEM_DETAIL.position.asc()).all()
           for item_detail in detail_list:
               index += 1
               objects.append({
                   'index': index,
                   'idx': item_detail.idx,
                   'fk_item_idx': item_detail.fk_item_idx,
                   'fk_video_idx': item_detail.fk_video_idx,
                   'position': item_detail.position,
                   'position_order': item_detail.position_order,
                   'position_time': int(item_detail.position_time),
                   'position_time_d': str(int((item_detail.position_time % 3600) / 60)).zfill(2) + ":" + str(
                       int(item_detail.position_time % 60)).zfill(2),
                   'draw_item_type': item_detail.draw_item_type,
                   'draw_img_name': '/make_image/' + str(video_idx) + "/images/" + str(
                       item_detail.position).zfill(5) + '.jpg',
                   'x': item_detail.x,
                   'y': item_detail.y,
                   'width': item_detail.width,
                   'height': item_detail.height,
                   'classification_item': item_detail.classification_item
               })
           return result(200, "Aㅏ", objects, None, COMPANY_NAME)
#############################################################################################################
api = Api(app)
api.add_resource(Login, '/api/login')
api.add_resource(Logout, '/api/logout')
api.add_resource(Join, '/api/join')
api.add_resource(User, '/api/user')
api.add_resource(Role, '/api/role')
api.add_resource(user_role, '/api/user_role')
api.add_resource(user_access_hist, '/api/user_access_hist')
api.add_resource(Video, '/api/video')
api.add_resource(Item, '/api/item')
api.add_resource(item_history, '/api/item_history')
api.add_resource(item_detail, '/api/item_detail')
api.add_resource(Shape, '/api/shape')
api.add_resource(item_type_api, '/api/type_api')
api.add_resource(build_item, '/api/build_item')
api.add_resource(build_group, '/api/build_group')
api.add_resource(crawling_image, '/api/crawling_image')
api.add_resource(build_process, '/api/build_process')
api.add_resource(crawling_process, '/api/crawling_process')
api.add_resource(model_schedule, '/api/model_schedule')

api.add_resource(search_video, '/api/search_video')
api.add_resource(admin_video_list, '/api/admin_video_list')
api.add_resource(shape_video_list, '/api/shape_video_list')
api.add_resource(item_detail_to_file, '/api/item_detail_to_file')
api.add_resource(item_position_detail, '/api/item_position_detail')
api.add_resource(video_capture, '/api/video_capture')
api.add_resource(editor_list, '/api/editor_list')
api.add_resource(train_thum_List, '/api/train_thum_List')
api.add_resource(titan_model, '/api/titan_model')
api.add_resource(make_titan_video, '/api/make_titan_video')
api.add_resource(progress_process, '/api/progress_process')
api.add_resource(FileUploadAPI, '/api/file_upload')
api.add_resource(TemporaryPassword, '/api/temporary_password')
api.add_resource(auth, '/api/auth')
api.add_resource(model_request, '/api/model_request')
api.add_resource(SearchYoutube, '/api/search_youtube')
api.add_resource(acgan_classification, '/api/acgan_classification')
#############################################################################################################
