/*!
 * Carbon Made jQuery Parallax Plugin
 * http://carbon.fi/
 *
 * Copyright 2012, Carbon Software Oy, Juri Saltbacka <juri@carbon.fi>
 */

if (typeof $.pluginMaker != 'function') {
  $.pluginMaker = function(plugin) {
    $.fn[plugin.prototype.name] = function(options) { // add the plugin function as a jQuery plugin
      var args = $.makeArray(arguments), // get the arguments 
          after = args.slice(1);
      return this.each(function() {
        var instance = $.data(this, plugin.prototype.name); // see if we have an instance
        if (instance) {
          if (typeof options == "string") { 
            instance[options].apply(instance, after); // call a method on the instance
          } else if (instance.update) {
            instance.update.apply(instance, args); // call update on the instance
          }
        } else {
          new plugin(this, options); // create the plugin
        }
      });
    };
  };
};

if(typeof Carbon == 'undefined') var Carbon = {};

Carbon.Parallax = function(el, options) {
  if(el) this.init(el, options);
}

$.extend(Carbon.Parallax.prototype, {

  name: 'parallax',
  elements: [],
  options: {
    alwaysInView: false,
    debug: false,
    //animationSpeed: 50,
    csstransforms3d: Modernizr.csstransforms3d,
    csstransforms: Modernizr.csstransforms
  },
  viewportHeight: 0,

  log: function() {
    if(this.options.debug) console.log( '[Carbon.Parallax] ', Array.prototype.slice.call(arguments) );
  },

  init: function(el, options) {

    this.element = $(el);
    this.options = $.extend(this.options, options);

    this.log('init');

    this.element.bind('destroyed', $.proxy(this.destroy, this));

    $.data(el, this.name, this); // Store instance to element data for great justice

    this.setup();
  },

  setup: function() {
    this.log('setup', Modernizr.touch);
    var _this = this;

    // Initiate elements
    $(this.element).find('.parallax-element').each(function(){
      _this.elements.push(this);
      $(this).data('top', parseInt($(this).css('top')) || $(this).offset().top);
      $(this).css({
        position: 'fixed'
      });
      //if(_this.options.csstransforms3d || _this.options.csstransforms) {
        $(this).css('top', '0px');
      //}
      _this.log('element', $(this), $(this).data('top'), $(this).css('top'), $(this).offset().top);
    });

    // Get the initial viewport height
    this.viewportHeight = this.getViewportHeight();

    (typeof window.onmousewheel != 'undefined' ? window : document).onmousewheel = function() { _this.calculate(); }; // Listen to mouse scrolling to avoid element twitching

    // Assign parallax listeners
    $(window).on('scroll',       function(e){ _this.calculate(); }); // Listen on the scroll event
    $(window).on('resize',       function(e){ _this.viewportHeight = _this.getViewportHeight(); }); // Listen on the resize event

    if(Modernizr.touch) {
      $(window).on('touchmove', function(e){ _this.calculate(); });
      /*var lastScrollTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
      setInterval(function(){
        var scrollTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        _this.log('scrolling?', scrollTop != lastScrollTop, lastScrollTop, scrollTop)
        if(scrollTop != lastScrollTop) {
          lastScrollTop = scrollTop;
          _this.calculate();
        }
      }, 20);*/
    }

    // Trigger scroll for initial element positioning
    $(window).trigger('scroll');
  },

  destroy: function() {
    this.log('destroy');
  },

  getViewportHeight: function() {
    var height = window.innerHeight, // Safari, Opera
        mode = document.compatMode;
    if ( (mode || !$.support.boxModel) ) { // IE, Gecko
        height = (mode == 'CSS1Compat') ?
        document.documentElement.clientHeight : // Standards
        document.body.clientHeight; // Quirks
    }
    this.log('getViewportHeight', height);
    return height;
  },

  inView: function() {
    var scrollTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop),
        top       = this.element.offset().top,
        height    = this.element.height();

    if (scrollTop > (top + height) || scrollTop + this.viewportHeight < top) {
      if(this.inview) this.inview = false;
    }
    else if (scrollTop < (top + height)) {
      if(!this.inview) this.inview = true;
    }

    this.log('inView', this.inview);
    return this.inview;
  },

  calculate: function() {
    var scrollTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop),
        _this = this;

    this.log('calculate');

    if(this.options.alwaysInView || this.inView()) {
      $(this.elements).each(function(){
        // Alternative: $(this).data('top') - (scrollTop + _this.viewportHeight) * ($(this).data('friction') || 0));
        var v = Math.round($(this).data('top') - scrollTop * ($(this).data('friction') || 0)) - scrollTop;
        if(_this.options.csstransforms3d) {
          this.style.webkitTransform = this.style.msTransform = this.style.MozTransform = this.style.OTransform = 'translate3d(0, ' + v + 'px, 0)';
        }
        else if(_this.options.csstransforms) {
          this.style.webkitTransform = this.style.msTransform = this.style.MozTransform = this.style.OTransform = 'translateY(' + v + 'px)';
        }
        else {
          this.style.marginTop = v + 'px';
        }
      });
    }
  },

});

$.pluginMaker(Carbon.Parallax);