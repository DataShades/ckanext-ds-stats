import datetime
from sqlalchemy import Table, select, func
from sqlalchemy.sql.expression import text
import ckan.logic as logic
import ckan.model as model
from pylons import cache

import re

DATE_FORMAT = '%Y-%m-%d'
TODAY = datetime.date.today()


def table(name):
    return Table(name, model.meta.metadata, autoload=True)


def datetime2date(datetime_):
    return datetime.date(datetime_.year, datetime_.month, datetime_.day)


class Stats(object):

    _our_cache = None
    _cache_timeout = None

    @classmethod
    def init(cls, our_cache=None, cache_timeout=86400):
        if our_cache is None:
            cls._our_cache = cache.get_cache('stats', type='memory')
        else:
            cls._our_cache = our_cache
        cls._cache_timeout = cache_timeout

    @classmethod
    def top_rated_packages(cls, limit=10):
        # NB Not using sqlalchemy as sqla 0.4 doesn't work using both group_by
        # and apply_avg
        def fetch_top_rated_packages():
            package = table('package')
            rating = table('rating')
            sql = select([package.c.id, func.avg(rating.c.rating),
                          func.count(rating.c.rating)],
                         from_obj=[package.join(rating)]).\
                where(package.c.private == 'f').\
                group_by(package.c.id).\
                order_by(func.avg(rating.c.rating).desc(),
                         func.count(rating.c.rating).desc()).\
                limit(limit)
            res_ids = model.Session.execute(sql).fetchall()
            return [(model.Session.query(model.Package).get(unicode(pkg_id)),
                     avg, num) for pkg_id, avg, num in res_ids]

        if cls._cache_timeout:
            key = 'top_rated_packages_limit_%s' % str(limit)
            res_pkgs = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_top_rated_packages,
                expiretime=cls._cache_timeout)
        else:
            res_pkgs = fetch_top_rated_packages()
        return res_pkgs

    @classmethod
    def most_edited_packages(cls, limit=10):

        def fetch_most_edited_packages():
            package_revision = table('package_revision')
            package = table('package')
            s = select([package_revision.c.id,
                        func.count(package_revision.c.revision_id)],
                       from_obj=[package_revision.join(package)]). \
                where(package.c.private == 'f'). \
                group_by(package_revision.c.id). \
                order_by(func.count(package_revision.c.revision_id).desc()). \
                limit(limit)
            res_ids = model.Session.execute(s).fetchall()
            return [(model.Session.query(model.Package).get(unicode(pkg_id)),
                     val) for pkg_id, val in res_ids]

        if cls._cache_timeout:
            key = 'most_edited_packages_limit_%s' % str(limit)
            res_pkgs = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_most_edited_packages,
                expiretime=cls._cache_timeout)
        else:
            res_pkgs = fetch_most_edited_packages()

        return res_pkgs

    @classmethod
    def largest_groups(cls, limit=10):

        def fetch_largest_groups():
            member = table('member')
            s = select([member.c.group_id, func.count(member.c.table_id)]). \
                group_by(member.c.group_id). \
                where(member.c.group_id != None). \
                where(member.c.table_name == 'package'). \
                where(member.c.capacity == 'public'). \
                order_by(func.count(member.c.table_id).desc()). \
                limit(limit)

            res_ids = model.Session.execute(s).fetchall()
            return [(model.Session.query(model.Group).get(unicode(group_id)),
                     val) for group_id, val in res_ids]

        if cls._cache_timeout:
            key = 'largest_groups_limit_%s' % str(limit)
            res_groups = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_largest_groups,
                expiretime=cls._cache_timeout)
        else:
            res_groups = fetch_largest_groups()
        return res_groups

    @classmethod
    def by_org(cls, limit=10):

        def fetch_by_org():
            connection = model.Session.connection()
            res = connection.execute("select package.owner_org, package.private, count(*) from package \
              inner join (select distinct package_id from resource) as r on package.id = r.package_id \
              inner join \"group\" on package.owner_org = \"group\".id \
              where package.state='active'\
              group by package.owner_org,\"group\".name, package.private \
              order by \"group\".name, package.private;").fetchall()
            return [(model.Session.query(model.Group).get(unicode(group_id)),
                     private, val) for group_id, private, val in res]

        if cls._cache_timeout:
            key = 'fetch_by_org'
            res_groups = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_by_org,
                expiretime=cls._cache_timeout)
        else:
            res_groups = fetch_by_org()

        return res_groups

    @classmethod
    def res_by_org(cls, limit=10):

        def fetch_res_by_org():
            connection = model.Session.connection()
            reses = connection.execute("select owner_org,format,count(*) from \
            resource inner join package on resource.package_id = package.id \
            group by owner_org,format order by count desc;").fetchall()
            group_ids = []
            group_tab = {}
            group_spatial = {}
            group_other = {}
            for group_id, format, count in reses:
                if group_id not in group_ids:
                    group_ids.append(group_id)
                    group_tab[group_id] = 0
                    group_spatial[group_id] = 0
                    group_other[group_id] = 0
                if re.search('xls|csv|ms-excel|spreadsheetml.sheet|zip|netcdf',
                             format, re.IGNORECASE):
                    group_tab[group_id] = group_tab[group_id] + count
                elif re.search('wms|wfs|wcs|shp|kml|kmz', format,
                               re.IGNORECASE):
                    group_spatial[group_id] = group_spatial[group_id] + count
                else:
                    group_other[group_id] = group_other[group_id] + count
            return [
                (model.Session.query(model.Group).get(unicode(group_id)),
                 group_tab[group_id], group_spatial[group_id],
                 group_other[group_id],
                 group_tab[group_id] + group_spatial[group_id] +
                 group_other[group_id]) for group_id in group_ids]

        if cls._cache_timeout:
            key = 'res_by_org'
            res_by_orgs = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_res_by_org,
                expiretime=cls._cache_timeout)
        else:
            res_by_orgs = fetch_res_by_org()

        return res_by_orgs

    @classmethod
    def top_active_orgs(cls, limit=10):

        def fetch_top_active_orgs():
            connection = model.Session.connection()
            res = connection.execute("select package.owner_org, count(*) from package \
            inner join (select distinct package_id from resource) as r on package.id = r.package_id \
            inner join \"group\" on package.owner_org = \"group\".id \
            inner join (select distinct object_id from activity where activity.timestamp > (now() - interval '60 day')) \
            latestactivities on latestactivities.object_id = package.id \
            where package.state='active' \
            and package.private = 'f' \
            group by package.owner_org \
            order by count(*) desc;").fetchall()
            return [(model.Session.query(model.Group).get(unicode(group_id)),
                     val) for group_id, val in res]

        if cls._cache_timeout:
            key = 'top_active_orgs'
            res_groups = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_top_active_orgs,
                expiretime=cls._cache_timeout)
        else:
            res_groups = fetch_top_active_orgs()
        return res_groups

    @classmethod
    def top_package_owners(cls, limit=10):

        def fetch_top_package_owners():
            query = model.Session.query(
                        model.Package.creator_user_id,
                        func.count(model.Package.creator_user_id))

            userid_count = query.filter(model.Package.state == 'active')\
                                .filter(model.Package.private == False)\
                                .group_by(model.Package.creator_user_id)\
                                .order_by(func.count(
                                    model.Package.creator_user_id).desc())\
                                .limit(limit).all()
            return [
                (model.Session.query(model.User).get(unicode(user_id)), count)
                for user_id, count in userid_count
                if user_id]

        if cls._cache_timeout:
            key = 'top_package_owners_limit_%s' % str(limit)
            res_groups = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_top_package_owners,
                expiretime=cls._cache_timeout)
        else:
            res_groups = fetch_top_package_owners()
        return res_groups

    @classmethod
    def summary_stats(cls):

        def fetch_summary_stats():
            connection = model.Session.connection()
            try:
                from ckanext.datastore.db import (
                    get_all_resources_ids_in_datastore)
            except ImportError:
                from ckanext.datastore.backend import (
                    get_all_resources_ids_in_datastore)

            result = []
            result.append(('Total Datasets',
                           logic.get_action('package_search')(
                                                {}, {"rows": 1})['count']))
            result.append(('Total Machine Readable/Data API Resources',
                           logic.get_action('resource_search')(
                                {}, {"query": ["format:wms"]})['count'] + len(
                               get_all_resources_ids_in_datastore())))
            result.append(('Total Organisations',
                           len(logic.get_action('organization_list')({}, {}))))

            res = connection.execute("select 'Total Archived Datasets', count(*) from package where (state='active' or state='draft' or state='draft-complete') and private = 't' and package.id not in (select package_id from package_extra where key = 'harvest_portal') union \
                            select 'Total Data Files/Resources', count(*) from resource where state='active' and package_id not in (select package_id from package_extra where key = 'harvest_portal')").fetchall()

            for measure, value in res:
                if measure == 'Total Archived Datasets':
                    result.insert(0, (measure, value))
                else:
                    result.append((measure, value))

            return result

        if cls._cache_timeout:
            key = 'summary_stats'
            sum_stats = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_summary_stats,
                expiretime=cls._cache_timeout)
        else:
            sum_stats = fetch_summary_stats()
        return sum_stats

    @classmethod
    def activity_counts(cls):

        def fetch_activity_counts():
            connection = model.Session.connection()
            return connection.execute(
                "select to_char(timestamp, 'YYYY-MM') as month,activity_type, count(*) from activity group by month, activity_type order by month;").fetchall()

        if cls._cache_timeout:
            key = 'activity_counts'
            res = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_activity_counts,
                expiretime=cls._cache_timeout)
        else:
            res = fetch_activity_counts()

        return res

    @classmethod
    def user_access_list(cls):

        def fetch_user_access_list():
            connection = model.Session.connection()
            user_res = connection.execute(
                "select \"user\".id ,sysadmin,capacity,max(last_active),array_agg(\"group\".name) member_of_orgs from \"user\" "
                " left outer join member on member.table_id = \"user\".id " \
                " left outer join (select max(timestamp) last_active,user_id from activity group by user_id) a on \"user\".id = a.user_id " \
                " left outer join \"group\" on member.group_id = \"group\".id  where sysadmin = 't' or (capacity is not null and member.state = 'active')" \
                " group by \"user\".id ,sysadmin,capacity order by max(last_active) desc;").fetchall()
            return [(model.Session.query(model.User).get(unicode(user_id)), sysadmin, role, last_active, orgs) for
                    (user_id, sysadmin, role, last_active, orgs) in user_res]

        if cls._cache_timeout:
            key = 'user_access_list'
            res = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_user_access_list,
                expiretime=cls._cache_timeout)
        else:
            res = fetch_user_access_list()

        return res

    @classmethod
    def recent_datasets(cls):

        def fetch_recent_datasets():
            activity = table('activity')
            package = table('package')
            s = select([func.max(activity.c.timestamp),
                        package.c.id, activity.c.activity_type],
                       from_obj=[
                           activity.join(package,
                                         activity.c.object_id == package.c.id)
                           ]).where(package.c.private == 'f').\
                where(activity.c.timestamp > func.now() - text("interval '60 day'")).\
                group_by(package.c.id, activity.c.activity_type).order_by(
                    func.max(activity.c.timestamp))
            result = model.Session.execute(s).fetchall()
            return [
                (
                    datetime2date(timestamp),
                    model.Session.query(model.Package).get(
                        unicode(package_id)), activity_type
                )
                for timestamp, package_id, activity_type in result]

        if cls._cache_timeout:
            key = 'recent_datasets'
            res = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_recent_datasets,
                expiretime=cls._cache_timeout)
        else:
            res = fetch_recent_datasets()

        return res


class RevisionStats(object):

    _our_cache = None
    _cache_timeout = None

    @classmethod
    def init(cls, our_cache=None, cache_timeout=86400):
        if our_cache is None:
            cls._our_cache = cache.get_cache('stats', type='memory')
        else:
            cls._our_cache = our_cache
        cls._cache_timeout = cache_timeout

    @classmethod
    def package_addition_rate(cls, weeks_ago=0):
        week_commenced = cls.get_date_weeks_ago(weeks_ago)
        return cls.get_objects_in_a_week(week_commenced,
                                         type_='package_addition_rate')

    @classmethod
    def package_revision_rate(cls, weeks_ago=0):
        week_commenced = cls.get_date_weeks_ago(weeks_ago)
        return cls.get_objects_in_a_week(week_commenced,
                                         type_='package_revision_rate')

    @classmethod
    def get_date_weeks_ago(cls, weeks_ago):
        '''
        @param weeks_ago: specify how many weeks ago to give count for
                          (0 = this week so far)
        '''
        return TODAY - datetime.timedelta(
            days=datetime.date.weekday(TODAY) + 7 * weeks_ago)

    @classmethod
    def get_week_dates(cls, weeks_ago):
        '''
        @param weeks_ago: specify how many weeks ago to give count for
                          (0 = this week so far)
        '''
        date_from = datetime.datetime(TODAY.year, TODAY.month, TODAY.day) - \
            datetime.timedelta(
                days=datetime.date.weekday(TODAY) + 7 * weeks_ago)
        date_to = date_from + datetime.timedelta(days=7)
        return date_from, date_to

    @classmethod
    def get_date_week_started(cls, date_):
        assert isinstance(date_, datetime.date)
        if isinstance(date_, datetime.datetime):
            date_ = datetime2date(date_)
        return date_ - datetime.timedelta(days=datetime.date.weekday(date_))

    @classmethod
    def get_package_revisions(cls):
        '''
        @return: Returns list of revisions and date of them, in
                 format: [(id, date), ...]
        '''

        def fetch_package_revisions():
            package_revision = table('package_revision')
            revision = table('revision')
            s = select([package_revision.c.id, revision.c.timestamp],
                       from_obj=[package_revision.join(revision)]).order_by(
                revision.c.timestamp)
            return model.Session.execute(s).fetchall()  # [(id, datetime), ...]

        if cls._cache_timeout:
            key = 'package_revisions'
            res = cls._our_cache.get_value(
                key=key,
                createfunc=fetch_package_revisions,
                expiretime=cls._cache_timeout)
        else:
            res = fetch_package_revisions()

        return res

    @classmethod
    def get_new_packages(cls):
        '''
        @return: Returns list of new pkgs and date when they were created, in
                 format: [(id, date_ordinal), ...]
        '''

        def new_packages():
            # Can't filter by time in select because 'min' function has to
            # be 'for all time' else you get first revision in the time period.
            connection = model.Session.connection()
            res = connection.execute(""
                                     "SELECT package_revision.id, min(revision.timestamp) AS min_1 FROM package_revision "
                                     "JOIN revision ON revision.id = package_revision.revision_id "
                                     "WHERE package_revision.id in (select id from package where package.type='dataset' and package.state='active' and package.private = 'f')"
                                     "and package_revision.id not in (select package_id from package_extra where key = 'harvest_portal') "
                                     "GROUP BY package_revision.id ORDER BY min(revision.timestamp)")
            res_pickleable = []
            for pkg_id, created_datetime in res:
                res_pickleable.append((pkg_id, created_datetime.toordinal()))
            return res_pickleable

        if cls._cache_timeout:
            week_commences = cls.get_date_week_started(TODAY)
            key = 'all_new_packages_%s' + week_commences.strftime(DATE_FORMAT)
            new_packages = cls._our_cache.get_value(
                key=key,
                createfunc=new_packages)
        else:
            new_packages = new_packages()
        return new_packages

    @classmethod
    def get_num_packages_by_week(cls):
        def num_packages():
            new_packages_by_week = cls.get_by_week('new_packages')

            first_date = datetime.datetime.strptime(new_packages_by_week[0][0],
                                                    DATE_FORMAT).date()
            cls._cumulative_num_pkgs = 0
            new_pkgs = []

            def build_weekly_stats(week_commences, new_pkg_ids,
                                   deleted_pkg_ids):
                num_pkgs = len(new_pkg_ids)
                new_pkgs.extend([model.Session.query(
                    model.Package).get(id).name for id in new_pkg_ids])

                cls._cumulative_num_pkgs += num_pkgs
                return (week_commences.strftime(DATE_FORMAT),
                        num_pkgs, cls._cumulative_num_pkgs)

            week_ends = first_date
            new_package_week_index = 0
            # [(week_commences, num_packages, cumulative_num_pkgs])]
            weekly_numbers = []
            while week_ends <= TODAY:
                week_commences = week_ends
                week_ends = week_commences + datetime.timedelta(days=7)
                if datetime.datetime.strptime(
                        new_packages_by_week[new_package_week_index][0],
                        DATE_FORMAT).date() == week_commences:
                    new_pkg_ids = new_packages_by_week[new_package_week_index][1]
                    new_package_week_index += 1
                else:
                    new_pkg_ids = []

                weekly_numbers.append(build_weekly_stats(week_commences,
                                                         new_pkg_ids, []))
            # just check we got to the end of each count
            assert new_package_week_index == len(new_packages_by_week)
            return weekly_numbers

        if cls._cache_timeout:
            week_commences = cls.get_date_week_started(TODAY)
            key = 'number_packages_%s' + week_commences.strftime(DATE_FORMAT)
            num_packages = cls._our_cache.get_value(
                key=key,
                createfunc=num_packages)
        else:
            num_packages = num_packages()
        return num_packages

    @classmethod
    def get_by_week(cls, object_type):
        cls._object_type = object_type

        def objects_by_week():
            if cls._object_type == 'new_packages':
                objects = cls.get_new_packages()

                def get_date(object_date):
                    return datetime.date.fromordinal(object_date)
            elif cls._object_type == 'package_revisions':
                objects = cls.get_package_revisions()

                def get_date(object_date):
                    return datetime2date(object_date)
            else:
                raise NotImplementedError()
            first_date = get_date(objects[0][1]) if objects else TODAY
            week_commences = cls.get_date_week_started(first_date)
            week_ends = week_commences + datetime.timedelta(days=7)
            weekly_pkg_ids = []  # [(week_commences, [pkg_id1, pkg_id2, ...])]
            pkg_id_stack = []
            cls._cumulative_num_pkgs = 0

            def build_weekly_stats(week_commences, pkg_ids):
                num_pkgs = len(pkg_ids)
                cls._cumulative_num_pkgs += num_pkgs
                return (week_commences.strftime(DATE_FORMAT),
                        pkg_ids, num_pkgs, cls._cumulative_num_pkgs)

            for pkg_id, date_field in objects:
                date_ = get_date(date_field)
                if date_ >= week_ends:
                    weekly_pkg_ids.append(build_weekly_stats(week_commences,
                                                             pkg_id_stack))
                    pkg_id_stack = []
                    week_commences = week_ends
                    week_ends = week_commences + datetime.timedelta(days=7)
                pkg_id_stack.append(pkg_id)
            weekly_pkg_ids.append(build_weekly_stats(week_commences,
                                                     pkg_id_stack))
            while week_ends <= TODAY:
                week_commences = week_ends
                week_ends = week_commences + datetime.timedelta(days=7)
                weekly_pkg_ids.append(build_weekly_stats(week_commences, []))
            return weekly_pkg_ids

        if cls._cache_timeout:
            week_commences = cls.get_date_week_started(TODAY)
            key = '%s_by_week_%s' % (cls._object_type,
                                     week_commences.strftime(DATE_FORMAT))
            objects_by_week_ = cls._our_cache.get_value(
                key=key,
                createfunc=objects_by_week)
        else:
            objects_by_week_ = objects_by_week()
        return objects_by_week_

    @classmethod
    def get_objects_in_a_week(cls, date_week_commences,
                              type_='new-package-rate'):
        '''
        @param type: Specifies what to return about the specified week:
                     "package_addition_rate" number of new packages
                     "package_revision_rate" number of package revisions
                     "new_packages" a list of the packages created
                     in a tuple with the date.
                     "deleted_packages" a list of the packages deleted
                     in a tuple with the date.
        @param dates: date range of interest - a tuple:
                     (start_date, end_date)
        '''
        assert isinstance(date_week_commences, datetime.date)
        if type_ in ('package_addition_rate', 'new_packages'):
            object_type = 'new_packages'
        elif type_ == 'package_revision_rate':
            object_type = 'package_revisions'
        else:
            raise NotImplementedError()
        objects_by_week = cls.get_by_week(object_type)
        date_wc_str = date_week_commences.strftime(DATE_FORMAT)
        object_ids = None
        for objects_in_a_week in objects_by_week:
            if objects_in_a_week[0] == date_wc_str:
                object_ids = objects_in_a_week[1]
                break
        if object_ids is None:
            raise TypeError('Week specified is outside range')
        assert isinstance(object_ids, list)
        if type_ in ('package_revision_rate', 'package_addition_rate'):
            return len(object_ids)
        elif type_ in ('new_packages', 'deleted_packages'):
            return [model.Session.query(model.Package).get(pkg_id)
                    for pkg_id in object_ids]
