"use strict";
ckan.module('ga_report_graphs_others', function($, _){
  return {
    field: null,

    initialize: function(){
      $.proxyAll(this, /_on/);
      CKAN.GA_Reports.bind_sparklines();
      CKAN.GA_Reports.bind_sidebar();
      CKAN.GA_Reports.bind_month_selector();
    },
  }
});
