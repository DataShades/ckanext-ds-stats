from routes.mapper import SubMapper
from ckanext.ds_stats import (GA_API_CTRL, GA_CTRL, DGA_CTRL, GAREPORT_CTRL,
                              GADATASETREPORT_CTRL, ADMINSTATS_CTRL)


def ga_enabled_routes_before_map(map):
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
    with SubMapper(map, controller=GA_API_CTRL,
                   path_prefix='/api{ver:/3|}',
                   ver='/3') as m:
        m.connect('/action/{logic_function}', action='action',
                  conditions=GET_POST)

    # /api ver 1, 2, 3 or none
    with SubMapper(map, controller=GA_API_CTRL,
                   path_prefix='/api{ver:/1|/2|/3|}',
                   ver='/1') as m:
        m.connect('/search/{register}', action='search')

    # /api/rest ver 1, 2 or none
    with SubMapper(map, controller=GA_API_CTRL,
                   path_prefix='/api{ver:/1|/2|}',
                   ver='/1', requirements=dict(register=register_list_str)
                   ) as m:

        m.connect('/rest/{register}', action='list', conditions=GET)
        m.connect('/rest/{register}', action='create', conditions=POST)
        m.connect('/rest/{register}/{id}', action='show', conditions=GET)
        m.connect('/rest/{register}/{id}', action='update', conditions=PUT)
        m.connect('/rest/{register}/{id}', action='update',
                  conditions=POST)
        m.connect('/rest/{register}/{id}', action='delete',
                  conditions=DELETE)


def ga_enabled_routes_after_map(map):
    map.redirect("/analytics/package/top", "/analytics/dataset/top")
    map.connect(
        'analytics', '/analytics/dataset/top',
        controller=GA_CTRL,
        action='view'
    )


def dga_stats_enabled_routes_after_map(map):
    with SubMapper(map, controller=DGA_CTRL) as m:
        m.connect('stats', '/stats', action='index')
        m.connect('stats_action', '/stats/{action}')


def ga_report_enabled_routes_before_map(map):
    # GaReport
    with SubMapper(map, controller=GAREPORT_CTRL) as m:
        m.connect('/stats/site-analytics', action='index')
        m.connect('/stats/site-analytics_{month}.csv', action='csv')
        m.connect('/stats/site-analytics/downloads', action='downloads')
        m.connect('/stats/site-analytics/downloads_{month}.csv',
                  action='csv_downloads')

    # GaDatasetReport
    with SubMapper(map, controller=GADATASETREPORT_CTRL) as m:
        m.connect('/stats/site-analytics/publisher', action='publishers')
        m.connect('/stats/site-analytics/publishers_{month}.csv',
                  action='publisher_csv')
        m.connect(
            '/stats/site-analytics/dataset/datasets_{id}_{month}.csv',
            action='dataset_csv'
        )
        m.connect('/stats/site-analytics/dataset', action='read')
        m.connect('/stats/site-analytics/dataset/{id}',
                  action='read_publisher')


def stats_admin_enabled_routes_before_map(map):
    with SubMapper(map, controller=ADMINSTATS_CTRL) as m:
        m.connect('admin_cache_config', '/ckan-admin/cache_config',
                  action='cache_config')
