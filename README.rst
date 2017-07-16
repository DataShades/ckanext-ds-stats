=============
ckanext-ds-stats
=============

**CKAN Version:** 1.7.1+


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

    googleanalytics.id = UA-1010101-1
    googleanalytics.account = Account name (e.g. data.gov.uk, see top level item at https://www.google.com/analytics)
    googleanalytics.token.filepath = ~/pyenv/credentials.json
    ga-report.period = monthly
    ga-report.bounce_url = /

    The ga-report.bounce_url specifies a particular path to record the bounce rate for. Typically it is / (the home page).

3. Set up this extension's database tables using a paster command. (Ensure your CKAN pyenv is still activated, run the command from ``src/ckanext-ga-report``, alter the ``--config`` option to point to your site config file)::

    $ paster initdb-ga --config=../ckan/development.ini
    $ paster initdb-ga-report --config=../ckan/development.ini

4. Enable the extension in your CKAN config file by adding it to ``ckan.plugins``::

    ckan.plugins = ds_stats


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

 googleanalytics.token.filepath = ~/pyenv/credentials.json


Tutorial
--------

Download some GA data and store it in CKAN's database. (Ensure your CKAN pyenv is still activated, run the command from ``src/ckanext-ga-report``, alter the ``--config`` option to point to your site config file) and specifying the name of your auth file (token.dat by default) from the previous step::

 $ paster loadanalytics latest --config=../ckan/development.ini

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


-----------------
Running the Tests
-----------------

To run the tests, do::

    nosetests --nologcapture --with-pylons=test.ini

To run the tests and produce a coverage report, first make sure you have
coverage installed in your virtualenv (``pip install coverage``) then run::

    nosetests --nologcapture --with-pylons=test.ini --with-coverage --cover-package=ckanext.ds-stats --cover-inclusive --cover-erase --cover-tests
