from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import datetime
from sqlalchemy import *
from enum import Enum

__author__ = 'sisung'
# -*- coding: utf-8 -*-

db = SQLAlchemy()
db_name = 'titan'


class TB_USER(db.Model):
    __tablename__ = 'tb_user'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    user_id = db.Column('user_id', db.String(256))
    user_name = db.Column('user_name', db.String(256))
    user_pw = db.Column('user_pw', db.String(1024))
    fk_group_idx = db.Column('fk_group_idx', db.Integer)
    token = db.Column('token', db.String(256))
    auth = db.Column('auth', db.Integer)
    prev_model_item = db.Column('prev_model_item', db.Integer)


class TB_VIDEO(db.Model):
    __tablename__ = 'tb_video'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_user_idx = db.Column('fk_user_idx', db.Integer)
    video_source = db.Column('video_source', db.String(100))
    video_url = db.Column('video_url', db.String(1024))
    video_title = db.Column('video_title', db.String(256))
    create_date = db.Column('create_date', db.DateTime)
    modify_date = db.Column('modify_date', db.DateTime)
    video_explanation = db.Column('video_explanation', db.String(1024))
    video_duration = db.Column('video_duration', db.String(10))
    video_category = db.Column('video_category', db.String(1024))
    video_status_value = db.Column('video_status_value', db.Integer)
    video_auto_preview = db.Column('video_auto_preview', db.Integer)
    video_shape = db.Column('video_shape', db.Integer)
    video_shared = db.Column('video_shared', db.Integer)


class TB_ITEM_DETAIL(db.Model):
    __tablename__ = 'tb_item_detail'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    # fk_shape_idx = db.Column('fk_shape_idx', db.Integer)
    fk_item_idx = db.Column('fk_item_idx', db.Integer)
    position = db.Column('position', db.Integer)
    position_time = db.Column('position_time', db.Integer)
    position_order = db.Column('position_order', db.Integer)
    x = db.Column('x', db.Integer)
    y = db.Column('y', db.Integer)
    width = db.Column('width', db.Integer)
    height = db.Column('height', db.Integer)
    make_type = db.Column('make_type', db.Integer)
    draw_item_type = db.Column('draw_item_type', db.Integer)
    fk_video_idx = db.Column('fk_video_idx', db.Integer)


class TB_EDITOR(db.Model):
    __tablename__ = 'tb_editor'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_user_idx = db.Column('fk_user_idx', db.Integer)
    fk_item_idx = db.Column('fk_item_idx', db.Integer)
    modify_position = db.Column('modify_position', db.Integer)
    modify_second = db.Column('modify_second', db.Integer)
    editor_status = db.Column('editor_status', db.Integer)


class TB_SHAPE(db.Model):
    __tablename__ = 'tb_shape'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    shape_title = db.Column('shape_title', db.String(32))
    shape_type = db.Column('shape_type', db.String(32))
    shape_img = db.Column('shape_img', db.String(32))


class TB_PROCCESS_AI(db.Model):
    __tablename__ = 'tb_process_ai'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_item_idx = db.Column('fk_item_idx', db.Integer)
    progress = db.Column('progress', db.Integer)
    draw_img_name = db.Column('draw_img_name', db.String(256))
    draw_img_time = db.Column('draw_img_time', db.Integer)
    ai_status = db.Column('ai_status', db.Integer)


class TB_ITEM(db.Model):
    __tablename__ = 'tb_item'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_video_idx = db.Column('fk_video_idx', db.Integer)
    fk_user_idx = db.Column('fk_user_idx', db.Integer)
    create_date = db.Column('create_date', db.DateTime, onupdate=datetime.datetime.now)
    item_title = db.Column('item_title', db.String(256))
    item_description = db.Column('item_description', db.String(1024))
    item_price = db.Column('item_price', db.Integer)
    item_explanation = db.Column('item_explanation', db.String(1024))
    item_url = db.Column('item_url', db.String(1024))
    item_redirect_url = db.Column('item_redirect_url', db.String(1024))
    item_description_url = db.Column('item_description_url', db.String(1024))
    fk_item_main_type = db.Column('fk_item_main_type', db.Integer)
    fk_item_sub_type = db.Column('fk_item_sub_type', db.Integer)
    item_shape = db.Column('item_shape', db.Integer)
    using = db.Column('using', db.Integer)
    item_img_path = db.Column('item_img_path', db.String(1024))
    item_description_toggle = db.Column('item_description_toggle', db.Integer)
    make_request = db.Column('make_request', db.Integer)
    insert_status = db.Column('insert_status', db.Integer)
    # item_auto_preview = db.Column('item_auto_preview', db.Integer)


class TB_ITEM_HISTORY(db.Model):
    __tablename__ = 'tb_item_history'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_user_idx = db.Column('fk_user_idx', db.Integer)
    fk_item_idx = db.Column('fk_item_idx', db.Integer)
    action_status = db.Column('action_status', db.Integer)
    create_date = db.Column('create_date', db.DateTime, onupdate=datetime.datetime.now)


class TB_USER_ACCESS_HIST(db.Model):
    __tablename__ = 'tb_user_access_hist'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    user_id = db.Column('user_id', db.String(256))
    access_time = db.Column('access_time', db.Integer)
    access_type = db.Column('access_type', db.Integer)
    access_browser = db.Column('access_browser', db.String(256))
    access_platform = db.Column('access_platform', db.String(256))
    access_ip = db.Column('access_ip', db.Integer)


class TB_MODEL(db.Model):
    __tablename__ = 'tb_model'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_user_idx = db.Column('fk_user_idx', db.Integer)
    model_title = db.Column('model_title', db.String(256))
    model_description = db.Column('model_description', db.String(1024))
    model_epochs = db.Column('model_epochs', db.Integer)
    model_access = db.Column('model_access', db.Integer)
    model_status = db.Column('model_status', db.Integer)
    create_date = db.Column('create_date', db.DateTime, onupdate=datetime.datetime.now)


class TB_MODEL_SCHEDULE(db.Model):
    __tablename__ = 'tb_model_schedule'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_model_idx = db.Column('fk_model_idx', db.Integer)
    epochs = db.Column('epochs', db.Integer)


class TB_ANNOTATION(db.Model):
    __tablename__ = 'tb_annotation'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_model_idx = db.Column('fk_model_idx', db.Integer)
    fk_shape_idx = db.Column('fk_shape_idx', db.Integer)
    image_name = db.Column('image_name', db.String(1024))
    xmin = db.Column('xmin', db.Integer)
    ymin = db.Column('ymin', db.Integer)
    xmax = db.Column('xmax', db.Integer)
    ymax = db.Column('ymax', db.Integer)


class TB_ROLE(db.Model):
    __tablename__ = 'tb_role'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    role_name = db.Column('role_name', db.String(256))


class TB_USER_ROLE(db.Model):
    __tablename__ = 'tb_user_role'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_user_idx = db.Column('fk_user_idx', db.Integer)
    fk_role_idx = db.Column('fk_role_idx', db.Integer)


class TB_ITEM_MAIN(db.Model):
    __tablename__ = 'tb_item_main_type'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    item_main_type = db.Column('item_main_type', db.Integer)
    item_main_type_name = db.Column('item_main_type_name', db.String(255))


class TB_ITEM_SUB(db.Model):
    __tablename__ = 'tb_item_sub_type'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    fk_item_main_type = db.Column('fk_item_main_type', db.Integer)
    item_sub_type = db.Column('item_sub_type', db.Integer)
    item_sub_type_name = db.Column('item_sub_type_name', db.String(255))


class TB_BUILD_GROUP(db.Model):
    __tablename__ = 'tb_build_group'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    group_id = db.Column('group_id', db.String(255))


class TB_BUILD_ITEM(db.Model):
    __tablename__ = 'tb_build_item'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    group_idx = db.Column(db.Integer, ForeignKey(TB_BUILD_GROUP.group_id), primary_key=True)
    item_number = db.Column('item_number', db.Integer)
    shape_idx = db.Column('shape_idx', db.Integer)
    item_name = db.Column('item_name', db.String(255))
    filename = db.Column('filename', db.String(512))
    type = db.Column('type', db.Enum("item", "background"))


class TB_BUILD_PROCESS(db.Model):
    __tablename__ = 'tb_build_process'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    group_idx = db.Column('group_idx', ForeignKey(TB_BUILD_GROUP.group_id), primary_key=True)
    max_value = db.Column('max_value', db.Integer)
    process = db.Column('process', db.Integer)


class TB_CRAWLING_PROCESS(db.Model):
    __tablename__ = 'tb_crawling_process'
    __table_args__ = {
        'schema': db_name
    }
    idx = db.Column('idx', db.Integer, primary_key=True)
    max_value = db.Column('max_value', db.Integer)
    process = db.Column('process', db.Integer)
