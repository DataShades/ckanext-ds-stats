import ckan.plugins as p
from ckan.lib.base import BaseController, render, request, abort
import ckanext.ds_stats.stats as stats_lib
import ckan.lib.helpers as h
from ckan.controllers.admin import AdminController
from ckan.common import _
import ckan.model as model
from ckanext.ds_stats.ds_stats_model import DsStatsCache
from ckanext.ds_stats.helpers import get_cache_config
from ckanext.ds_stats import ADMINSTATS_CTRL
from pylons import cache
import pylons
import StringIO
import unicodecsv as csv
from operator import attrgetter

import Queue


def get_val(val):
    return val


def get_val_date(date):
    return h.render_datetime(h.date_str_to_datetime(date))


def get_orgs(orgs):
    if isinstance(orgs, list) and orgs[0]:
        org = ', '.join(orgs)
    else:
        org = orgs
    return org


def get_raw_new_datasets(index):
    raw_new_datasets = []
    week_queue = Queue.Queue()
    rev_stats = stats_lib.RevisionStats()
    new_packages_by_week = rev_stats.get_by_week('new_packages')
    package_revisions_by_week = rev_stats.get_by_week('package_revisions')

    for week_date, revs, num_revisions, cumulative_num_revisions in package_revisions_by_week:
        week_queue.put(week_date)

    for week_date, pkgs, num_packages, cumulative_num_packages in new_packages_by_week:
        revision_week_date = week_queue.get()
        while revision_week_date != week_date:
            raw_new_datasets.append({
                'date': h.date_str_to_datetime(revision_week_date),
                'new_packages': 0})
            revision_week_date = week_queue.get()

        raw_new_datasets.append({
            'date': h.date_str_to_datetime(week_date),
            'new_packages': num_packages})

    while not week_queue.empty():
        revision_week_date = week_queue.get()
        raw_new_datasets.append({
            'date': h.date_str_to_datetime(revision_week_date),
            'new_packages': 0})
    return raw_new_datasets[index]['new_packages']


class StatsController(BaseController):
    def index(self):
        c = p.toolkit.c
        our_cache = cache.get_cache('stats', type='memory')
        public_display, sysadmin_display, cache_timeout = get_cache_config()
        get_stats_display = public_display or (
            sysadmin_display and h.check_access('sysadmin'))
        if get_stats_display:
            stats = stats_lib.Stats()
            stats.init(our_cache, cache_timeout)
            rev_stats = stats_lib.RevisionStats()
            rev_stats.init(our_cache, cache_timeout)
            c.top_rated_packages = stats.top_rated_packages()
            c.most_edited_packages = stats.most_edited_packages()
            c.largest_groups = stats.largest_groups()
            c.top_package_owners = stats.top_package_owners()
            c.summary_stats = stats.summary_stats()
            c.activity_counts = stats.activity_counts()
            c.by_org = stats.by_org()
            c.res_by_org = stats.res_by_org()
            c.top_active_orgs = stats.top_active_orgs()
            c.user_access_list = stats.user_access_list()
            c.recent_datasets = stats.recent_datasets()
            c.new_packages_by_week = rev_stats.get_by_week('new_packages')
            c.num_packages_by_week = rev_stats.get_num_packages_by_week()
            c.package_revisions_by_week = rev_stats.get_by_week(
                'package_revisions')

            # Used in the legacy CKAN templates.
            c.packages_by_week = []

            # Used in new CKAN templates gives more control to the templates for formatting.
            c.raw_packages_by_week = []

            for week_date, num_packages, cumulative_num_packages in c.num_packages_by_week:
                c.packages_by_week.append(
                    '[new Date(%s), %s]' % (week_date.replace('-', ','),
                                            cumulative_num_packages))
                c.raw_packages_by_week.append({
                    'date': h.date_str_to_datetime(week_date),
                    'total_packages': cumulative_num_packages})

            c.all_package_revisions = []
            c.raw_all_package_revisions = []
            week_queue = Queue.Queue()
            for week_date, revs, num_revisions, cumulative_num_revisions in c.package_revisions_by_week:
                c.all_package_revisions.append(
                    '[new Date(%s), %s]' % (week_date.replace('-', ','),
                                            num_revisions))
                c.raw_all_package_revisions.append({
                    'date': h.date_str_to_datetime(week_date),
                    'total_revisions': num_revisions})
                week_queue.put(week_date)

            c.new_datasets = []
            c.raw_new_datasets = []
            for week_date, pkgs, num_packages, cumulative_num_packages in c.new_packages_by_week:
                revision_week_date = week_queue.get()
                while revision_week_date != week_date:
                    c.new_datasets.append(
                        '[new Date(%s), %s]' % (
                            revision_week_date.replace('-', ','), 0))
                    c.raw_new_datasets.append({
                        'date': h.date_str_to_datetime(revision_week_date),
                        'new_packages': 0})
                    revision_week_date = week_queue.get()

                c.new_datasets.append(
                    '[new Date(%s), %s]' % (week_date.replace('-', ','),
                                            num_packages))
                c.raw_new_datasets.append({
                    'date': h.date_str_to_datetime(week_date),
                    'new_packages': num_packages})

            while not week_queue.empty():
                revision_week_date = week_queue.get()
                c.new_datasets.append(
                    '[new Date(%s), %s]' % (
                        revision_week_date.replace('-', ','), 0))
                c.raw_new_datasets.append({
                    'date': h.date_str_to_datetime(revision_week_date),
                    'new_packages': 0})

            return p.toolkit.render('stats/index.html')
        else:
            abort(403, _('Not authorized to see this page'))

    def download_stats_csv(self):
        params = request.params.items()
        stats = stats_lib.Stats()
        rev_stats = stats_lib.RevisionStats()
        stat_name = params[0][1]
        records = []

        STATS = {
            'stats-recent-datasets': {
                'headers': ['Date', 'Dataset', 'New/Modified'],
                'method': stats.recent_datasets,
                'map': [get_val, attrgetter('title'), str]},
            'stats-total-datasets': {
                'headers': ['Date', 'Total datasets'],
                'method': rev_stats.get_num_packages_by_week,
                'map': [get_val_date, get_val, int]},
            'stats-dataset-revisions': {
                'headers': ['Date', 'All dataset revisions', 'New datasets'],
                'method': rev_stats.get_by_week,
                'map': [get_val_date, get_val, int, int, get_raw_new_datasets]},
            'stats-most-edited': {
                'headers': ['Dataset', 'Number of edits'],
                'method': stats.most_edited_packages,
                'map': [attrgetter('title'), int]},
            'stats-by-org': {
                'headers': ['Organisation', 'Public/Archived', 'Number of datasets'],
                'method': stats.by_org,
                'map': [attrgetter('title'), str, int]},
            'stats-res-by-org': {
                'headers': ['Organisation', 'Tabular', 'Spatial', 'Other', 'Total'],
                'method': stats.res_by_org,
                'map': [attrgetter('title')] + [int] * 4},
            'stats-activity-org': {
                'headers': ['Organisation', 'Number of datasets updated recently'],
                'method': stats.top_active_orgs,
                'map': [attrgetter('title'), int]},
            'stats-summary': {
                'headers': ['Measure', 'Value'],
                'method': stats.summary_stats,
                'map': [str, int]},
            'stats-user-access-list': {
                'headers': ['Username', 'Sysadmin', 'Organisational Role', 'Last Activity', 'Organizations'],
                'method': stats.user_access_list,
                'map': [attrgetter('display_name' or 'name'), bool, str, get_val, get_orgs]}
        }

        for stat in STATS:
            if stat == stat_name:
                if stat != 'stats-dataset-revisions':
                    data = STATS[stat]['method']()
                else:
                    data = STATS[stat]['method']('package_revisions')
                if data:
                    for item_idx, item in enumerate(data):
                        m = STATS[stat]['map']
                        res = []
                        for map_idx, mapper in enumerate(m):
                            if len(item) > map_idx:
                                val = item[map_idx]
                                if stat == 'stats-by-org' and isinstance(val, bool):
                                    val = 'Archived' if val else 'Public'
                                val = mapper(val)
                            else:
                                val = mapper(item_idx)
                            res.append(val)
                        records.append(res)
                    for record in records:
                        if stat == 'stats-dataset-revisions':
                            del(record[1])
                            del(record[2])
                        elif stat == 'stats-total-datasets':
                            del(record[1])
                        elif stat == 'stats-user-access-list' and record[0] == 'default':
                            del(records[0])

                    return self._create_csv(stat_name,
                                            STATS[stat_name]['headers'],
                                            records)

    def _create_csv(self, filename, heades_title, fields):
        pylons.response.headers['Content-Type'] = 'text/csv'
        pylons.response.headers['Content-disposition'] = \
            'attachment; filename="{name}.csv"'.format(name=filename)
        f = StringIO.StringIO()
        w = csv.writer(f, encoding='utf-8')
        w.writerow(heades_title)
        for record in fields:
            w.writerow(record)
        return f.getvalue()


class AdminStatsController(AdminController):
    def cache_config(self):
        public_display, sysadmin_display, cache_timeout = get_cache_config()

        vars = {
            'public_display': public_display,
            'sysadmin_display': sysadmin_display,
            'cache_timeout': cache_timeout
        }

        data = request.POST
        if 'save' in data:
            pd = True if data.get('public_display') is not None else False
            ad = True if data.get('sysadmin_display') is not None else False
            ct = data['cache_timeout'] if data.get(
                'cache_timeout') else cache_timeout
            model.Session.query(DsStatsCache).update({
                'public_display': pd,
                'sysadmin_display': ad,
                'cache_timeout': ct
            })
            model.Session.commit()
            our_cache = cache.get_cache('stats', type='memory')
            our_cache.clear()
            h.flash_success(_('Cache config updated'))
            h.redirect_to(controller=ADMINSTATS_CTRL, action='cache_config')

        vars = {
            'public_display': public_display,
            'sysadmin_display': sysadmin_display,
            'cache_timeout': cache_timeout,
            'cache_options':  [
                {'text': 'No caching', 'value': 0},
                {'text': '1 min', 'value': 60},
                {'text': '5 min', 'value': 300},
                {'text': '30 min', 'value': 1800},
                {'text': '1 hour', 'value': 3600},
                {'text': '12 hours', 'value': 43200},
                {'text': '1 day', 'value': 86400},
                {'text': '1 week', 'value': 604800}
            ]
        }
        return render('admin/cache_config.html', extra_vars=vars)
