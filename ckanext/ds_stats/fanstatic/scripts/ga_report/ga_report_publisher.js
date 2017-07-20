"use strict";
ckan.module('ga-report-publisher', function($, _){
  return {
    field: null,

    initialize: function(){
      $.proxyAll(this, /_on/);
      CKAN.GA_Reports.bind_month_selector();
    },
  }
});
