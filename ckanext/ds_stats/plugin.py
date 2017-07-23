import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from webhelpers.html import literal
from ckanext.ds_stats.helpers import (most_popular_datasets,
                                      popular_datasets,
                                      single_popular_dataset,
                                      month_option_title,
                                      join_x, join_y, date_range)
from ckanext.ds_stats.ds_stats_routes import (
    ga_enabled_routes_before_map,
    ga_enabled_routes_after_map,
    dga_stats_enabled_routes_after_map,
    ga_report_enabled_routes_before_map,
    stats_admin_enabled_routes_before_map
)
import ast
import logging
import urllib
import commands
import dbutil
import paste.deploy.converters as converters
from ckan.lib.base import c
import ckan.lib.helpers as h
from pylons import config
from ckan.controllers.package import PackageController

import urllib2
import importlib
import hashlib

import threading
import Queue

log = logging.getLogger('ckanext.ds_stats')


def custom_gravatar(*pargs, **kargs):
    gravatar = h.gravatar(*pargs, **kargs)
    pos = gravatar.find('/>')
    gravatar = gravatar[:pos] + literal(' alt="User\'s profile gravatar" ') +\
        gravatar[pos:]
    return gravatar


def _post_analytics(
        user, event_type, request_obj_type, request_function, request_id):

    if config.get('ds_stats.ga.id'):
        data_dict = {
            "v": 1,
            "tid": config.get('ds_stats.ga.id'),
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
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'ds_stats')

    # IRoutes

    def before_map(self, map):
        ga_enabled_routes_before_map(map)
        stats_admin_enabled_routes_before_map(map)
        ga_report_enabled_routes_before_map(map)
        return map

    def after_map(self, map):
        dga_stats_enabled_routes_after_map(map)
        self.modify_resource_download_route(map)
        ga_enabled_routes_after_map(map)
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
        if 'ds_stats.ga.id' in config:
            self.googleanalytics_id = config['ds_stats.ga.id']
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

            # If resource_prefix is not in config file then write the default
            # value to the config dict, otherwise templates seem to get 'true'
            # when they try to read resource_prefix from config.
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
        if config.get('ds_stats.ga.id', ''):
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
