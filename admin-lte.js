var screenSizes = {
  xs: 480,
  sm: 768,
  md: 992,
  lg: 1200
};

Template.AdminLTE.onCreated(function () {
  var self = this;
  var skin = 'blue';
  var fixed = false;
  var sidebarMini = false;

  if (this.data) {
    skin = this.data.skin || skin;
    fixed = this.data.fixed || fixed;
    sidebarMini = this.data.sidebarMini || sidebarMini;
  }

  self.isReady = new ReactiveVar(false);
  self.style = waitOnCSS(cssUrl());
  self.skin = waitOnCSS(skinUrl(skin));

  fixed && $('body').addClass('fixed');
  sidebarMini && $('body').addClass('sidebar-mini');
  self.removeClasses = function () {
    fixed && $('body').removeClass('fixed');
    sidebarMini && $('body').removeClass('sidebar-mini');
  }

  this.autorun(function () {
    if (self.style.ready() && self.skin.ready()) {
      self.isReady.set(true);
    }
  });
});

Template.AdminLTE.onDestroyed(function () {
  this.removeClasses();
  this.style.remove();
  this.skin.remove();
});

Template.AdminLTE.helpers({
  isReady: function () {
    return Template.instance().isReady.get();
  },

  loadingTemplate: function () {
    return this.loadingTemplate || 'AdminLTE_loading';
  },

  skin: function () {
    return this.skin || 'blue';
  }
});

Template.AdminLTE.events({
  'click [data-toggle=offcanvas]': function (e, t) {
    e.preventDefault();

    //Enable sidebar push menu
    if ($(window).width() > (screenSizes.sm - 1)) {
      $("body").toggleClass('sidebar-collapse');
    }
    //Handle sidebar push menu for small screens
    else {
      if ($("body").hasClass('sidebar-open')) {
        $("body").removeClass('sidebar-open');
        $("body").removeClass('sidebar-collapse')
      } else {
        $("body").addClass('sidebar-open');
      }
    }
  },

  'click .content-wrapper': function (e, t) {
    //Enable hide menu when clicking on the content-wrapper on small screens
    if ($(window).width() <= (screenSizes.sm - 1) && $("body").hasClass("sidebar-open")) {
      $("body").removeClass('sidebar-open');
    }
  },

  'click .sidebar li a': function (e, t) {
    //Get the clicked link and the next element
    var $this = $(e.currentTarget);
    var checkElement = $this.next();

    //Check if the next element is a menu and is visible
    if ((checkElement.is('.treeview-menu')) && (checkElement.is(':visible'))) {
      //Close the menu
      checkElement.slideUp('normal', function () {
        checkElement.removeClass('menu-open');
      });
      checkElement.parent("li").removeClass("active");
    }
    //If the menu is not visible
    else if ((checkElement.is('.treeview-menu')) && (!checkElement.is(':visible'))) {
      //Get the parent menu
      var parent = $this.parents('ul').first();
      //Close all open menus within the parent
      var ul = parent.find('ul:visible').slideUp('normal');
      //Remove the menu-open class from the parent
      ul.removeClass('menu-open');
      //Get the parent li
      var parent_li = $this.parent("li");

      //Open the target menu and add the menu-open class
      checkElement.slideDown('normal', function () {
        //Add the class active to the parent li
        checkElement.addClass('menu-open');
        parent.find('li.active').removeClass('active');
        parent_li.addClass('active');
      });
    }
    //if this isn't a link, prevent the page from being redirected
    if (checkElement.is('.treeview-menu')) {
      e.preventDefault();
    }
  }
});

function cssUrl () {
  return Meteor.absoluteUrl('packages/mfactory_admin-lte/css/AdminLTE.min.css', _absoluteUrlOptions());
}

function skinUrl (name) {
  return Meteor.absoluteUrl(
    'packages/mfactory_admin-lte/css/skins/skin-' + name + '.min.css', _absoluteUrlOptions());
}

function _absoluteUrlOptions() {
  //add secure option if we are https
  return window.location.protocol.contains('https:') ? {secure: true} : {};
}

function waitOnCSS (url, timeout) {
  var isLoaded = new ReactiveVar(false);
  timeout = timeout || 5000;

  var link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;

  link.onload = function () {
    isLoaded.set(true);
  };

  if (link.addEventListener) {
    link.addEventListener('load', function () {
      isLoaded.set(true);
    }, false);
  }

  link.onreadystatechange = function () {
    var state = link.readyState;
    if (state === 'loaded' || state === 'complete') {
      link.onreadystatechange = null;
      isLoaded.set(true);
    }
  };

  var cssnum = document.styleSheets.length;
  var ti = setInterval(function () {
    if (document.styleSheets.length > cssnum) {
      isLoaded.set(true);
      clearInterval(ti);
    }
  }, 10);

  setTimeout(function () {
    isLoaded.set(true);
  }, timeout);

  $(document.head).append(link);

  return {
    ready: function () {
      return isLoaded.get();
    },

    remove: function () {
      $('link[href="' + url + '"]').remove();
    }
  };
}
