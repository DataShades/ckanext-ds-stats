"use strict";
ckan.module('ga-report-graphs-rickshaw', function($, _){
  return {
    initialize: function(){
      $.proxyAll(this, /_on/);
      var ga_rep_id = jQuery(this.el).data("id");
      var ga_rep_items = jQuery(this.el).data("items");
      var ga_rep_mode = jQuery(this.el).data("mode");
      var ga_rep_colorscheme = jQuery(this.el).data("colorscheme");
      CKAN.GA_Reports.render_rickshaw(ga_rep_id, ga_rep_items, ga_rep_mode, ga_rep_colorscheme);

    }
  }
});
