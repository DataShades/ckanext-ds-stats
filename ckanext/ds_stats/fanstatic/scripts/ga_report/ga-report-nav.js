/* Quick module to enhance the Bootstrap tags plug-in to update the url
 * hash when a tab changes to allow the user to bookmark the page.
 *
 * Each tab id must use a prefix which which will be stripped from the hash.
 * This is to prevent the page jumping when the hash fragment changes.
 *
 * prefix - The prefix used on the ids.
 *
 */
this.ckan.module('ga-report-nav', {
  /* An options object */
  options: {
    prefix: 'ga-report-'
  },

  /* Initializes the module and sets up event listeners.
   *
   * Returns nothing.
   */
  initialize: function () {
      console.log('!!!!!!!!!!!!!!!!!!!');
    var location = this.sandbox.location;
    var prefix = this.options.prefix;
    var hash = location.hash.slice(1);
    var selected = this.$('[href^=#' + prefix + hash + ']');

    // Update the hash fragment when the tab changes.
    this.el.on('shown', function (event) {
      location.hash = event.target.hash.slice(prefix.length + 1);
      var url = event.target.hash;
      var menu_name = $('[href^=' + event.target.hash + ']').text();
      var new_menu = $('<li class="breadcrumb-ga-report"><a href="' + url + '">' + menu_name + '</a></li>');
      if ($('.breadcrumb').children()[2]) {
          $('.breadcrumb').children()[2].remove();
      }
      $('.breadcrumb').children()[1].after(new_menu[0]);
    });

    // Show the current tab if the location provides one.
    if (selected.length) {
      selected.tab('show');
    }
  }
});
