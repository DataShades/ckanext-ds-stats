import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckanext.ds_stats import DGA_CTRL, GA_API_CTRL, GA_CTRL
from webhelpers.html import literal
from ckanext.ds_stats.helpers import (most_popular_datasets,
                                       popular_datasets,
                                       single_popular_dataset,
                                       month_option_title,
                                       join_x, join_y, date_range)

import ast
import logging
import urllib
import commands
import dbutil
import paste.deploy.converters as converters
from ckan.lib.base import c
from ckan.plugins import toolkit as tk
import ckan.lib.helpers as h
from routes.mapper import SubMapper, Mapper as _Mapper
from pylons import config
from ckan.controllers.package import PackageController

import urllib2
import importlib
import hashlib

import threading
import Queue

log = logging.getLogger('ckanext.ds_stats')
# c = tk.c


def custom_gravatar(*pargs, **kargs):
    gravatar = h.gravatar(*pargs, **kargs)
    pos = gravatar.find('/>')
    gravatar = gravatar[:pos] + literal(' alt="User\'s profile gravatar" ') + gravatar[pos:]
    return gravatar


def _post_analytics(
        user, event_type, request_obj_type, request_function, request_id):

    if config.get('googleanalytics.id'):
        data_dict = {
            "v": 1,
            "tid": config.get('googleanalytics.id'),
            "cid": hashlib.md5(c.user).hexdigest(),
            # customer id should be obfuscated
            "t": "event",
            "dh": c.environ['HTTP_HOST'],
            "dp": c.environ['PATH_INFO'],
            "dr": c.environ.get('HTTP_REFERER', ''),
            "ec": event_type,
            "ea": request_obj_type + request_function,
            "el": request_id,
        }
        DsStatsPlugin.analytics_queue.put(data_dict)


def post_analytics_decorator(func):

    def func_wrapper(cls, id, resource_id, filename):
        _post_analytics(
            c.user,
            "CKAN Resource Download Request",
            "Resource",
            "Download",
            resource_id
        )

        return func(cls, id, resource_id, filename)

    return func_wrapper


class GoogleAnalyticsException(Exception):
    pass


class AnalyticsPostThread(threading.Thread):
    """Threaded Url POST"""
    def __init__(self, queue):
        threading.Thread.__init__(self)
        self.queue = queue

    def run(self):
        while True:
            # grabs host from queue
            data_dict = self.queue.get()

            data = urllib.urlencode(data_dict)
            log.debug("Sending API event to Google Analytics: " + data)
            # send analytics
            urllib2.urlopen(
                "http://www.google-analytics.com/collect",
                data,
                # timeout in seconds
                # https://docs.python.org/2/library/urllib2.html#urllib2.urlopen
                10)

            # signals to queue job is done
            self.queue.task_done()


class DsStatsPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IConfigurable, inherit=True)

    analytics_queue = Queue.Queue()

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        if toolkit.asbool(config_.get('ckan.legacy_templates', False)):
            toolkit.add_template_directory(config_, 'templates_legacy')
            toolkit.add_public_directory(config_, 'public_legacy')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'ds_stats')

    # IRoutes

    def before_map(self, map):
        '''Add new routes that this extension's controllers handle.

        See IRoutes.

        '''
        # Helpers to reduce code clutter
        GET = dict(method=['GET'])
        PUT = dict(method=['PUT'])
        POST = dict(method=['POST'])
        DELETE = dict(method=['DELETE'])
        GET_POST = dict(method=['GET', 'POST'])
        # intercept API calls that we want to capture analytics on
        register_list = [
            'package',
            'dataset',
            'resource',
            'tag',
            'group',
            'related',
            'revision',
            'licenses',
            'rating',
            'user',
            'activity'
        ]
        register_list_str = '|'.join(register_list)
        # /api ver 3 or none
        with SubMapper(map, controller=GA_API_CTRL, path_prefix='/api{ver:/3|}',
                    ver='/3') as m:
            m.connect('/action/{logic_function}', action='action',
                      conditions=GET_POST)

        # /api ver 1, 2, 3 or none
        with SubMapper(map, controller=GA_API_CTRL, path_prefix='/api{ver:/1|/2|/3|}',
                       ver='/1') as m:
            m.connect('/search/{register}', action='search')

        # /api/rest ver 1, 2 or none
        with SubMapper(map, controller=GA_API_CTRL, path_prefix='/api{ver:/1|/2|}',
                       ver='/1', requirements=dict(register=register_list_str)
                       ) as m:

            m.connect('/rest/{register}', action='list', conditions=GET)
            m.connect('/rest/{register}', action='create', conditions=POST)
            m.connect('/rest/{register}/{id}', action='show', conditions=GET)
            m.connect('/rest/{register}/{id}', action='update', conditions=PUT)
            m.connect('/rest/{register}/{id}', action='update', conditions=POST)
            m.connect('/rest/{register}/{id}', action='delete', conditions=DELETE)

        return map

    def after_map(self, map):
        map.connect('stats', '/stats', controller=DGA_CTRL, action='index')
        map.connect('stats_action', '/stats/{action}', controller=DGA_CTRL)

        self.modify_resource_download_route(map)
        map.redirect("/analytics/package/top", "/analytics/dataset/top")
        map.connect(
            'analytics', '/analytics/dataset/top',
            controller=GA_CTRL,
            action='view'
        )
        map.connect(
            '/site-usage',
            controller='ckanext.ga_report.controller:GaReport',
            action='index'
        )
        map.connect(
            '/site-usage_{month}.csv',
            controller='ckanext.ga_report.controller:GaReport',
            action='csv'
        )
        map.connect(
            '/site-usage/downloads',
            controller='ckanext.ga_report.controller:GaReport',
            action='downloads'
        )
        map.connect(
            '/site-usage/downloads_{month}.csv',
            controller='ckanext.ga_report.controller:GaReport',
            action='csv_downloads'
        )

        # GaDatasetReport
        map.connect(
            '/site-usage/publisher',
            controller='ckanext.ga_report.controller:GaDatasetReport',
            action='publishers'
        )
        map.connect(
            '/site-usage/publishers_{month}.csv',
            controller='ckanext.ga_report.controller:GaDatasetReport',
            action='publisher_csv'
        )
        map.connect(
            '/site-usage/dataset/datasets_{id}_{month}.csv',
            controller='ckanext.ga_report.controller:GaDatasetReport',
            action='dataset_csv'
        )
        map.connect(
            '/site-usage/dataset',
            controller='ckanext.ga_report.controller:GaDatasetReport',
            action='read'
        )
        map.connect(
            '/site-usage/dataset/{id}',
            controller='ckanext.ga_report.controller:GaDatasetReport',
            action='read_publisher'
        )
        return map

    # ITemplateHelpers

    def get_helpers(self):
        return {
            'date_range': date_range,
            'googleanalytics_header': self.googleanalytics_header,
            'ga_report_installed': lambda: True,
            'popular_datasets': popular_datasets,
            'most_popular_datasets': most_popular_datasets,
            'single_popular_dataset': single_popular_dataset,
            'month_option_title': month_option_title,
            'gravatar': custom_gravatar,
            'join_x': join_x,
            'join_y': join_y,
        }

    # IConfigurable

    def configure(self, config):
        '''Load config settings for this extension from config file.

        See IConfigurable.

        '''
        if 'googleanalytics.id' in config:
            # msg = "Missing googleanalytics.id in config"
            # raise GoogleAnalyticsException(msg)
            self.googleanalytics_id = config['googleanalytics.id']
            self.googleanalytics_domain = config.get(
                    'googleanalytics.domain', 'auto')
            self.googleanalytics_fields = ast.literal_eval(config.get(
                'googleanalytics.fields', '{}'))

            googleanalytics_linked_domains = config.get(
                'googleanalytics.linked_domains', ''
            )
            self.googleanalytics_linked_domains = [
                x.strip() for x in googleanalytics_linked_domains.split(',') if x
            ]

            if self.googleanalytics_linked_domains:
                self.googleanalytics_fields['allowLinker'] = 'true'

            # self.googleanalytics_javascript_url = h.url_for_static(
            #         '/scripts/ckanext-googleanalytics.js')

            # If resource_prefix is not in config file then write the default value
            # to the config dict, otherwise templates seem to get 'true' when they
            # try to read resource_prefix from config.
            if 'googleanalytics_resource_prefix' not in config:
                config['googleanalytics_resource_prefix'] = (
                        commands.DEFAULT_RESOURCE_URL_TAG)
            self.googleanalytics_resource_prefix = config[
                'googleanalytics_resource_prefix']

            self.show_downloads = converters.asbool(
                config.get('googleanalytics.show_downloads', True))
            self.track_events = converters.asbool(
                config.get('googleanalytics.track_events', False))

            # spawn a pool of 5 threads, and pass them queue instance
            for i in range(5):
                t = AnalyticsPostThread(self.analytics_queue)
                t.setDaemon(True)
                t.start()

    def googleanalytics_header(self):
        '''Render the googleanalytics_header snippet for CKAN 2.0 templates.

        This is a template helper function that renders the
        googleanalytics_header jinja snippet. To be called from the jinja
        templates in this extension, see ITemplateHelpers.

        '''
        if config.get('googleanalytics.id', ''):
            data = {
                'googleanalytics_id': self.googleanalytics_id,
                'googleanalytics_domain': self.googleanalytics_domain,
                'googleanalytics_fields': str(self.googleanalytics_fields),
                'googleanalytics_linked_domains': self.googleanalytics_linked_domains
            }
            return toolkit.render_snippet(
                'googleanalytics/snippets/googleanalytics_header.html', data)

    def modify_resource_download_route(self, map):
        '''Modifies resource_download method in related controller
        to attach GA tracking code.
        '''

        if '_routenames' in map.__dict__:
            if 'resource_download' in map.__dict__['_routenames']:
                route_data = map.__dict__['_routenames']['resource_download'].__dict__
                route_controller = route_data['defaults']['controller'].split(
                    ':')
                module = importlib.import_module(route_controller[0])
                controller_class = getattr(module, route_controller[1])
                controller_class.resource_download = post_analytics_decorator(
                    controller_class.resource_download)
            else:
                # If no custom uploader applied, use the default one
                PackageController.resource_download = post_analytics_decorator(
                    PackageController.resource_download)
