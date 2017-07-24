=============
ckanext-ds-stats
=============

**CKAN Version:** 2.0+


Overview
--------

CKAN analytics and statistics plugin using dga-stats, ga-report and googleanalytics

------------
Requirements
------------

For example, you might want to mention here which versions of CKAN this
extension works with.


------------
Installation
------------

.. Add any additional install steps to the list below.
   For example installing any non-Python dependencies or adding any required
   config settings.

To install ckanext-ds-stats:

1. Activate your CKAN virtual environment and install::

     . /usr/lib/ckan/default/bin/activate
     $ pip install -e  git+https://github.com/wildcatzita/ckanext-ds-stats.git#egg=ckanext-ds-stats

2. Ensure you development.ini (or similar) contains the info about your Google Analytics account and configuration::

    ds_stats.ga.id = UA-1010101-1
    ds_stats.ga.account = Account name (e.g. data.gov.uk, see top level item at https://www.google.com/analytics)
    ds_stats.ga.token.filepath = ~/pyenv/credentials.json
    ds_stats.ga-report.period = monthly
    ds_stats.ga-report.bounce_url = /

The ds_stats.ga-report.bounce_url specifies a particular path to record the bounce rate for. Typically it is / (the home page).

3. Set up this extension's database tables using a paster command. (Ensure your CKAN pyenv is still activated, run the command from ``src/ckanext-ga-report``, alter the ``--config`` option to point to your site config file)::

    $ paster initdb-ga --config=../ckan/development.ini
    $ paster initdb-ga-report --config=../ckan/development.ini
    $ paster initdb-ds-stats-cache --config=../ckan/development.ini

4. Enable the extension in your CKAN config file by adding it to ``ckan.plugins``::

    ckan.plugins = ds_stats

5. Finally, there are some optional configuration settings (shown here
   with their default settings)::

      ds_stats.ga.resource_prefix = /downloads/
      ds_stats.ga.domain = auto
      ds_stats.ga.track_events = false
      ds_stats.ga.fields = {}
      ds_stats.ga.show_downloads = true

   ``resource_prefix`` is an arbitrary identifier so that we can query
   for downloads in Google Analytics.  It can theoretically be any
   string, but should ideally resemble a URL path segment, to make
   filtering for all resources easier in the Google Analytics web
   interface.

   ``domain`` allows you to specify a domain against which Analytics
   will track users.  You will usually want to leave this as ``auto``;
   if you are tracking users from multiple subdomains, you might want
   to specify something like ``.mydomain.com``.
   See `Google's documentation
   <http://code.google.com/apis/analytics/docs/gaJS/gaJSApiDomainDirectory.html#_gat.GA_Tracker_._setDomainName>`_
   for more info.

   If ``track_events`` is set, Google Analytics event tracking will be
   enabled. *CKAN 1.x only.* *Note that event tracking for resource downloads
   is always enabled,* ``track_events`` *enables event tracking for other
   pages as well.*

   ``fields`` allows you to specify various options when creating the tracker. See `Google's documentation
   <https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference>`_
   for more info.

   If ``show_downloads`` is set, a download count for resources will be displayed on individual package pages.

6. Look at some stats within CKAN

   Once your GA account has gathered some data, you can see some basic
   information about the most popular packages at:
   http://mydomain.com/stats/analytics/dataset/top

   By default the only data that is injected into the public-facing
   website is on the package page, where number of downloads are
   displayed next to each resource.

Domain Linking
--------------

This plugin supports cross-domain tracking using Googles' site linking feature.

To use this, set the ``ds_stats.ga.linked_domains`` configuration option to a (comma seperated) list of domains to report for.

See `Googles' documentation<https://support.google.com/analytics/answer/1034342?hl=en>`_ for more information


Authorization
--------------

Before you can access the data, you need to set up the OAUTH details which you can do by following the `instructions <https://developers.google.com/analytics/resources/tutorials/hello-analytics-api>`_ the outcome of which will be a file called credentials.json which should look like credentials.json.template with the relevant fields completed. These steps are below for convenience:

1. Visit the `Google APIs Console <https://code.google.com/apis/console>`_

2. Sign-in and create a project or use an existing project.

3. In the `Service accounts pane <https://console.developers.google.com/iam-admin/serviceaccounts>`_ choose your project and create new account. During creation check "Furnish a new private key" -> JSON type. Write down "Service account ID"(looks like email) - it will be used later.

4. Save downloaded file - it will be used by `loadanalytics` command(referenced as <credentials.json>)

5. Go to `GoogleAnalytics console <https://analytics.google.com/analytics/web/#management>`_ and chose ADMIN tab.

6. Find "User management" button in corresponding column. Add service account using Service account ID(email) generated in 3rd step and grant "Read" role to it.


Now ensure you reference the correct path to your credentials.json in your CKAN config file (e.g. development.ini)::

    ds_stats.ga.token.filepath = ~/pyenv/credentials.json


Tutorial
--------

Import Google stats by running the following command (Ensure your CKAN pyenv is still activated, run the command from ``ckanext-ds-stats``, alter the ``--config`` option to point to your site config file) and specifying the name of your credentials file::

    $ paster loadanalytics-ga credentials_file --config=../ckan/development.ini

Download some GA data and store it in CKAN's database. (Ensure your CKAN pyenv is still activated, run the command from ``ckanext-ds-stats``, alter the ``--config`` option to point to your site config file)::

    $ paster loadanalytics-ga-report latest --config=../ckan/development.ini

The value after the token file is how much data you want to retrieve, this can be

* **all**         - data for all time (since 2010)

* **latest**      - (default) just the 'latest' data

* **YYYY-MM-DD**  - just data for all time periods going back to (and including) this date


------------------------
Development Installation
------------------------

To install ckanext-ds-stats for development, activate your CKAN virtualenv and
do::

    git clone https://github.com/DataShades/ckanext-ds-stats.git
    cd ckanext-ds-stats
    python setup.py develop
    pip install -r dev-requirements.txt
