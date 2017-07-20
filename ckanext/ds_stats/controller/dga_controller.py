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

import Queue


class StatsController(BaseController):
    def index(self):
        c = p.toolkit.c
        our_cache = cache.get_cache('stats', type='memory')
        public_display, sysadmin_display, cache_timeout = get_cache_config()
        get_stats_display = public_display or (
            sysadmin_display and h.check_access('sysadmin'))
        if get_stats_display:
            stats = stats_lib.Stats()
            rev_stats = stats_lib.RevisionStats()
            c.top_rated_packages = stats.top_rated_packages(our_cache,
                                                            cache_timeout)
            c.most_edited_packages = stats.most_edited_packages(our_cache,
                                                                cache_timeout)
            c.largest_groups = stats.largest_groups(our_cache, cache_timeout)
            c.top_package_owners = stats.top_package_owners(our_cache,
                                                            cache_timeout)
            c.summary_stats = stats.summary_stats(our_cache, cache_timeout)
            c.activity_counts = stats.activity_counts(our_cache, cache_timeout)
            c.by_org = stats.by_org(our_cache, cache_timeout)
            c.res_by_org = stats.res_by_org(our_cache, cache_timeout)
            c.top_active_orgs = stats.top_active_orgs(our_cache, cache_timeout)
            c.user_access_list = stats.user_access_list(our_cache,
                                                        cache_timeout)
            c.recent_datasets = stats.recent_datasets(our_cache, cache_timeout)
            c.new_packages_by_week = rev_stats.get_by_week(
                'new_packages', our_cache, cache_timeout)
            c.num_packages_by_week = rev_stats.get_num_packages_by_week(
                our_cache, cache_timeout)
            c.package_revisions_by_week = rev_stats.get_by_week(
                'package_revisions', our_cache, cache_timeout)

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
