import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.ds_stats.helpers as ds_helpers
from ckanext.ds_stats import DGA_CTRL


class DsStatsPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.ITemplateHelpers)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        if toolkit.asbool(config_.get('ckan.legacy_templates', False)):
            toolkit.add_template_directory(config_, 'templates_legacy')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'ds_stats')
        toolkit.add_resource('public/ckanext/stats', 'ckanext_ds_stats')

    # IRoutes

    def after_map(self, map):
        map.connect('stats', '/stats', controller=DGA_CTRL, action='index')
        map.connect('stats_action', '/stats/{action}', controller=DGA_CTRL)
        return map

    # ITemplateHelpers

    def get_helpers(self):
        return ds_helpers.get_helpers()
