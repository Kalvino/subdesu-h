/*
 * Metadata - jQuery plugin for parsing metadata from elements
 *
 * Copyright (c) 2006 John Resig, Yehuda Katz, Jörn Zaefferer, Paul McLanahan
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.metadata.js 3640 2007-10-11 18:34:38Z pmclanahan $
 *
 */

/**
 * Sets the type of metadata to use. Metadata is encoded in JSON, and each property
 * in the JSON will become a property of the element itself.
 *
 * There are four supported types of metadata storage:
 *
 *   attr:  Inside an attribute. The name parameter indicates *which* attribute.
 *          
 *   class: Inside the class attribute, wrapped in curly braces: { }
 *   
 *   elem:  Inside a child element (e.g. a script tag). The
 *          name parameter indicates *which* element.
 *   html5: Values are stored in data-* attributes.
 *          
 * The metadata for an element is loaded the first time the element is accessed via jQuery.
 *
 * As a result, you can define the metadata type, use $(expr) to load the metadata into the elements
 * matched by expr, then redefine the metadata type and run another $(expr) for other elements.
 * 
 * @name $.metadata.setType
 *
 * @example <p id="one" class="some_class {item_id: 1, item_label: 'Label'}">This is a p</p>
 * @before $.metadata.setType("class")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from the class attribute
 * 
 * @example <p id="one" class="some_class" data="{item_id: 1, item_label: 'Label'}">This is a p</p>
 * @before $.metadata.setType("attr", "data")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a "data" attribute
 * 
 * @example <p id="one" class="some_class"><script>{item_id: 1, item_label: 'Label'}</script>This is a p</p>
 * @before $.metadata.setType("elem", "script")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a nested script element
 * 
 * @example <p id="one" class="some_class" data-item_id="1" data-item_label="Label">This is a p</p>
 * @before $.metadata.setType("html5")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a series of data-* attributes
 *
 * @param String type The encoding type
 * @param String name The name of the attribute to be used to get metadata (optional)
 * @cat Plugins/Metadata
 * @descr Sets the type of encoding to be used when loading metadata for the first time
 * @type undefined
 * @see metadata()
 */

(function($) {

$.extend({
  metadata : {
    defaults : {
      type: 'class',
      name: 'metadata',
      cre: /({.*})/,
      single: 'metadata'
    },
    setType: function( type, name ){
      this.defaults.type = type;
      this.defaults.name = name;
    },
    get: function( elem, opts ){
      var settings = $.extend({},this.defaults,opts);
      // check for empty string in single property
      if ( !settings.single.length ) settings.single = 'metadata';
      
      var data = $.data(elem, settings.single);
      // returned cached data if it already exists
      if ( data ) return data;
      
      data = "{}";
      
      var getData = function(data) {
        if(typeof data != "string") return data;
        
        if( data.indexOf('{') < 0 ) {
          data = eval("(" + data + ")");
        }
      }
      
      var getObject = function(data) {
        if(typeof data != "string") return data;
        
        data = eval("(" + data + ")");
        return data;
      }
      
      if ( settings.type == "html5" ) {
        var object = {};
        $( elem.attributes ).each(function() {
          var name = this.nodeName;
          if(name.match(/^data-/)) name = name.replace(/^data-/, '');
          else return true;
          object[name] = getObject(this.nodeValue);
        });
      } else {
        if ( settings.type == "class" ) {
          var m = settings.cre.exec( elem.className );
          if ( m )
            data = m[1];
        } else if ( settings.type == "elem" ) {
          if( !elem.getElementsByTagName ) return;
          var e = elem.getElementsByTagName(settings.name);
          if ( e.length )
            data = $.trim(e[0].innerHTML);
        } else if ( elem.getAttribute != undefined ) {
          var attr = elem.getAttribute( settings.name );
          if ( attr )
            data = attr;
        }
        object = getObject(data.indexOf("{") < 0 ? "{" + data + "}" : data);
      }
      
      $.data( elem, settings.single, object );
      return object;
    }
  }
});

/**
 * Returns the metadata object for the first member of the jQuery object.
 *
 * @name metadata
 * @descr Returns element's metadata object
 * @param Object opts An object contianing settings to override the defaults
 * @type jQuery
 * @cat Plugins/Metadata
 */
$.fn.metadata = function( opts ){
  return $.metadata.get( this[0], opts );
};

})(jQuery);/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options = $.extend({}, options); // clone object since it's unexpected behavior if the expired property were changed
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // NOTE Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};YAHOO.util.Event.onContentReady("global-bar", function () {

    var oMenuBar = new YAHOO.widget.MenuBar(
        "global-bar",
        { 
            autosubmenudisplay: true,
            showdelay: 100,
            hidedelay: 750,
            shadow: false,
            lazyload: true
        }
    );

    oMenuBar.render();

    var ua = YAHOO.env.ua,
        oAnim;

    function onSubmenuBeforeShow(p_sType, p_sArgs) {
        var oBody,
            oElement,
            oShadow,
            oUL;

        if (this.parent) {

            oElement = this.element;

            oShadow = oElement.lastChild;
            oShadow.style.height = "0px";

            if (oAnim && oAnim.isAnimated()) {
                oAnim.stop();
                oAnim = null;
            }

            oBody = this.body;

            if (this.parent && 
                !(this.parent instanceof YAHOO.widget.MenuBarItem)) {

                if (ua.gecko) {
                    oBody.style.width = oBody.clientWidth + "px";
                }

                if (ua.ie == 7) {
                    oElement.style.width = oElement.clientWidth + "px";
                }
            }

            oBody.style.overflow = "hidden";

            oUL = oBody.getElementsByTagName("ul")[0];

            oUL.style.marginTop = ("-" + oUL.offsetHeight + "px");
        }
    }

    function onTween(p_sType, p_aArgs, p_oShadow) {
        if (this.cfg.getProperty("iframe")) {
            this.syncIframe();
        }

        if (p_oShadow) {
            p_oShadow.style.height = this.element.offsetHeight + "px";
        }
    }

    function onAnimationComplete(p_sType, p_aArgs, p_oShadow) {
        var oBody = this.body,
            oUL = oBody.getElementsByTagName("ul")[0];

        if (p_oShadow) {
            p_oShadow.style.height = this.element.offsetHeight + "px";
        }

        oUL.style.marginTop = "";
        oBody.style.overflow = "";

        if (this.parent && 
            !(this.parent instanceof YAHOO.widget.MenuBarItem)) {

            // Clear widths set by the "beforeshow" event handler
            if (ua.gecko) {
                oBody.style.width = "";
            }

            if (ua.ie == 7) {
                this.element.style.width = "";
            }
        }
    }

    function onSubmenuShow(p_sType, p_sArgs) {
        var oElement,
            oShadow,
            oUL;

        if (this.parent) {
            oElement = this.element;
            oShadow = oElement.lastChild;
            oUL = this.body.getElementsByTagName("ul")[0];

            oAnim = new YAHOO.util.Anim(oUL, 
                { marginTop: { to: 0 } },
                .3, YAHOO.util.Easing.easeOut);

            oAnim.onStart.subscribe(function () {
                oShadow.style.height = "100%";
            });

            oAnim.animate();

            if (YAHOO.env.ua.ie) {
                oShadow.style.height = oElement.offsetHeight + "px";

                oAnim.onTween.subscribe(onTween, oShadow, this);
            }

            oAnim.onComplete.subscribe(onAnimationComplete, oShadow, this);
        }
    }

    oMenuBar.subscribe("beforeShow", onSubmenuBeforeShow);
    oMenuBar.subscribe("show", onSubmenuShow);
    oMenuBar.show();
});

$(document).ready (function () {

    $('.global-bar .noclick').live('click', function(event) {
        event.preventDefault();
        return false;
    });

    $('#globalbar-search-form-value').focus(function() { 
        if($(this).val() == $(this).attr('defaultValue')) {
            $(this).val('');
        }
    });

    $('#globalbar-search-form-value').blur(function() {
        if($(this).val() == '') {
            $(this).val($(this).attr('defaultValue'));
        }
    });

});$(document).ready (function () {

    if ($.cookie('melissa_display_name') && $.cookie('melissa_user_name') && $.cookie('melissa_avatar') && $.cookie('melissa_login')) {
        $.metadata.setType('html5');
        var data = $('body').metadata();
        // Set metadata back to class for older scripts using class
        $.metadata.setType('class');
        $.ajax({
            type: 'POST',
            url: '/carrot/themes/default/ajax/global.bar.php',
            data: {
                language: (data.language) ? data.language : '',
                template: (data.template) ? data.template : '',
                type: (data.type) ? data.type : '',
                uid: (data.uid) ? data.uid : '',
                name: (data.name) ? data.name : '',
                manufacturer: (data.manufacturer) ? data.manufacturer : ''
            },
            cache: false,
            success: function(html) {
                if(html != '') {
                    $('#global-bar').replaceWith(html);
                } else {
                    $('#globalbar-menu-login').show();
                    $('#globalbar-menu-signup').show();
                }
            },
            error: function() {
                $('#globalbar-menu-login').show();
                $('#globalbar-menu-signup').show();
            },
            complete: function() {
                $('#globalbar-menu-loading').hide();
            },
            dataType: 'html'
        });
    } else {
        $('#globalbar-menu-loading').hide();
        $('#globalbar-menu-login').show();
        $('#globalbar-menu-signup').show();
    }
});;(function($) {

/*
	Usage Note:
	-----------
	Do not use both ajaxSubmit and ajaxForm on the same form.  These
	functions are intended to be exclusive.  Use ajaxSubmit if you want
	to bind your own submit handler to the form.  For example,

	$(document).ready(function() {
		$('#myForm').bind('submit', function(e) {
			e.preventDefault(); // <-- important
			$(this).ajaxSubmit({
				target: '#output'
			});
		});
	});

	Use ajaxForm when you want the plugin to manage all the event binding
	for you.  For example,

	$(document).ready(function() {
		$('#myForm').ajaxForm({
			target: '#output'
		});
	});

	When using ajaxForm, the ajaxSubmit function will be invoked for you
	at the appropriate time.
*/

/**
 * ajaxSubmit() provides a mechanism for immediately submitting
 * an HTML form using AJAX.
 */
$.fn.ajaxSubmit = function(options) {
	// fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
	if (!this.length) {
		log('ajaxSubmit: skipping submit process - no element selected');
		return this;
	}

	if (typeof options == 'function') {
		options = { success: options };
	}

	var action = this.attr('action');
	var url = (typeof action === 'string') ? $.trim(action) : '';
	if (url) {
		// clean url (don't include hash vaue)
		url = (url.match(/^([^#]+)/)||[])[1];
	}
	url = url || window.location.href || '';

	options = $.extend(true, {
		url:  url,
		type: this[0].getAttribute('method') || 'GET', // IE7 massage (see issue 57)
		iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
	}, options);

	// hook for manipulating the form data before it is extracted;
	// convenient for use with rich editors like tinyMCE or FCKEditor
	var veto = {};
	this.trigger('form-pre-serialize', [this, options, veto]);
	if (veto.veto) {
		log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
		return this;
	}

	// provide opportunity to alter form data before it is serialized
	if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
		log('ajaxSubmit: submit aborted via beforeSerialize callback');
		return this;
	}

	var n,v,a = this.formToArray(options.semantic);
	if (options.data) {
		options.extraData = options.data;
		for (n in options.data) {
			if(options.data[n] instanceof Array) {
				for (var k in options.data[n]) {
					a.push( { name: n, value: options.data[n][k] } );
				}
			}
			else {
				v = options.data[n];
				v = $.isFunction(v) ? v() : v; // if value is fn, invoke it
				a.push( { name: n, value: v } );
			}
		}
	}

	// give pre-submit callback an opportunity to abort the submit
	if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
		log('ajaxSubmit: submit aborted via beforeSubmit callback');
		return this;
	}

	// fire vetoable 'validate' event
	this.trigger('form-submit-validate', [a, this, options, veto]);
	if (veto.veto) {
		log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
		return this;
	}

	var q = $.param(a);

	if (options.type.toUpperCase() == 'GET') {
		options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
		options.data = null;  // data is null for 'get'
	}
	else {
		options.data = q; // data is the query string for 'post'
	}

	var $form = this, callbacks = [];
	if (options.resetForm) {
		callbacks.push(function() { $form.resetForm(); });
	}
	if (options.clearForm) {
		callbacks.push(function() { $form.clearForm(); });
	}

	// perform a load on the target only if dataType is not provided
	if (!options.dataType && options.target) {
		var oldSuccess = options.success || function(){};
		callbacks.push(function(data) {
			var fn = options.replaceTarget ? 'replaceWith' : 'html';
			$(options.target)[fn](data).each(oldSuccess, arguments);
		});
	}
	else if (options.success) {
		callbacks.push(options.success);
	}

	options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
		var context = options.context || options;   // jQuery 1.4+ supports scope context 
		for (var i=0, max=callbacks.length; i < max; i++) {
			callbacks[i].apply(context, [data, status, xhr || $form, $form]);
		}
	};

	// are there files to upload?
	var fileInputs = $('input:file', this).length > 0;
	var mp = 'multipart/form-data';
	var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

	// options.iframe allows user to force iframe mode
	// 06-NOV-09: now defaulting to iframe mode if file input is detected
   if (options.iframe !== false && (fileInputs || options.iframe || multipart)) {
	   // hack to fix Safari hang (thanks to Tim Molendijk for this)
	   // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
	   if (options.closeKeepAlive) {
		   $.get(options.closeKeepAlive, fileUpload);
		}
	   else {
		   fileUpload();
		}
   }
   else {
		$.ajax(options);
   }

	// fire 'notify' event
	this.trigger('form-submit-notify', [this, options]);
	return this;


	// private function for handling file uploads (hat tip to YAHOO!)
	function fileUpload() {
		var form = $form[0];

		if ($(':input[name=submit],:input[id=submit]', form).length) {
			// if there is an input with a name or id of 'submit' then we won't be
			// able to invoke the submit fn on the form (at least not x-browser)
			alert('Error: Form elements must not have name or id of "submit".');
			return;
		}
		
		var s = $.extend(true, {}, $.ajaxSettings, options);
		s.context = s.context || s;
		var id = 'jqFormIO' + (new Date().getTime()), fn = '_'+id;
		var $io = $('<iframe id="' + id + '" name="' + id + '" src="'+ s.iframeSrc +'" />');
		var io = $io[0];

		$io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

		var xhr = { // mock object
			aborted: 0,
			responseText: null,
			responseXML: null,
			status: 0,
			statusText: 'n/a',
			getAllResponseHeaders: function() {},
			getResponseHeader: function() {},
			setRequestHeader: function() {},
			abort: function() {
				log('aborting upload...');
				var e = 'aborted';
				this.aborted = 1;
				$io.attr('src', s.iframeSrc); // abort op in progress
				xhr.error = e;
				s.error && s.error.call(s.context, xhr, 'error', e);
				g && $.event.trigger("ajaxError", [xhr, s, e]);
				s.complete && s.complete.call(s.context, xhr, 'error');
			}
		};

		var g = s.global;
		// trigger ajax global events so that activity/block indicators work like normal
		if (g && ! $.active++) {
			$.event.trigger("ajaxStart");
		}
		if (g) {
			$.event.trigger("ajaxSend", [xhr, s]);
		}

		if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
			if (s.global) { 
				$.active--;
			}
			return;
		}
		if (xhr.aborted) {
			return;
		}

		var timedOut = 0;

		// add submitting element to data if we know it
		var sub = form.clk;
		if (sub) {
			var n = sub.name;
			if (n && !sub.disabled) {
				s.extraData = s.extraData || {};
				s.extraData[n] = sub.value;
				if (sub.type == "image") {
					s.extraData[n+'.x'] = form.clk_x;
					s.extraData[n+'.y'] = form.clk_y;
				}
			}
		}

		// take a breath so that pending repaints get some cpu time before the upload starts
		function doSubmit() {
			// make sure form attrs are set
			var t = $form.attr('target'), a = $form.attr('action');

			// update form attrs in IE friendly way
			form.setAttribute('target',id);
			if (form.getAttribute('method') != 'POST') {
				form.setAttribute('method', 'POST');
			}
			if (form.getAttribute('action') != s.url) {
				form.setAttribute('action', s.url);
			}

			// ie borks in some cases when setting encoding
			if (! s.skipEncodingOverride) {
				$form.attr({
					encoding: 'multipart/form-data',
					enctype:  'multipart/form-data'
				});
			}

			// support timout
			if (s.timeout) {
				setTimeout(function() { timedOut = true; cb(); }, s.timeout);
			}

			// add "extra" data to form if provided in options
			var extraInputs = [];
			try {
				if (s.extraData) {
					for (var n in s.extraData) {
						extraInputs.push(
							$('<input type="hidden" name="'+n+'" value="'+s.extraData[n]+'" />')
								.appendTo(form)[0]);
					}
				}

				// add iframe to doc and submit the form
				$io.appendTo('body');
                io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
				form.submit();
			}
			finally {
				// reset attrs and remove "extra" input elements
				form.setAttribute('action',a);
				if(t) {
					form.setAttribute('target', t);
				} else {
					$form.removeAttr('target');
				}
				$(extraInputs).remove();
			}
		}

		if (s.forceSync) {
			doSubmit();
		}
		else {
			setTimeout(doSubmit, 10); // this lets dom updates render
		}
	
		var data, doc, domCheckCount = 50;

		function cb() {
			if (xhr.aborted) {
				return;
			}
			
			var doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
			if (!doc || doc.location.href == s.iframeSrc) {
				// response not received yet
				return;
			}
            io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);

			var ok = true;
			try {
				if (timedOut) {
					throw 'timeout';
				}

				var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
				log('isXml='+isXml);
				if (!isXml && window.opera && (doc.body == null || doc.body.innerHTML == '')) {
					if (--domCheckCount) {
						// in some browsers (Opera) the iframe DOM is not always traversable when
						// the onload callback fires, so we loop a bit to accommodate
						log('requeing onLoad callback, DOM not available');
						setTimeout(cb, 250);
						return;
					}
					// let this fall through because server response could be an empty document
					//log('Could not access iframe DOM after mutiple tries.');
					//throw 'DOMException: not available';
				}

				//log('response detected');
				xhr.responseText = doc.body ? doc.body.innerHTML : doc.documentElement ? doc.documentElement.innerHTML : null; 
				xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
				xhr.getResponseHeader = function(header){
					var headers = {'content-type': s.dataType};
					return headers[header];
				};

				var scr = /(json|script)/.test(s.dataType);
				if (scr || s.textarea) {
					// see if user embedded response in textarea
					var ta = doc.getElementsByTagName('textarea')[0];
					if (ta) {
						xhr.responseText = ta.value;
					}
					else if (scr) {
						// account for browsers injecting pre around json response
						var pre = doc.getElementsByTagName('pre')[0];
						var b = doc.getElementsByTagName('body')[0];
						if (pre) {
							xhr.responseText = pre.textContent;
						}
						else if (b) {
							xhr.responseText = b.innerHTML;
						}
					}			  
				}
				else if (s.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
					xhr.responseXML = toXml(xhr.responseText);
				}
				
				data = httpData(xhr, s.dataType, s);
			}
			catch(e){
				log('error caught:',e);
				ok = false;
				xhr.error = e;
				s.error && s.error.call(s.context, xhr, 'error', e);
				g && $.event.trigger("ajaxError", [xhr, s, e]);
			}
			
			if (xhr.aborted) {
				log('upload aborted');
				ok = false;
			}

			// ordering of these callbacks/triggers is odd, but that's how $.ajax does it
			if (ok) {
				s.success && s.success.call(s.context, data, 'success', xhr);
				g && $.event.trigger("ajaxSuccess", [xhr, s]);
			}
			
			g && $.event.trigger("ajaxComplete", [xhr, s]);

			if (g && ! --$.active) {
				$.event.trigger("ajaxStop");
			}
			
			s.complete && s.complete.call(s.context, xhr, ok ? 'success' : 'error');

			// clean up
			setTimeout(function() {
				$io.removeData('form-plugin-onload');
				$io.remove();
				xhr.responseXML = null;
			}, 100);
		}

		var toXml = $.parseXML || function(s, doc) { // use parseXML if available (jQuery 1.5+)
			if (window.ActiveXObject) {
				doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = 'false';
				doc.loadXML(s);
			}
			else {
				doc = (new DOMParser()).parseFromString(s, 'text/xml');
			}
			return (doc && doc.documentElement && doc.documentElement.nodeName != 'parsererror') ? doc : null;
		};
		var parseJSON = $.parseJSON || function(s) {
			return window['eval']('(' + s + ')');
		};
		
		var httpData = function( xhr, type, s ) { // mostly lifted from jq1.4.4
			var ct = xhr.getResponseHeader('content-type') || '',
				xml = type === 'xml' || !type && ct.indexOf('xml') >= 0,
				data = xml ? xhr.responseXML : xhr.responseText;

			if (xml && data.documentElement.nodeName === 'parsererror') {
				$.error && $.error('parsererror');
			}
			if (s && s.dataFilter) {
				data = s.dataFilter(data, type);
			}
			if (typeof data === 'string') {
				if (type === 'json' || !type && ct.indexOf('json') >= 0) {
					data = parseJSON(data);
				} else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
					$.globalEval(data);
				}
			}
			return data;
		};
	}
};

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of ajaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *	is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *	used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.
 */
$.fn.ajaxForm = function(options) {
	// in jQuery 1.3+ we can fix mistakes with the ready state
	if (this.length === 0) {
		var o = { s: this.selector, c: this.context };
		if (!$.isReady && o.s) {
			log('DOM not ready, queuing ajaxForm');
			$(function() {
				$(o.s,o.c).ajaxForm(options);
			});
			return this;
		}
		// is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
		log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
		return this;
	}
	
	return this.ajaxFormUnbind().bind('submit.form-plugin', function(e) {
		if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
			e.preventDefault();
			$(this).ajaxSubmit(options);
		}
	}).bind('click.form-plugin', function(e) {
		var target = e.target;
		var $el = $(target);
		if (!($el.is(":submit,input:image"))) {
			// is this a child element of the submit el?  (ex: a span within a button)
			var t = $el.closest(':submit');
			if (t.length == 0) {
				return;
			}
			target = t[0];
		}
		var form = this;
		form.clk = target;
		if (target.type == 'image') {
			if (e.offsetX != undefined) {
				form.clk_x = e.offsetX;
				form.clk_y = e.offsetY;
			} else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
				var offset = $el.offset();
				form.clk_x = e.pageX - offset.left;
				form.clk_y = e.pageY - offset.top;
			} else {
				form.clk_x = e.pageX - target.offsetLeft;
				form.clk_y = e.pageY - target.offsetTop;
			}
		}
		// clear form vars
		setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 100);
	});
};

// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
$.fn.ajaxFormUnbind = function() {
	return this.unbind('submit.form-plugin click.form-plugin');
};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 */
$.fn.formToArray = function(semantic) {
	var a = [];
	if (this.length === 0) {
		return a;
	}

	var form = this[0];
	var els = semantic ? form.getElementsByTagName('*') : form.elements;
	if (!els) {
		return a;
	}
	
	var i,j,n,v,el,max,jmax;
	for(i=0, max=els.length; i < max; i++) {
		el = els[i];
		n = el.name;
		if (!n) {
			continue;
		}

		if (semantic && form.clk && el.type == "image") {
			// handle image inputs on the fly when semantic == true
			if(!el.disabled && form.clk == el) {
				a.push({name: n, value: $(el).val()});
				a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
			}
			continue;
		}

		v = $.fieldValue(el, true);
		if (v && v.constructor == Array) {
			for(j=0, jmax=v.length; j < jmax; j++) {
				a.push({name: n, value: v[j]});
			}
		}
		else if (v !== null && typeof v != 'undefined') {
			a.push({name: n, value: v});
		}
	}

	if (!semantic && form.clk) {
		// input type=='image' are not found in elements array! handle it here
		var $input = $(form.clk), input = $input[0];
		n = input.name;
		if (n && !input.disabled && input.type == 'image') {
			a.push({name: n, value: $input.val()});
			a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
		}
	}
	return a;
};

/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 */
$.fn.formSerialize = function(semantic) {
	//hand off to jQuery.param for proper encoding
	return $.param(this.formToArray(semantic));
};

/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 */
$.fn.fieldSerialize = function(successful) {
	var a = [];
	this.each(function() {
		var n = this.name;
		if (!n) {
			return;
		}
		var v = $.fieldValue(this, successful);
		if (v && v.constructor == Array) {
			for (var i=0,max=v.length; i < max; i++) {
				a.push({name: n, value: v[i]});
			}
		}
		else if (v !== null && typeof v != 'undefined') {
			a.push({name: this.name, value: v});
		}
	});
	//hand off to jQuery.param for proper encoding
	return $.param(a);
};

/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *	  <input name="A" type="text" />
 *	  <input name="A" type="text" />
 *	  <input name="B" type="checkbox" value="B1" />
 *	  <input name="B" type="checkbox" value="B2"/>
 *	  <input name="C" type="radio" value="C1" />
 *	  <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $(':text').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $(':checkbox').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $(':radio').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *	   array will be empty, otherwise it will contain one or more values.
 */
$.fn.fieldValue = function(successful) {
	for (var val=[], i=0, max=this.length; i < max; i++) {
		var el = this[i];
		var v = $.fieldValue(el, successful);
		if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
			continue;
		}
		v.constructor == Array ? $.merge(val, v) : val.push(v);
	}
	return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
	var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
	if (successful === undefined) {
		successful = true;
	}

	if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
		(t == 'checkbox' || t == 'radio') && !el.checked ||
		(t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
		tag == 'select' && el.selectedIndex == -1)) {
			return null;
	}

	if (tag == 'select') {
		var index = el.selectedIndex;
		if (index < 0) {
			return null;
		}
		var a = [], ops = el.options;
		var one = (t == 'select-one');
		var max = (one ? index+1 : ops.length);
		for(var i=(one ? index : 0); i < max; i++) {
			var op = ops[i];
			if (op.selected) {
				var v = op.value;
				if (!v) { // extra pain for IE...
					v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
				}
				if (one) {
					return v;
				}
				a.push(v);
			}
		}
		return a;
	}
	return $(el).val();
};

/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 */
$.fn.clearForm = function() {
	return this.each(function() {
		$('input,select,textarea', this).clearFields();
	});
};

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function() {
	return this.each(function() {
		var t = this.type, tag = this.tagName.toLowerCase();
		if (t == 'text' || t == 'password' || tag == 'textarea') {
			this.value = '';
		}
		else if (t == 'checkbox' || t == 'radio') {
			this.checked = false;
		}
		else if (tag == 'select') {
			this.selectedIndex = -1;
		}
	});
};

/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 */
$.fn.resetForm = function() {
	return this.each(function() {
		// guard against an input with the name of 'reset'
		// note that IE reports the reset function as an 'object'
		if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
			this.reset();
		}
	});
};

/**
 * Enables or disables any matching elements.
 */
$.fn.enable = function(b) {
	if (b === undefined) {
		b = true;
	}
	return this.each(function() {
		this.disabled = !b;
	});
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 */
$.fn.selected = function(select) {
	if (select === undefined) {
		select = true;
	}
	return this.each(function() {
		var t = this.type;
		if (t == 'checkbox' || t == 'radio') {
			this.checked = select;
		}
		else if (this.tagName.toLowerCase() == 'option') {
			var $sel = $(this).parent('select');
			if (select && $sel[0] && $sel[0].type == 'select-one') {
				// deselect all other options
				$sel.find('option').selected(false);
			}
			this.selected = select;
		}
	});
};

// helper fn for console logging
// set $.fn.ajaxSubmit.debug to true to enable debug logging
function log() {
	if ($.fn.ajaxSubmit.debug) {
		var msg = '[jquery.form] ' + Array.prototype.join.call(arguments,'');
		if (window.console && window.console.log) {
			window.console.log(msg);
		}
		else if (window.opera && window.opera.postError) {
			window.opera.postError(msg);
		}
	}
};

})(jQuery);/**
 * jQuery Validation Plugin 1.8.0
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2011 Jorn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function(c){c.extend(c.fn,{validate:function(a){if(this.length){var b=c.data(this[0],"validator");if(b)return b;b=new c.validator(a,this[0]);c.data(this[0],"validator",b);if(b.settings.onsubmit){this.find("input, button").filter(".cancel").click(function(){b.cancelSubmit=true});b.settings.submitHandler&&this.find("input, button").filter(":submit").click(function(){b.submitButton=this});this.submit(function(d){function e(){if(b.settings.submitHandler){if(b.submitButton)var f=c("<input type='hidden'/>").attr("name",
b.submitButton.name).val(b.submitButton.value).appendTo(b.currentForm);b.settings.submitHandler.call(b,b.currentForm);b.submitButton&&f.remove();return false}return true}b.settings.debug&&d.preventDefault();if(b.cancelSubmit){b.cancelSubmit=false;return e()}if(b.form()){if(b.pendingRequest){b.formSubmitted=true;return false}return e()}else{b.focusInvalid();return false}})}return b}else a&&a.debug&&window.console&&console.warn("nothing selected, can't validate, returning nothing")},valid:function(){if(c(this[0]).is("form"))return this.validate().form();
else{var a=true,b=c(this[0].form).validate();this.each(function(){a&=b.element(this)});return a}},removeAttrs:function(a){var b={},d=this;c.each(a.split(/\s/),function(e,f){b[f]=d.attr(f);d.removeAttr(f)});return b},rules:function(a,b){var d=this[0];if(a){var e=c.data(d.form,"validator").settings,f=e.rules,g=c.validator.staticRules(d);switch(a){case "add":c.extend(g,c.validator.normalizeRule(b));f[d.name]=g;if(b.messages)e.messages[d.name]=c.extend(e.messages[d.name],b.messages);break;case "remove":if(!b){delete f[d.name];
return g}var h={};c.each(b.split(/\s/),function(j,i){h[i]=g[i];delete g[i]});return h}}d=c.validator.normalizeRules(c.extend({},c.validator.metadataRules(d),c.validator.classRules(d),c.validator.attributeRules(d),c.validator.staticRules(d)),d);if(d.required){e=d.required;delete d.required;d=c.extend({required:e},d)}return d}});c.extend(c.expr[":"],{blank:function(a){return!c.trim(""+a.value)},filled:function(a){return!!c.trim(""+a.value)},unchecked:function(a){return!a.checked}});c.validator=function(a,
b){this.settings=c.extend(true,{},c.validator.defaults,a);this.currentForm=b;this.init()};c.validator.format=function(a,b){if(arguments.length==1)return function(){var d=c.makeArray(arguments);d.unshift(a);return c.validator.format.apply(this,d)};if(arguments.length>2&&b.constructor!=Array)b=c.makeArray(arguments).slice(1);if(b.constructor!=Array)b=[b];c.each(b,function(d,e){a=a.replace(RegExp("\\{"+d+"\\}","g"),e)});return a};c.extend(c.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",
validClass:"valid",errorElement:"label",focusInvalid:true,errorContainer:c([]),errorLabelContainer:c([]),onsubmit:true,ignore:[],ignoreTitle:false,onfocusin:function(a){this.lastActive=a;if(this.settings.focusCleanup&&!this.blockFocusCleanup){this.settings.unhighlight&&this.settings.unhighlight.call(this,a,this.settings.errorClass,this.settings.validClass);this.addWrapper(this.errorsFor(a)).hide()}},onfocusout:function(a){if(!this.checkable(a)&&(a.name in this.submitted||!this.optional(a)))this.element(a)},
onkeyup:function(a){if(a.name in this.submitted||a==this.lastElement)this.element(a)},onclick:function(a){if(a.name in this.submitted)this.element(a);else a.parentNode.name in this.submitted&&this.element(a.parentNode)},highlight:function(a,b,d){c(a).addClass(b).removeClass(d)},unhighlight:function(a,b,d){c(a).removeClass(b).addClass(d)}},setDefaults:function(a){c.extend(c.validator.defaults,a)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",
url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",accept:"Please enter a value with a valid extension.",maxlength:c.validator.format("Please enter no more than {0} characters."),minlength:c.validator.format("Please enter at least {0} characters."),rangelength:c.validator.format("Please enter a value between {0} and {1} characters long."),
range:c.validator.format("Please enter a value between {0} and {1}."),max:c.validator.format("Please enter a value less than or equal to {0}."),min:c.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:false,prototype:{init:function(){function a(e){var f=c.data(this[0].form,"validator");e="on"+e.type.replace(/^validate/,"");f.settings[e]&&f.settings[e].call(f,this[0])}this.labelContainer=c(this.settings.errorLabelContainer);this.errorContext=this.labelContainer.length&&
this.labelContainer||c(this.currentForm);this.containers=c(this.settings.errorContainer).add(this.settings.errorLabelContainer);this.submitted={};this.valueCache={};this.pendingRequest=0;this.pending={};this.invalid={};this.reset();var b=this.groups={};c.each(this.settings.groups,function(e,f){c.each(f.split(/\s/),function(g,h){b[h]=e})});var d=this.settings.rules;c.each(d,function(e,f){d[e]=c.validator.normalizeRule(f)});c(this.currentForm).validateDelegate(":text, :password, :file, select, textarea",
"focusin focusout keyup",a).validateDelegate(":radio, :checkbox, select, option","click",a);this.settings.invalidHandler&&c(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler)},form:function(){this.checkForm();c.extend(this.submitted,this.errorMap);this.invalid=c.extend({},this.errorMap);this.valid()||c(this.currentForm).triggerHandler("invalid-form",[this]);this.showErrors();return this.valid()},checkForm:function(){this.prepareForm();for(var a=0,b=this.currentElements=this.elements();b[a];a++)this.check(b[a]);
return this.valid()},element:function(a){this.lastElement=a=this.clean(a);this.prepareElement(a);this.currentElements=c(a);var b=this.check(a);if(b)delete this.invalid[a.name];else this.invalid[a.name]=true;if(!this.numberOfInvalids())this.toHide=this.toHide.add(this.containers);this.showErrors();return b},showErrors:function(a){if(a){c.extend(this.errorMap,a);this.errorList=[];for(var b in a)this.errorList.push({message:a[b],element:this.findByName(b)[0]});this.successList=c.grep(this.successList,
function(d){return!(d.name in a)})}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){c.fn.resetForm&&c(this.currentForm).resetForm();this.submitted={};this.prepareForm();this.hideErrors();this.elements().removeClass(this.settings.errorClass)},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(a){var b=0,d;for(d in a)b++;return b},hideErrors:function(){this.addWrapper(this.toHide).hide()},
valid:function(){return this.size()==0},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{c(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(a){}},findLastActive:function(){var a=this.lastActive;return a&&c.grep(this.errorList,function(b){return b.element.name==a.name}).length==1&&a},elements:function(){var a=this,b={};return c([]).add(this.currentForm.elements).filter(":input").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){!this.name&&
a.settings.debug&&window.console&&console.error("%o has no name assigned",this);if(this.name in b||!a.objectLength(c(this).rules()))return false;return b[this.name]=true})},clean:function(a){return c(a)[0]},errors:function(){return c(this.settings.errorElement+"."+this.settings.errorClass,this.errorContext)},reset:function(){this.successList=[];this.errorList=[];this.errorMap={};this.toShow=c([]);this.toHide=c([]);this.currentElements=c([])},prepareForm:function(){this.reset();this.toHide=this.errors().add(this.containers)},
prepareElement:function(a){this.reset();this.toHide=this.errorsFor(a)},check:function(a){a=this.clean(a);if(this.checkable(a))a=this.findByName(a.name).not(this.settings.ignore)[0];var b=c(a).rules(),d=false,e;for(e in b){var f={method:e,parameters:b[e]};try{var g=c.validator.methods[e].call(this,a.value.replace(/\r/g,""),a,f.parameters);if(g=="dependency-mismatch")d=true;else{d=false;if(g=="pending"){this.toHide=this.toHide.not(this.errorsFor(a));return}if(!g){this.formatAndAdd(a,f);return false}}}catch(h){this.settings.debug&&
window.console&&console.log("exception occured when checking element "+a.id+", check the '"+f.method+"' method",h);throw h;}}if(!d){this.objectLength(b)&&this.successList.push(a);return true}},customMetaMessage:function(a,b){if(c.metadata){var d=this.settings.meta?c(a).metadata()[this.settings.meta]:c(a).metadata();return d&&d.messages&&d.messages[b]}},customMessage:function(a,b){var d=this.settings.messages[a];return d&&(d.constructor==String?d:d[b])},findDefined:function(){for(var a=0;a<arguments.length;a++)if(arguments[a]!==
undefined)return arguments[a]},defaultMessage:function(a,b){return this.findDefined(this.customMessage(a.name,b),this.customMetaMessage(a,b),!this.settings.ignoreTitle&&a.title||undefined,c.validator.messages[b],"<strong>Warning: No message defined for "+a.name+"</strong>")},formatAndAdd:function(a,b){var d=this.defaultMessage(a,b.method),e=/\$?\{(\d+)\}/g;if(typeof d=="function")d=d.call(this,b.parameters,a);else if(e.test(d))d=jQuery.format(d.replace(e,"{$1}"),b.parameters);this.errorList.push({message:d,
element:a});this.errorMap[a.name]=d;this.submitted[a.name]=d},addWrapper:function(a){if(this.settings.wrapper)a=a.add(a.parent(this.settings.wrapper));return a},defaultShowErrors:function(){for(var a=0;this.errorList[a];a++){var b=this.errorList[a];this.settings.highlight&&this.settings.highlight.call(this,b.element,this.settings.errorClass,this.settings.validClass);this.showLabel(b.element,b.message)}if(this.errorList.length)this.toShow=this.toShow.add(this.containers);if(this.settings.success)for(a=
0;this.successList[a];a++)this.showLabel(this.successList[a]);if(this.settings.unhighlight){a=0;for(b=this.validElements();b[a];a++)this.settings.unhighlight.call(this,b[a],this.settings.errorClass,this.settings.validClass)}this.toHide=this.toHide.not(this.toShow);this.hideErrors();this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return c(this.errorList).map(function(){return this.element})},showLabel:function(a,
b){var d=this.errorsFor(a);if(d.length){d.removeClass().addClass(this.settings.errorClass);d.attr("generated")&&d.html(b)}else{d=c("<"+this.settings.errorElement+"/>").attr({"for":this.idOrName(a),generated:true}).addClass(this.settings.errorClass).html(b||"");if(this.settings.wrapper)d=d.hide().show().wrap("<"+this.settings.wrapper+"/>").parent();this.labelContainer.append(d).length||(this.settings.errorPlacement?this.settings.errorPlacement(d,c(a)):d.insertAfter(a))}if(!b&&this.settings.success){d.text("");
typeof this.settings.success=="string"?d.addClass(this.settings.success):this.settings.success(d)}this.toShow=this.toShow.add(d)},errorsFor:function(a){var b=this.idOrName(a);return this.errors().filter(function(){return c(this).attr("for")==b})},idOrName:function(a){return this.groups[a.name]||(this.checkable(a)?a.name:a.id||a.name)},checkable:function(a){return/radio|checkbox/i.test(a.type)},findByName:function(a){var b=this.currentForm;return c(document.getElementsByName(a)).map(function(d,e){return e.form==
b&&e.name==a&&e||null})},getLength:function(a,b){switch(b.nodeName.toLowerCase()){case "select":return c("option:selected",b).length;case "input":if(this.checkable(b))return this.findByName(b.name).filter(":checked").length}return a.length},depend:function(a,b){return this.dependTypes[typeof a]?this.dependTypes[typeof a](a,b):true},dependTypes:{"boolean":function(a){return a},string:function(a,b){return!!c(a,b.form).length},"function":function(a,b){return a(b)}},optional:function(a){return!c.validator.methods.required.call(this,
c.trim(a.value),a)&&"dependency-mismatch"},startRequest:function(a){if(!this.pending[a.name]){this.pendingRequest++;this.pending[a.name]=true}},stopRequest:function(a,b){this.pendingRequest--;if(this.pendingRequest<0)this.pendingRequest=0;delete this.pending[a.name];if(b&&this.pendingRequest==0&&this.formSubmitted&&this.form()){c(this.currentForm).submit();this.formSubmitted=false}else if(!b&&this.pendingRequest==0&&this.formSubmitted){c(this.currentForm).triggerHandler("invalid-form",[this]);this.formSubmitted=
false}},previousValue:function(a){return c.data(a,"previousValue")||c.data(a,"previousValue",{old:null,valid:true,message:this.defaultMessage(a,"remote")})}},classRuleSettings:{required:{required:true},email:{email:true},url:{url:true},date:{date:true},dateISO:{dateISO:true},dateDE:{dateDE:true},number:{number:true},numberDE:{numberDE:true},digits:{digits:true},creditcard:{creditcard:true}},addClassRules:function(a,b){a.constructor==String?this.classRuleSettings[a]=b:c.extend(this.classRuleSettings,
a)},classRules:function(a){var b={};(a=c(a).attr("class"))&&c.each(a.split(" "),function(){this in c.validator.classRuleSettings&&c.extend(b,c.validator.classRuleSettings[this])});return b},attributeRules:function(a){var b={};a=c(a);for(var d in c.validator.methods){var e=a.attr(d);if(e)b[d]=e}b.maxlength&&/-1|2147483647|524288/.test(b.maxlength)&&delete b.maxlength;return b},metadataRules:function(a){if(!c.metadata)return{};var b=c.data(a.form,"validator").settings.meta;return b?c(a).metadata()[b]:
c(a).metadata()},staticRules:function(a){var b={},d=c.data(a.form,"validator");if(d.settings.rules)b=c.validator.normalizeRule(d.settings.rules[a.name])||{};return b},normalizeRules:function(a,b){c.each(a,function(d,e){if(e===false)delete a[d];else if(e.param||e.depends){var f=true;switch(typeof e.depends){case "string":f=!!c(e.depends,b.form).length;break;case "function":f=e.depends.call(b,b)}if(f)a[d]=e.param!==undefined?e.param:true;else delete a[d]}});c.each(a,function(d,e){a[d]=c.isFunction(e)?
e(b):e});c.each(["minlength","maxlength","min","max"],function(){if(a[this])a[this]=Number(a[this])});c.each(["rangelength","range"],function(){if(a[this])a[this]=[Number(a[this][0]),Number(a[this][1])]});if(c.validator.autoCreateRanges){if(a.min&&a.max){a.range=[a.min,a.max];delete a.min;delete a.max}if(a.minlength&&a.maxlength){a.rangelength=[a.minlength,a.maxlength];delete a.minlength;delete a.maxlength}}a.messages&&delete a.messages;return a},normalizeRule:function(a){if(typeof a=="string"){var b=
{};c.each(a.split(/\s/),function(){b[this]=true});a=b}return a},addMethod:function(a,b,d){c.validator.methods[a]=b;c.validator.messages[a]=d!=undefined?d:c.validator.messages[a];b.length<3&&c.validator.addClassRules(a,c.validator.normalizeRule(a))},methods:{required:function(a,b,d){if(!this.depend(d,b))return"dependency-mismatch";switch(b.nodeName.toLowerCase()){case "select":return(a=c(b).val())&&a.length>0;case "input":if(this.checkable(b))return this.getLength(a,b)>0;default:return c.trim(a).length>
0}},remote:function(a,b,d){if(this.optional(b))return"dependency-mismatch";var e=this.previousValue(b);this.settings.messages[b.name]||(this.settings.messages[b.name]={});e.originalMessage=this.settings.messages[b.name].remote;this.settings.messages[b.name].remote=e.message;d=typeof d=="string"&&{url:d}||d;if(this.pending[b.name])return"pending";if(e.old===a)return e.valid;e.old=a;var f=this;this.startRequest(b);var g={};g[b.name]=a;c.ajax(c.extend(true,{url:d,mode:"abort",port:"validate"+b.name,
dataType:"json",data:g,success:function(h){f.settings.messages[b.name].remote=e.originalMessage;var j=h===true;if(j){var i=f.formSubmitted;f.prepareElement(b);f.formSubmitted=i;f.successList.push(b);f.showErrors()}else{i={};h=h||f.defaultMessage(b,"remote");i[b.name]=e.message=c.isFunction(h)?h(a):h;f.showErrors(i)}e.valid=j;f.stopRequest(b,j)}},d));return"pending"},minlength:function(a,b,d){return this.optional(b)||this.getLength(c.trim(a),b)>=d},maxlength:function(a,b,d){return this.optional(b)||
this.getLength(c.trim(a),b)<=d},rangelength:function(a,b,d){a=this.getLength(c.trim(a),b);return this.optional(b)||a>=d[0]&&a<=d[1]},min:function(a,b,d){return this.optional(b)||a>=d},max:function(a,b,d){return this.optional(b)||a<=d},range:function(a,b,d){return this.optional(b)||a>=d[0]&&a<=d[1]},email:function(a,b){return this.optional(b)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(a)},
url:function(a,b){return this.optional(b)||/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(a)},
date:function(a,b){return this.optional(b)||!/Invalid|NaN/.test(new Date(a))},dateISO:function(a,b){return this.optional(b)||/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(a)},number:function(a,b){return this.optional(b)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(a)},digits:function(a,b){return this.optional(b)||/^\d+$/.test(a)},creditcard:function(a,b){if(this.optional(b))return"dependency-mismatch";if(/[^0-9-]+/.test(a))return false;var d=0,e=0,f=false;a=a.replace(/\D/g,"");for(var g=a.length-1;g>=
0;g--){e=a.charAt(g);e=parseInt(e,10);if(f)if((e*=2)>9)e-=9;d+=e;f=!f}return d%10==0},accept:function(a,b,d){d=typeof d=="string"?d.replace(/,/g,"|"):"png|jpe?g|gif";return this.optional(b)||a.match(RegExp(".("+d+")$","i"))},equalTo:function(a,b,d){d=c(d).unbind(".validate-equalTo").bind("blur.validate-equalTo",function(){c(b).valid()});return a==d.val()}}});c.format=c.validator.format})(jQuery);
(function(c){var a={};if(c.ajaxPrefilter)c.ajaxPrefilter(function(d,e,f){e=d.port;if(d.mode=="abort"){a[e]&&a[e].abort();a[e]=f}});else{var b=c.ajax;c.ajax=function(d){var e=("port"in d?d:c.ajaxSettings).port;if(("mode"in d?d:c.ajaxSettings).mode=="abort"){a[e]&&a[e].abort();return a[e]=b.apply(this,arguments)}return b.apply(this,arguments)}}})(jQuery);
(function(c){!jQuery.event.special.focusin&&!jQuery.event.special.focusout&&document.addEventListener&&c.each({focus:"focusin",blur:"focusout"},function(a,b){function d(e){e=c.event.fix(e);e.type=b;return c.event.handle.call(this,e)}c.event.special[b]={setup:function(){this.addEventListener(a,d,true)},teardown:function(){this.removeEventListener(a,d,true)},handler:function(e){arguments[0]=c.event.fix(e);arguments[0].type=b;return c.event.handle.apply(this,arguments)}}});c.extend(c.fn,{validateDelegate:function(a,
b,d){return this.bind(b,function(e){var f=c(e.target);if(f.is(a))return d.apply(f,arguments)})}})})(jQuery);
// ----------------------------------------------------------------------------
// markItUp! Universal MarkUp Engine, JQuery plugin
// v 1.1.x
// Dual licensed under the MIT and GPL licenses.
// ----------------------------------------------------------------------------
// Copyright (C) 2007-2010 Jay Salvat
// http://markitup.jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------
(function($) {
	$.fn.markItUp = function(settings, extraSettings) {
		var options, ctrlKey, shiftKey, altKey;
		ctrlKey = shiftKey = altKey = false;
	
		options = {	id:						'',
					nameSpace:				'',
					root:					'',
					previewInWindow:		'', // 'width=800, height=600, resizable=yes, scrollbars=yes'
					previewAutoRefresh:		true,
					previewPosition:		'after',
					previewTemplatePath:	'~/templates/preview.html',
					previewParserPath:		'',
					previewParserVar:		'data',
					resizeHandle:			true,
					beforeInsert:			'',
					afterInsert:			'',
					onEnter:				{},
					onShiftEnter:			{},
					onCtrlEnter:			{},
					onTab:					{},
					markupSet:			[	{ /* set */ } ]
				};
		$.extend(options, settings, extraSettings);

		// compute markItUp! path
		if (!options.root) {
			$('script').each(function(a, tag) {
				miuScript = $(tag).get(0).src.match(/(.*)jquery\.markitup(\.pack)?\.js$/);
				if (miuScript !== null) {
					options.root = miuScript[1];
				}
			});
		}

		return this.each(function() {
			var $$, textarea, levels, scrollPosition, caretPosition, caretOffset,
				clicked, hash, header, footer, previewWindow, template, iFrame, abort;
			$$ = $(this);
			textarea = this;
			levels = [];
			abort = false;
			scrollPosition = caretPosition = 0;
			caretOffset = -1;

			options.previewParserPath = localize(options.previewParserPath);
			options.previewTemplatePath = localize(options.previewTemplatePath);

			// apply the computed path to ~/
			function localize(data, inText) {
				if (inText) {
					return 	data.replace(/("|')~\//g, "$1"+options.root);
				}
				return 	data.replace(/^~\//, options.root);
			}

			// init and build editor
			function init() {
				id = ''; nameSpace = '';
				if (options.id) {
					id = 'id="'+options.id+'"';
				} else if ($$.attr("id")) {
					id = 'id="markItUp'+($$.attr("id").substr(0, 1).toUpperCase())+($$.attr("id").substr(1))+'"';

				}
				if (options.nameSpace) {
					nameSpace = 'class="'+options.nameSpace+'"';
				}
				$$.wrap('<div '+nameSpace+'></div>');
				$$.wrap('<div '+id+' class="markItUp"></div>');
				$$.wrap('<div class="markItUpContainer"></div>');
				$$.addClass("markItUpEditor");

				// add the header before the textarea
				header = $('<div class="markItUpHeader"></div>').insertBefore($$);
				$(dropMenus(options.markupSet)).appendTo(header);

				// add the footer after the textarea
				footer = $('<div class="markItUpFooter"></div>').insertAfter($$);

				// add the resize handle after textarea
				if (options.resizeHandle === true && $.browser.safari !== true) {
					resizeHandle = $('<div class="markItUpResizeHandle"></div>')
						.insertAfter($$)
						.bind("mousedown", function(e) {
							var h = $$.height(), y = e.clientY, mouseMove, mouseUp;
							mouseMove = function(e) {
								$$.css("height", Math.max(20, e.clientY+h-y)+"px");
								return false;
							};
							mouseUp = function(e) {
								$("html").unbind("mousemove", mouseMove).unbind("mouseup", mouseUp);
								return false;
							};
							$("html").bind("mousemove", mouseMove).bind("mouseup", mouseUp);
					});
					footer.append(resizeHandle);
				}

				// listen key events
				$$.keydown(keyPressed).keyup(keyPressed);
				
				// bind an event to catch external calls
				$$.bind("insertion", function(e, settings) {
					if (settings.target !== false) {
						get();
					}
					if (textarea === $.markItUp.focused) {
						markup(settings);
					}
				});

				// remember the last focus
				$$.focus(function() {
					$.markItUp.focused = this;
				});
			}

			// recursively build header with dropMenus from markupset
			function dropMenus(markupSet) {
				var ul = $('<ul></ul>'), i = 0;
				$('li:hover > ul', ul).css('display', 'block');
				$.each(markupSet, function() {
					var button = this, t = '', title, li, j;
					title = (button.key) ? (button.name||'')+' [Ctrl+'+button.key+']' : (button.name||'');
					key   = (button.key) ? 'accesskey="'+button.key+'"' : '';
					if (button.separator) {
						li = $('<li class="markItUpSeparator">'+(button.separator||'')+'</li>').appendTo(ul);
					} else {
						i++;
						for (j = levels.length -1; j >= 0; j--) {
							t += levels[j]+"-";
						}
						li = $('<li class="markItUpButton markItUpButton'+t+(i)+' '+(button.className||'')+'"><a href="" '+key+' title="'+title+'">'+(button.name||'')+'</a></li>')
						.bind("contextmenu", function() { // prevent contextmenu on mac and allow ctrl+click
							return false;
						}).click(function() {
							return false;
						}).bind("focusin", function(){
                            $$.focus();
						}).mousedown(function() {
							if (button.call) {
								eval(button.call)();
							}
							setTimeout(function() { markup(button) },1);
							return false;
						}).hover(function() {
								$('> ul', this).show();
								$(document).one('click', function() { // close dropmenu if click outside
										$('ul ul', header).hide();
									}
								);
							}, function() {
								$('> ul', this).hide();
							}
						).appendTo(ul);
						if (button.dropMenu) {
							levels.push(i);
							$(li).addClass('markItUpDropMenu').append(dropMenus(button.dropMenu));
						}
					}
				}); 
				levels.pop();
				return ul;
			}

			// markItUp! markups
			function magicMarkups(string) {
				if (string) {
					string = string.toString();
					string = string.replace(/\(\!\(([\s\S]*?)\)\!\)/g,
						function(x, a) {
							var b = a.split('|!|');
							if (altKey === true) {
								return (b[1] !== undefined) ? b[1] : b[0];
							} else {
								return (b[1] === undefined) ? "" : b[0];
							}
						}
					);
					// [![prompt]!], [![prompt:!:value]!]
					string = string.replace(/\[\!\[([\s\S]*?)\]\!\]/g,
						function(x, a) {
							var b = a.split(':!:');
							if (abort === true) {
								return false;
							}
							value = prompt(b[0], (b[1]) ? b[1] : '');
							if (value === null) {
								abort = true;
							}
							return value;
						}
					);
					return string;
				}
				return "";
			}

			// prepare action
			function prepare(action) {
				if ($.isFunction(action)) {
					action = action(hash);
				}
				return magicMarkups(action);
			}

			// build block to insert
			function build(string) {
				var openWith 	= prepare(clicked.openWith);
				var placeHolder = prepare(clicked.placeHolder);
				var replaceWith = prepare(clicked.replaceWith);
				var closeWith 	= prepare(clicked.closeWith);
				if (replaceWith !== "") {
					block = openWith + replaceWith + closeWith;
				} else if (selection === '' && placeHolder !== '') {
					block = openWith + placeHolder + closeWith;
				} else {
					string = string || selection;						
					if (string.match(/ $/)) {
						block = openWith + string.replace(/ $/, '') + closeWith + ' ';
					} else {
						block = openWith + string + closeWith;
					}
				}
				return {	block:block, 
							openWith:openWith, 
							replaceWith:replaceWith, 
							placeHolder:placeHolder,
							closeWith:closeWith
					};
			}

			// define markup to insert
			function markup(button) {
				var len, j, n, i;
				hash = clicked = button;
				get();

				$.extend(hash, {	line:"", 
						 			root:options.root,
									textarea:textarea, 
									selection:(selection||''), 
									caretPosition:caretPosition,
									ctrlKey:ctrlKey, 
									shiftKey:shiftKey, 
									altKey:altKey
								}
							);
				// callbacks before insertion
				prepare(options.beforeInsert);
				prepare(clicked.beforeInsert);
				if (ctrlKey === true && shiftKey === true) {
					prepare(clicked.beforeMultiInsert);
				}			
				$.extend(hash, { line:1 });
				
				if (ctrlKey === true && shiftKey === true) {
					lines = selection.split(/\r?\n/);
					for (j = 0, n = lines.length, i = 0; i < n; i++) {
						if ($.trim(lines[i]) !== '') {
							$.extend(hash, { line:++j, selection:lines[i] } );
							lines[i] = build(lines[i]).block;
						} else {
							lines[i] = "";
						}
					}
					string = { block:lines.join('\n')};
					start = caretPosition;
					len = string.block.length + (($.browser.opera) ? n-1 : 0);
				} else if (ctrlKey === true) {
					string = build(selection);
					start = caretPosition + string.openWith.length;
					len = string.block.length - string.openWith.length - string.closeWith.length;
					len = len - (string.block.match(/ $/) ? 1 : 0);
					len -= fixIeBug(string.block);
				} else if (shiftKey === true) {
					string = build(selection);
					start = caretPosition;
					len = string.block.length;
					len -= fixIeBug(string.block);
				} else {
					string = build(selection);
					start = caretPosition + string.block.length ;
					len = 0;
					start -= fixIeBug(string.block);
				}
				if ((selection === '' && string.replaceWith === '')) {
					caretOffset += fixOperaBug(string.block);
					
					start = caretPosition + string.openWith.length;
					len = string.block.length - string.openWith.length - string.closeWith.length;

					caretOffset = $$.val().substring(caretPosition,  $$.val().length).length;
					caretOffset -= fixOperaBug($$.val().substring(0, caretPosition));
				}
				$.extend(hash, { caretPosition:caretPosition, scrollPosition:scrollPosition } );

				if (string.block !== selection && abort === false) {
					insert(string.block);
					set(start, len);
				} else {
					caretOffset = -1;
				}
				get();

				$.extend(hash, { line:'', selection:selection });

				// callbacks after insertion
				if (ctrlKey === true && shiftKey === true) {
					prepare(clicked.afterMultiInsert);
				}
				prepare(clicked.afterInsert);
				prepare(options.afterInsert);

				// refresh preview if opened
				if (previewWindow && options.previewAutoRefresh) {
					refreshPreview(); 
				}
																									
				// reinit keyevent
				shiftKey = altKey = ctrlKey = abort = false;
			}

			// Substract linefeed in Opera
			function fixOperaBug(string) {
				if ($.browser.opera) {
					return string.length - string.replace(/\n*/g, '').length;
				}
				return 0;
			}
			// Substract linefeed in IE
			function fixIeBug(string) {
				if ($.browser.msie) {
					return string.length - string.replace(/\r/g, '').length;
				}
				return 0;
			}
				
			// add markup
			function insert(block) {	
				if (document.selection) {
					var newSelection = document.selection.createRange();
					newSelection.text = block;
				} else {
					textarea.value =  textarea.value.substring(0, caretPosition)  + block + textarea.value.substring(caretPosition + selection.length, textarea.value.length);
				}
			}

			// set a selection
			function set(start, len) {
				if (textarea.createTextRange){
					// quick fix to make it work on Opera 9.5
					if ($.browser.opera && $.browser.version >= 9.5 && len == 0) {
						return false;
					}
					range = textarea.createTextRange();
					range.collapse(true);
					range.moveStart('character', start); 
					range.moveEnd('character', len); 
					range.select();
				} else if (textarea.setSelectionRange ){
					textarea.setSelectionRange(start, start + len);
				}
				textarea.scrollTop = scrollPosition;
				textarea.focus();
			}

			// get the selection
			function get() {
				textarea.focus();

				scrollPosition = textarea.scrollTop;
				if (document.selection) {
					selection = document.selection;	
					if ($.browser.msie) { // ie	
						var range = selection.createRange();
						var stored_range = range.duplicate();
						stored_range.moveToElementText(textarea);
						stored_range.setEndPoint('EndToEnd', range);
						var s = stored_range.text.length - range.text.length;
	
						caretPosition = s - (textarea.value.substr(0, s).length - textarea.value.substr(0, s).replace(/\r/g, '').length);
						selection = range.text;
					} else { // opera
						caretPosition = textarea.selectionStart;
					}
				} else { // gecko & webkit
					caretPosition = textarea.selectionStart;
					selection = textarea.value.substring(caretPosition, textarea.selectionEnd);
				} 
				return selection;
			}

			// open preview window
			function preview() {
				if (!previewWindow || previewWindow.closed) {
					if (options.previewInWindow) {
						previewWindow = window.open('', 'preview', options.previewInWindow);
						$(window).unload(function() {
							previewWindow.close();
						});
					} else {
						iFrame = $('<iframe class="markItUpPreviewFrame"></iframe>');
						if (options.previewPosition == 'after') {
							iFrame.insertAfter(footer);
						} else {
							iFrame.insertBefore(header);
						}	
						previewWindow = iFrame[iFrame.length - 1].contentWindow || frame[iFrame.length - 1];
					}
				} else if (altKey === true) {
					if (iFrame) {
						iFrame.remove();
					} else {
						previewWindow.close();
					}
					previewWindow = iFrame = false;
				}
				if (!options.previewAutoRefresh) {
					refreshPreview(); 
				}
				if (options.previewInWindow) {
					previewWindow.focus();
				}
			}

			// refresh Preview window
			function refreshPreview() {
 				renderPreview();
			}

			function renderPreview() {		
				var phtml;
				if (options.previewParserPath !== '') {
					$.ajax({
						type: 'POST',
						dataType: 'text',
						global: false,
						url: options.previewParserPath,
						data: options.previewParserVar+'='+encodeURIComponent($$.val()),
						success: function(data) {
							writeInPreview( localize(data, 1) ); 
						}
					});
				} else {
					if (!template) {
						$.ajax({
							url: options.previewTemplatePath,
							dataType: 'text',
							global: false,
							success: function(data) {
								writeInPreview( localize(data, 1).replace(/<!-- content -->/g, $$.val()) );
							}
						});
					}
				}
				return false;
			}
			
			function writeInPreview(data) {
				if (previewWindow.document) {			
					try {
						sp = previewWindow.document.documentElement.scrollTop
					} catch(e) {
						sp = 0;
					}	
					previewWindow.document.open();
					previewWindow.document.write(data);
					previewWindow.document.close();
					previewWindow.document.documentElement.scrollTop = sp;
				}
			}
			
			// set keys pressed
			function keyPressed(e) { 
				shiftKey = e.shiftKey;
				altKey = e.altKey;
				ctrlKey = (!(e.altKey && e.ctrlKey)) ? e.ctrlKey : false;

				if (e.type === 'keydown') {
					if (ctrlKey === true) {
						li = $("a[accesskey="+String.fromCharCode(e.keyCode)+"]", header).parent('li');
						if (li.length !== 0) {
							ctrlKey = false;
							setTimeout(function() {
								li.triggerHandler('mousedown');
							},1);
							return false;
						}
					}
					if (e.keyCode === 13 || e.keyCode === 10) { // Enter key
						if (ctrlKey === true) {  // Enter + Ctrl
							ctrlKey = false;
							markup(options.onCtrlEnter);
							return options.onCtrlEnter.keepDefault;
						} else if (shiftKey === true) { // Enter + Shift
							shiftKey = false;
							markup(options.onShiftEnter);
							return options.onShiftEnter.keepDefault;
						} else { // only Enter
							markup(options.onEnter);
							return options.onEnter.keepDefault;
						}
					}
					if (e.keyCode === 9) { // Tab key
						if (shiftKey == true || ctrlKey == true || altKey == true) {
							return false; 
						}
						if (caretOffset !== -1) {
							get();
							caretOffset = $$.val().length - caretOffset;
							set(caretOffset, 0);
							caretOffset = -1;
							return false;
						} else {
							markup(options.onTab);
							return options.onTab.keepDefault;
						}
					}
				}
			}

			init();
		});
	};

	$.fn.markItUpRemove = function() {
		return this.each(function() {
				var $$ = $(this).unbind().removeClass('markItUpEditor');
				$$.parent('div').parent('div.markItUp').parent('div').replaceWith($$);
			}
		);
	};

	$.markItUp = function(settings) {
		var options = { target:false };
		$.extend(options, settings);
		if (options.target) {
			return $(options.target).each(function() {
				$(this).focus();
				$(this).trigger('insertion', [options]);
			});
		} else {
			$('textarea').trigger('insertion', [options]);
		}
	};
})(jQuery);
// ----------------------------------------------------------------------------
// markItUp! Comment Set
// ----------------------------------------------------------------------------
commentSettings = {
	markupSet:  [
		{name:'Quote', key:'Q', openWith:'[q]', closeWith:'[/q]', className:"quote-button"  },
		{separator:'---------------' },
		{name:'Poll', openWith:function() {
				return '[poll='+new Date().getTime()+']';
		 	}, closeWith:	 function(h) {
					if(h.placeHolder==false) {
						openWith = null;
						return false;
					} else {
						return '[/poll]';
					}
			 }, placeHolder:function() {
					var num_answers=prompt("How many answers?",3);
					if(num_answers==null)  {
						alert('The number of answers cannot be blank, please try again');
						return false;
					}
					num_answers = parseInt(num_answers);
					if(num_answers=='' || isNaN(num_answers))  {
						alert('The number of answers is invalid, please try again');
						return false;
					}
					var poll = new Array();
					poll[0] = prompt("Question", null);
					//var poll = new Array("[![Question]!]");
					if(poll[0] == null || poll[0] == '') {
						alert('The question cannot be blank, please try again');
						return false;
					}
					var answer = null;
					for(i=1;i<=num_answers;i++) {
						answer = prompt("Answer "+i, null);
						if(answer != null && answer != '') poll[i] = answer;
						//poll[i] =  "[![Answer "+i+"]!]";
					}
					if(poll.length != (num_answers + 1)) {
						alert('One or more answers were blank, please try again');
						return false;
					}
					return poll.join(":");
			 },
			className:"poll-button"}
	]
};/****************************************************************************
  jpost plugin for jQuery
  http://www.codigomanso.com/projects/jpost

  Written by Pau Sanchez (contact@pausanchez.com) for jimi PHP Framework
****************************************************************************/

(function() {
  var _jpost_settings = {
    data          : null, // extra data to be sent
    image         : null, // '/themes/default/images/loading.gif',
    normalize     : true, // normalize checkboxes?
    onComplete    : null,
    afterComplete : null,
    msgbox        : null, // where should the messages be shown?
    timelapse     : 5000
  };
  
  // this function returns or sets the current settings
  window.jQuery.jpostSettings = function() {
    var old_settings = _jpost_settings;
    _jpost_settings  = $.extend (_jpost_settings, arguments[0] || {});
    return old_settings;
  };
})();

/**
 * This is equivalent to serialize function BUT it appends ALL checkboxes
 * setting the value of 1 when are checked and 0 when unchecked.
 */
jQuery.fn.jserialize = function () {
  var options = $.extend ({
    data          : null, // extra data to be sent
    normalize     : true  // normalize checkboxes?
  }, arguments[0] || {});  

  var serialized = this.serialize();

  // append normal data
  if (options.normalize) {
    $(this).find(':checkbox').each (function() {
      var tofind    = $(this).attr('name') + "=" + $(this).val();
      var toreplace = $(this).attr('name') + "=" + (this.checked ? '1' : '0');
      
      if (this.checked)   { serialized = serialized.replace (tofind, toreplace); }
      else                { serialized += "&" + toreplace; } 
    });
  }

  // append extra data (if any)
  if (options.data != null) {
    if (serialized) serialized += "&";
    serialized += jQuery.param(options.data);
  }

  return serialized;
};

/**
 * This function sends an AJAX request and waits for a response
 *
 * The return value will be true when the normal submit should be
 * executed and false when the normal form submit should be avoided
 * This return value could be directly passed as a return value to
 * the submit event
 */
jQuery.fn.jpost = function() {
  var options = $.extend (jQuery.jpostSettings(), arguments[0] || {});

  // Handle each selector
  var form   = $(this);
  var submit = form.find (':submit');
  var added_image = null;

  if (options.image != null) {
    submit.hide();
    added_image = $('<img src="' + options.image + '" />');
    submit.after (added_image);
  }
  else {
    submit.attr ('disabled', true);
  }

  // function to be executed when response is received
  // This function restores 'submit' button and calls onComplete callback
  var handle_json_response = function(json_response, textStatus)
  {
    if (added_image != null) { added_image.remove(); }

    if (options.onComplete != null) {
      options.onComplete (json_response, form);
      submit.removeAttr ('disabled');
      submit.show();
    }
    else {
      submit.removeAttr ('disabled');
      submit.show();

      if (('msg' in json_response) && (options.msgbox != null)) {
        $(options.msgbox)
          .html (json_response.msg)
          .stop(true)
          .removeClass('jpost-ok jpost-error')
          .hide()
          .fadeIn();

        // add jpost-ok or jpost-error classes depending on the response of the server
        if ('ok' in json_response) { 
          if (json_response.ok)  { $(options.msgbox).addClass ('jpost-ok'); }
          else                   { $(options.msgbox).addClass ('jpost-error'); }
        }

        // clear the previous timeout(just in case)
        if ($(options.msgbox).data ('__jpost-timeout-id') != undefined) 
          clearTimeout ($(options.msgbox).data ('__jpost-timeout-id'));

        var timeoutID = setTimeout (function() { $(options.msgbox).fadeOut(); }, options.timelapse);
        $(options.msgbox).data ('__jpost-timeout-id', timeoutID);
      }
    }

    if (options.afterComplete != null) {
      options.afterComplete (json_response, form);
    }
  };

  // DECISION: normal ajax submit or use a hidden iframe?
  //  - iframe trick will ONLY be used if form enctype is 'multiplart/form-data' 
  //    AND the user has selected one or more files
  //
  //  - any other cases data will be sent using standard ajax
  //     - this includes if there are input "file" but the user
  //       has not selected any file
  var doIframeRequest = 
    (form.attr ('enctype') == 'multipart/form-data') &&
    ((form.find (':file[value!=""]').length > 0)); 

  if (doIframeRequest)
  {
    // Seems that the user is trying to send some images
    // Let's send the whole form without doing a page refresh :)
    var frameName = 'jpost_iframe_' + ((new Date()).getTime());
    var iframe    = $('<iframe name="' + frameName + '" style="display:none;"></iframe>').hide().appendTo('body');
    var orgTarget = form.attr ('target');
    form.attr ('target', frameName);

    // update checkboxes to send 0 or 1
    // Trick: disable checkboxes before submit, and append hidden fields using the same name as the checkboxes
    if (options.normalize) {
      form.find(':checkbox').each (function() {
        var disabled = $(this).attr ('disabled');
        $(this).data ('jpost-original-disabled', disabled);
        $(this).attr ('disabled', 'disabled');
        
        if (disabled == 'undefined' || !disabled) {
          form.append ($('<input type="hidden" name="' + $(this).attr ('name') + '" value="' + (this.checked ? '1' : '0') + '"/>'));
        }
      });
    }

    // this is not very clean, but it is a way to let know the server this call should be treated as ajax
    $('<input type="hidden" name="XMLHttpRequest" value="1" />').appendTo (form);

    // append extra data as input fields
    if (options.data != null) {
      for (i in options.data)
        $('<textarea style="display: none;" name="' + i + '">' + options.data[i] + '</textarea>').appendTo (form);
    }

    iframe.load (function() {
      var response = iframe.contents().find('body').text();
      if (response.length == 0) response = '{}';
      try       { eval ("var json_response = " + response + ";"); }
      catch (e) { var json_response = {ok : false, msg : "Error in data returned by the server" }; }
      handle_json_response (json_response, 'undefined');
      
      // restore original form
      if (orgTarget != 'undefined') {
        form.attr ('target', orgTarget);
      }

      // restore checkboxes and remove hidden fields
      if (options.normalize) {
        form.find(':checkbox').each (function() {
          var disabled = $(this).data ('jpost-original-disabled');
          $(this).removeData ('jpost-original-disabled');

          if (disabled == 'undefined' || !disabled) {
            // remove the hidden fields that have been created
            form.find ('input[name="' +$(this).attr ('name') + '"]:hidden').remove();
            $(this).removeAttr ('disabled');
          }
        });
      }
      
      // remove extra hidden input fields
      if (options.data != null) {
        for (i in options.data) { form.find ("input[name=" + i +"]").remove(); }
      }

      // remove the hidden XMLHttpRequest...
      form.find ("input[name=XMLHttpRequest]:hidden").remove();

      // the timeout is to make all browsers stop the "loading iframe" animation
      setTimeout (function() { iframe.remove(); }, 100);
    });

    return true;
  }
  // use a normal AJAX post!
  else {
    $.ajax ({
      url      : form.attr ('action'),
      type     : 'POST',
      cache    : false,
      data     : form.jserialize({data : options.data, normalize : options.normalize}),
      dataType : 'json',
      success  : handle_json_response,
      error    : function (XMLHttpRequest, textStatus, errorThrown) {
        var data = {'ok' : false, 'error' : true, 'msg' : 'Error in data received from server'};
        handle_json_response (data, textStatus);
      }
    });
  }
  return false;
}

/**
 * jMakeAsync ([fn], {params})
 * This function transform a normal FORM into an asynchronous one
 * 
 * fn(response)   is the function to be called once the response 
 *                from the server has been received
 *
 * params         are the same as jpost
 */
jQuery.fn.jMakeAsync = function() {
  var options = $.extend ({
    onComplete : arguments[0]
  }, arguments[1] || {});

  return this.filter ('form').each (function () {
    var form = $(this);
    form.submit (function () { return form.jpost (options); });
  });
};

$(document).ready(function() {
    bindItemToggler();
    $('.item-list').each(function(){
      var list_name = $(this).attr('id');
      setItemLayoutFromCookies(list_name);
    });
});

function setItemLayoutFromCookies(list_name) {
  var list_id = '#'+list_name;
  var list_toggler_cookie = $.cookie(list_name); // Get cookie with name based upon item group
  var list_toggler_id = '#'+list_name+'-toggler';
  if(list_toggler_cookie == 'grid-layout') {
    $(list_toggler_id + ' .toggler-list').hide();
    $(list_toggler_id + ' .toggler-list-off').css('display', 'block');
    $(list_toggler_id + ' .toggler-grid').css('display', 'block');
    $(list_toggler_id + ' .toggler-grid-off').hide();
    if($(list_id).hasClass('grid-layout') != true) {
      $(list_id).addClass("grid-layout"); // Switch the layout type
    }
    $(list_id + ' .item-details.list').hide(); // Hide/Show description
    $(list_id + ' .item-details.grid').show(); // Hide/Show description
  } else if(list_toggler_cookie == 'list-layout') {
    $(list_toggler_id + ' .toggler-grid').hide();
    $(list_toggler_id + ' .toggler-grid-off').css('display', 'block');
    $(list_toggler_id + ' .toggler-list').css('display', 'block');
    $(list_toggler_id + ' .toggler-list-off').hide();
    if($(list_id).hasClass('grid-layout') == true) {
      $(list_id).removeClass("grid-layout"); // Switch the layout type
    }
    $(list_id + ' .item-details.grid').hide(); // Hide/Show description
    $(list_id + ' .item-details.list').show(); // Hide/Show description
  }
}

function bindItemToggler() {
  $('.item-toggler a.layout-toggler').unbind("click");
  $('.item-toggler a.layout-toggler').click(function(event) {
    event.preventDefault();
    var list_toggler_id = $(this).parent().attr('id'); // Get the toggler parent ID (contains item list id and item group)
    var settings = list_toggler_id.split('-');
    var list_id = '#' + settings[0]; // Set the list ID
    var list_toggler_id = '#' + list_toggler_id; // Set the list toggler ID

    var cookie_name = settings[0]; // Set cookie name based upon item group
    var url_root = window.location.pathname.split("/")[1];
    
    if($(list_id).hasClass('grid-layout')) {
      $(list_toggler_id + ' .toggler-grid').hide();
      $(list_toggler_id + ' .toggler-grid-off').css('display', 'block');
      $(list_toggler_id + ' .toggler-list').css('display', 'block');
      $(list_toggler_id + ' .toggler-list-off').hide();
      // Set cookie for list layout
      if(url_root=='page' || url_root=='archive') {
        $.cookie('page', 'list-layout', {expires: 360, path: '/page'});
        $.cookie('archive', 'list-layout', {expires: 360, path: '/archive'});
      } else {
        $.cookie(cookie_name, 'list-layout', {expires: 360, path: '/'+url_root});
      }
    } else {
      $(list_toggler_id + ' .toggler-list').hide();
      $(list_toggler_id + ' .toggler-list-off').css('display', 'block');
      $(list_toggler_id + ' .toggler-grid').css('display', 'block');
      $(list_toggler_id + ' .toggler-grid-off').hide();
      // Set cookie for grid layout
      if(url_root=='page' || url_root=='archive') {
        $.cookie('page', 'grid-layout', {expires: 360, path: '/page'}); 
        $.cookie('archive', 'grid-layout', {expires: 360, path: '/archive'});
      } else {
        $.cookie(cookie_name, 'grid-layout', {expires: 360, path: '/'+url_root});
      }
    }
    
    $(list_id).toggleClass("grid-layout"); // Switch the layout type
    $(list_id + ' .item-details').toggle(); // Hide/Show description
  });
}

function rebindItemToggler(list_name) {
  bindItemToggler();
}$(document).ready(function(){ 
  // Search box default (change name=search to type=text to add default swapping for all text inputs)
  $('input[name=search_value]').focus(function(){ 
    if($(this).val() == $(this).attr('defaultValue')) {
      $(this).val('');
    }
  });
  $('input[name=search_value]').blur(function(){
    if($(this).val() == '') {
      $(this).val($(this).attr('defaultValue'));
    }
  });
});$(document).ready (function () {
  var mega_menu_default_top_margin = 6;
  $('.mega-menu li').hoverIntent({
    over: function () {
      $(this).siblings('li').removeClass('hovering');
      $(this).addClass('hovering');
      var dropdown = $(this).children('.mega-menu-dropdown');
      dropdown.css("margin-top", "-"+mega_menu_default_top_margin+"px");
      dropdown.css("z-index", "9998");
      dropdown.animate({
        "margin-top": mega_menu_default_top_margin + "px",
        "opacity": "toggle"
      }, 250);
    },
    timeout: 200,
    interval: 30,
    out: function () {
      $(this).removeClass('hovering');
      var dropdown = $(this).children('.mega-menu-dropdown');
      dropdown.css("z-index", "9997");
      dropdown.animate({
        "margin-top": (mega_menu_default_top_margin*4)+"px",
        "opacity": "toggle"
      }, 400, function() {
        dropdown.css("margin-top", "-"+mega_menu_default_top_margin+"px");
      });
    }
  });
  
  $('.dropdown').hover(
    function () {
      $(this).addClass('hovering');
    },
    function () {
      $(this).removeClass('hovering');
    }
  );
  
  $('.dropdown .dropdown-link').click(function(event) {
    event.preventDefault();
  });
  
  // $('#mg-search').hover(
  //   function () {
  //     $(this).addClass('hovering');
  //   },
  //   function () {
  //     $(this).removeClass('hovering');
  //     
  //   }
  // );

  $('#mg-search-icon').click(function (event) {
    event.preventDefault();
    $("#mg-search").toggleClass("hovering");
  });

  $("body").click(function(event) {
    var $target = $(event.target);
    if( ! $target.is("#mg-search") && ! $target.parents().is("#mg-search")) {
      $("#mg-search").removeClass("hovering");
    }
  });

});$(document).ready(function(){
	$(".spotlight-menu td .spotlight-link").live('click', function(event) {
		event.preventDefault();
		var link_id = $(this).attr("id");
		var settings = link_id.split("-");
		var listing_name = settings[0];
		var listing_id = '#'+listing_name;
		var item_type = settings[1];
		var listing_method = settings[2];
		var listing_search = settings[3];
		var listing_cols = settings[4];
		var listing_rows = settings[5];
		var listing_list_title_len = settings[6];
		var listing_list_desc_len = settings[7];
		var listing_grid_title_len = settings[8];
		var listing_grid_desc_len = settings[9];
		var language = settings[10];
		var your_content = settings[11];
		var show_inventory = settings[12];
		var inventory_amount = settings[13];
		var inventory_placement = settings[14];
		var inventory_location = settings[15];
		var pagination_start = settings[17];
		var listing_layout = 'list';
		
		if($(listing_id).hasClass("grid-layout"))
		{
			listing_layout = 'grid';
		}
		else if($(listing_id).hasClass("mini-layout"))
		{
			listing_layout = 'mini';
		}
		else if($(listing_id).hasClass("text-layout"))
		{
			listing_layout = 'text';
		}
		else if($(listing_id).hasClass("large-layout"))
		{
			listing_layout = 'large';
		}
		var menu_item_text = '';
		var menu_item_parent = '';
		if($('#'+link_id).parents('.dropdown').length) {
			var menu_item_parent_id = $("#"+ link_id).parents('.spotlight-dropdown').attr('id');
		} else {
			var menu_item_parent_id = $("#"+ link_id).parent().attr('id');
		}

		$.ajax({ 
			type: "GET", 
			url: "/themes/default/ajax/ajax.listing.php", 
			data: {listing_name : listing_name, item_type : item_type, listing_method: listing_method, listing_search : listing_search, language : language, listing_layout : listing_layout, listing_cols : listing_cols, listing_rows : listing_rows, listing_list_title_len : listing_list_title_len, listing_list_desc_len : listing_list_desc_len, listing_grid_title_len : listing_grid_title_len, listing_grid_desc_len : listing_grid_desc_len, your_content : your_content, show_inventory : show_inventory, inventory_amount : inventory_amount, inventory_placement : inventory_placement, inventory_location : inventory_location, pagination_start : pagination_start}, 
			cache: false,
			dataType: "html", 
			beforeSend: function(){
				if($('#'+link_id).parents('.dropdown').length) {
					$(listing_id+'-menu .spotlight-link').removeClass("active");
					$(listing_id+'-menu .dropdown').removeClass("hovering");
					menu_item_text = $("#"+ menu_item_parent_id).html();
					menu_item_parent = $("#"+ menu_item_parent_id).html();
					$("#"+ link_id).parents('.spotlight-dropdown').addClass("spotlight-loading");
					$(listing_id+'-menu td').removeClass("active");
					$("#"+ menu_item_parent_id).children('.dropdown-link').html('<span class="spotlight-link">'+menu_item_text+'</span>');
				} else {
					menu_item_text = $("#"+ link_id).html();
					menu_item_parent = $("#"+ menu_item_parent_id).html();
					$("#"+ link_id).parent().addClass("spotlight-loading");
					$(listing_id+'-menu td').removeClass("active");
					$(listing_id+'-menu .spotlight-link').removeClass("active");
					$("#"+ menu_item_parent_id).html('<span class="spotlight-link">'+menu_item_text+'</span>');
				}
			}, 
			error: function(){ 
				$(listing_id).html('Error loading document');
				$("#"+ menu_item_parent_id).html(menu_item_parent);
				if($('#'+link_id).parents('.dropdown').length) {
					$("#"+ link_id).parents('.spotlight-dropdown').removeClass("spotlight-loading");
				} else {
					$("#"+ link_id).parent().removeClass("spotlight-loading");
				}
			}, 
			success: function(data){
				$(listing_id+'-loading').hide();
				$(listing_id+'-list').html(data);
				$("#"+ menu_item_parent_id).html(menu_item_parent);
				if($('#'+link_id).parents('.dropdown').length) {
					$("#"+ link_id).parents('.spotlight-dropdown').removeClass("spotlight-loading");
					$("#"+ link_id).addClass("active");
					$("#"+ link_id).parents('.spotlight-dropdown').addClass("active");
				} else {
					$("#"+ link_id).parent().removeClass("spotlight-loading");
					$("#"+ link_id).parent().addClass("active");
				}
			},
			complete: function(){
				$('#'+link_id).parents('.dropdown').hover(
					function () {
						$(this).addClass('hovering');
					},
					function () {
						$(this).removeClass('hovering');
					}
				);

				$('#'+link_id).parents('.dropdown').children('.dropdown-link').click(function(event) {
					event.preventDefault();
				});
				rebindItemToggler(listing_name);
			}
		});
	});
});function displayMemberFeeds(container) {
  var element = $("#"+container);
  if(element.length > 0) {
    var listing_box = element.find('.featured-feeds-box');
    var listing_box_id = listing_box.attr('id');
    var settings = listing_box_id.split("-");
    var limit = settings[3];
    var trim = settings[4];
    $.ajax({ 
      type: "GET", 
      url: "/themes/default/ajax/ajax.member.feed.listing.php", 
      data: {limit: limit, container: container, trim: trim}, 
      cache: false,
      dataType: "html", 
      beforeSend: function(){
        listing_box.hide();
        element.find('.featured-feeds-loading').show();
      },
      error: function(){
        element.find('.featured-feeds-loading').hide();
        listing_box.html('Error loading feeds');
        listing_box.show();
        
      },
      success: function(data){
        element.find('.featured-feeds-loading').hide();
        listing_box.html(data);
        listing_box.show();
      }
    });
  }
}

$(document).ready (function () { 
 $('#featured-feeds-refresh').click(function (event) {
   event.preventDefault();
   var listing_id = $('#featured-feeds-refresh').parents('.featured-feeds-list').attr('id');
   var listing_box_id = $('#'+listing_id).find('.featured-feeds-box').attr('id');
   var settings = listing_box_id.split("-");
   var limit = settings[3];
   var trim = settings[4];
   displayMemberFeeds(listing_id, limit, trim);
 });
});function refreshPollValues(poll_id, votes) {
  var votes = votes.split("|");
  var total_votes = 0;
  for (var i = 0; i < votes.length; i++) {
	total_votes += parseInt(votes[i]);
  }
  if(total_votes <= 0) total_votes = 1;
  var answers = new Array();
  for (var i = 0; i < votes.length; i++) {
	answers[i] = (votes[i]/total_votes)*100;
	answers[i] = answers[i].toFixed(0);
  }
  $(".poll").each(function(i) {
	var div_id = $(this).attr('id');
	var div_poll_id = div_id.split("_");
	div_poll_id = div_poll_id[0];
	if(poll_id == div_poll_id) {
	  $(this).find(".votes").each(function(i) {
		if(isNaN(answers[i])) answers[i] = 0;
		$(this).find(".votes_bar").css("width",answers[i]+"%");
		$(this).find(".votes_percent").html(answers[i]+"%");
	  });
	}
  });
}

function setPollVoted(poll_id) {
  $("form[name="+poll_id+"]").each(function(i) {
	$(this).find(".vote").remove();
	//$(this).find(".refresh").show();
	$(this).find(".answers input").each(function() {
	  $(this).remove();
	});
	var label = '';
	$(this).find(".answers label").each(function() {
	  label = $(this).html();
	  $(this).before('<label>'+label+'</label>').remove();
	});
  });
}

function loadPolls() {
	$(".poll").each(function(i) {
		var poll_id = $(this).attr('id');
		var div_id = poll_id+'_'+i
		$(this).attr('id',div_id);

		$("#"+div_id+" .loading").show();
		$("#"+div_id+" .vote").hide();

		if($(this).parents('.comment').length > 0){
		  item_type = 'comment';
		  var item_uid = $(this).parents('.comment').attr('id');
		  item_uid = item_uid.split('-');
		  item_uid = item_uid[1]; 
		} else {
		  var item_type = 'post';
		  var item_uid = $('.post-body').attr('id');
		  item_uid = item_uid.split('-');
		  item_uid = item_uid[2];
		}

		$.post (
		  "/themes/default/ajax/ajax.poll.php",
		  "poll_id="+poll_id+"&item_type="+item_type+"&item_uid="+item_uid,
		  function (data) {
			if (data.status == 'ok') {
			  refreshPollValues(poll_id, data.votes);
			  if($.cookie(item_type+'_'+item_uid+'_poll_'+poll_id)) {
				setPollVoted(poll_id);
			  } else {
				$("#"+div_id+" .vote").show();
				$("#"+div_id+" .answers input").each(function() {
				  $(this).show();
				});
			  }
			} else {
			  $("#"+div_id+" .error").html(data.msg);
			  $("#"+div_id+" .error").fadeIn('slow');
			}
			$("#"+div_id+" .loading").hide();
		  },
		  'json'
		);
	});
}

function loadCommentPolls(id) {
	$("#comment-"+id+" .poll").each(function(i) {
		var poll_id = $(this).attr('id');
		var div_id = poll_id+'_'+i
		$(this).attr('id',div_id);

		$("#"+div_id+" .loading").show();
		$("#"+div_id+" .vote").hide();

		if($(this).parents('.comment').length > 0){
		  item_type = 'comment';
		  var item_uid = $(this).parents('.comment').attr('id');
		  item_uid = item_uid.split('-');
		  item_uid = item_uid[1]; 
		} else {
		  var item_type = 'post';
		  var item_uid = $('.post-body').attr('id');
		  item_uid = item_uid.split('-');
		  item_uid = item_uid[2];
		}

		$.post (
		  "/themes/default/ajax/ajax.poll.php",
		  "poll_id="+poll_id+"&item_type="+item_type+"&item_uid="+item_uid,
		  function (data) {
			if (data.status == 'ok') {
			  refreshPollValues(poll_id, data.votes);
			  if($.cookie(item_type+'_'+item_uid+'_poll_'+poll_id)) {
				setPollVoted(poll_id);
			  } else {
				$("#"+div_id+" .vote").show();
				$("#"+div_id+" .answers input").each(function() {
				  $(this).show();
				});
			  }
			} else {
			  $("#"+div_id+" .error").html(data.msg);
			  $("#"+div_id+" .error").fadeIn('slow');
			}
			$("#"+div_id+" .loading").hide();
		  },
		  'json'
		);
	});
}

function bindPolls() {
	$("form.poll").each(function() {
	$(this).validate({
	  rules: {
		answer: {
		  required: true
		}
	  },
	  messages: {
		answer: {
		  required: "Please select an answer"
		}
	  },
	  errorElement: "div",
	  errorClass: "input-error",
	  errorPlacement: function(error, element) {
		element.parent().before(error);
	  },
	  submitHandler: function(form) {
		var form = $('#'+form.id);
		var poll_id = form.attr("id").split("_");
		poll_id = poll_id[0];
		if(form.parents('.comment').length > 0){
		  var item_type = 'comment';
		  var item_uid = form.parents('.comment').attr('id');
		  item_uid = item_uid.split('-');
		  item_uid = item_uid[1]; 
		} else {
		  var item_type = 'post';
		  var item_uid = $('.post-body').attr('id');
		  item_uid = item_uid.split('-');
		  item_uid = item_uid[2];
		}

		form.find(".error").hide();
		form.find(".saved").hide();

		form.find(".loading").show();
		form.find(".vote").hide();

		if($.cookie(item_type+'_'+item_uid+'_poll_'+poll_id)) {
			form.find(".voted").fadeIn('slow');
			setTimeout (function () { form.find(".voted").fadeOut('slow'); }, 15000);
			return false;
		}

		$.post (
		  "/themes/default/ajax/ajax.poll.php",
		  form.serialize() + "&poll_id="+poll_id+"&item_type="+item_type+"&item_uid="+item_uid,
		  function (data) {
			if (data.status == 'ok') {
			  form.find(".saved").fadeIn('slow');
			  setTimeout (function () { form.find(".saved").fadeOut('slow'); }, 10000);
			  refreshPollValues(poll_id, data.votes);
			  $.cookie(item_type+'_'+item_uid+'_poll_'+poll_id, item_type+'_'+item_uid+'_poll_'+poll_id, { expires: 1 });
			  setPollVoted(poll_id);
			} else if(data.status == 'voted') {
			  form.find(".voted").fadeIn('slow');
			  setTimeout (function () { form.find(".voted").fadeOut('slow'); }, 15000);
			} else {
			  form.find(".error").html(data.msg);
			  form.find(".error").fadeIn('slow');
			  setTimeout (function () { form.find(".error").fadeOut('slow'); }, 15000);
			}
			form.find(".loading").hide();
			form.find(".vote").show();
		  },
		  'json'
		);
		return false;
	  }
	});
  });
}

$(document).ready(function() {
	loadPolls();
	bindPolls();
});function refreshDBPollValues(poll_id, answers) {
	$(".dbpoll").each(function(i) {
		var div_id = $(this).attr('id');
		var div_poll_id = div_id.split("_");
		div_poll_id = div_poll_id[0];
		if(poll_id == div_poll_id) {
			$(this).html('');
			$(this).html(answers);
			$("form[name=" + poll_id + "]").attr("id", div_id);
		}
	});
}

function setDBPollVoted(poll_id) {
	$("form[name="+poll_id+"]").each(function(i) {
		$(this).find(".vote").remove();
		//$(this).find(".refresh").show();
		$(this).find(".answers input").each(function() {
			$(this).remove();
		});
		var label = '';
		$(this).find(".answers label").each(function() {
			label = $(this).html();
			$(this).before('<strong>'+label+'</strong>').remove();
		});
	});
}

function bindCustomField() {
	$(".custom_vote input[name=custom_answer]").focus(function(){ 
		if($(this).val() == $(this).attr('defaultValue')) {
			$(this).val('');
			$(this).siblings(".custom_vote_answer").attr("checked", "checked");
		}
	});

	$(".custom_vote input[name=custom_answer]").blur(function(){
		if($(this).val() == '') {
			$(this).val($(this).attr('defaultValue'));
		}
	});
}

function loadDBPolls() {
	$(".dbpoll").each(function(i) {
		var poll_id = $(this).attr("id");
		var div_id = poll_id+'_'+i
		$(this).attr('id',div_id);
	});
	
	$(".dbpoll").each(function() {
		var div_id = $(this).attr("id");
		var poll_id = $(this).attr("id").split("_");
		poll_id = poll_id[0];

		var poll_type = $(this).data("type");

		$("#"+div_id+" .loading").show();
		$("#"+div_id+" .vote").hide();

		if($(this).parents('.comment').length > 0){
			item_type = 'comment';
			var item_uid = $(this).parents('.comment').attr('id');
			item_uid = item_uid.split('-');
			item_uid = item_uid[1]; 
		} else {
			var item_type = 'post';
			var item_uid = $('.post-body').attr('id');
			item_uid = item_uid.split('-');
			item_uid = item_uid[2];
		}

		$.post (
			"/themes/default/ajax/ajax.dbpoll.php",
			"poll_id="+poll_id+"&poll_type="+poll_type+"&item_type="+item_type+"&item_uid="+item_uid,
			function (data) {
				if (data.status == 'ok') {
					refreshDBPollValues(poll_id, data.votes);
					if($.cookie(item_type+'_'+item_uid+'_poll_'+poll_id)) {
						setDBPollVoted(poll_id);
					} else {
						$("#"+div_id+" .vote").show();
						$("#"+div_id+" .custom_vote").show();
						$("#"+div_id+" .answers input").each(function() {
							$(this).show();
						});
					}
				} else {
					$("#"+div_id+" .error").html(data.msg);
					$("#"+div_id+" .error").fadeIn('slow');
				}
				bindCustomField();
				$("#"+div_id+" .loading").hide();
			},
			'json'
		);
	});
}

function bindDBPolls() {
	$("form.dbpoll").each(function() {
		$(this).validate({
			rules: {
				answer: {
					required: true
				}
			},
			messages: {
				answer: {
					required: "Please select an answer"
				}
			},
			errorElement: "div",
			errorClass: "input-error",
			errorPlacement: function(error, element) {
				element.parent().before(error);
			},
			submitHandler: function(form) {
				var form = $('#'+form.id);
				var poll_id = form.attr("id").split("_");
				poll_id = poll_id[0];

				var poll_type = form.data("type");

				if(form.parents('.comment').length > 0){
					var item_type = 'comment';
					var item_uid = form.parents('.comment').attr('id');
					item_uid = item_uid.split('-');
					item_uid = item_uid[1]; 
				} else {
					var item_type = 'post';
					var item_uid = $('.post-body').attr('id');
					item_uid = item_uid.split('-');
					item_uid = item_uid[2];
				}

				form.find(".error").hide();
				form.find(".saved").hide();

				var answer = form.find("input[name='answer']:checked").val();
				if(answer == "0") {
					var custom_answer = form.find(".custom_answer").val();
					if(custom_answer == "Add an answer to this poll" || custom_answer == "") {
						form.find(".error").html("Please enter a custom answer");
						form.find(".error").fadeIn("slow");
						setTimeout (function () { form.find(".error").fadeOut("slow"); }, 15000);
						return false;
					}
					
					if(custom_answer.length > 100) {
						form.find(".error").html("Your answer must be less than 100 characters long");
						form.find(".error").fadeIn("slow");
						setTimeout (function () { form.find(".error").fadeOut("slow"); }, 15000);
						return false;
					}
				}

				form.find(".loading").show();
				form.find(".vote").hide();

				if($.cookie(item_type+'_'+item_uid+'_poll_'+poll_id)) {
					form.find(".loading").hide();
					form.find(".voted").fadeIn('slow');
					setTimeout (function () { form.find(".voted").fadeOut('slow'); }, 15000);
					return false;
				}

				$.post (
					"/themes/default/ajax/ajax.dbpoll.php",
					form.serialize() + "&poll_id="+poll_id+"&poll_type="+poll_type+"&item_type="+item_type+"&item_uid="+item_uid,
					function (data) {
						if (data.status == 'ok') {
							refreshDBPollValues(poll_id, data.votes);
							setDBPollVoted(poll_id);
							$.cookie(item_type+'_'+item_uid+'_poll_'+poll_id, item_type+'_'+item_uid+'_poll_'+poll_id, { expires: 1 });
							form.find(".saved").html(data.msg);
							form.find(".saved").fadeIn('slow');
							setTimeout (function () { form.find(".saved").fadeOut('slow'); }, 10000);
						} else if(data.status == 'voted') {
							setDBPollVoted(poll_id);
							$.cookie(item_type+'_'+item_uid+'_poll_'+poll_id, item_type+'_'+item_uid+'_poll_'+poll_id, { expires: 1 });
							form.find(".voted").fadeIn('slow');
							setTimeout (function () { form.find(".voted").fadeOut('slow'); }, 15000);
						} else {
							form.find(".error").html(data.msg);
							form.find(".error").fadeIn('slow');
							setTimeout (function () { form.find(".error").fadeOut('slow'); }, 15000);
						}
						form.find(".loading").hide();
						form.find(".vote").show();
					},
					'json'
				);
				return false;
			}
		});
	});
}

$(document).ready(function() {
	$.cookie('poll_check', '1', { path: '/' });
	loadDBPolls();
	bindDBPolls();
});$(document).ready (function () {
	$('.settings-dropdown').hover(
		function () {
			$(this).children('.dropdown-link').children('img').attr('src', "http://www.subdesu-h.net/wp-content/themes/CustomWPTheme/www.subdesu-h.net/public/img/subdesu/settings-dropdown-on.png?1332902159");
		},
		function () {
			$(this).children('.dropdown-link').children('img').attr('src', "http://www.subdesu-h.net/wp-content/themes/CustomWPTheme/www.subdesu-h.net/public/img/subdesu/settings-dropdown-off.png?1332902159");
		}
	);
});
$(document).ready (function () {
	$('#mg-user-panel-login-link').click(function (event) {
		event.preventDefault();
		$('#mg-user-panel-login-options').hide();
		$('#mg-user-panel-login-form').slideToggle();
	});
	
	$('#mg-user-panel-login-cancel').click(function (event) {
		event.preventDefault();
		$('#mg-user-panel-login-form').hide();
		$('#mg-user-panel-login-options').slideToggle();
	});
});function bind_minimize(minimize)
{
	var box = minimize.parent('.mg-box');
	var button = minimize.children('.mg-box-minimize-button');
	var title = minimize.children('.mg-box-minimize-title');
	
	button.unbind('click');
	button.click(function (event)
	{
		event.preventDefault();
		box_minimize(minimize);
		$.cookie(box.attr('id'), 0, { expires: 360, path: '/'});
	});
	
	title.unbind('click');
	title.click(function (event)
	{
		event.preventDefault();
		box_minimize(minimize);
		$.cookie(box.attr('id'), 0, { expires: 360, path: '/'});
	});
	
	button.mouseover(function()
	{
		box.addClass('mg-box-highlight');
	}).mouseout(function()
	{
		box.removeClass('mg-box-highlight');
	});
}

function bind_maximize(minimize)
{
	var box = minimize.parent('.mg-box');
	var button = minimize.children('.mg-box-minimize-button');
	var title = minimize.children('.mg-box-minimize-title');
	
	button.unbind('mouseover');
	box.removeClass('mg-box-highlight');
	
	button.unbind('click');
	button.click(function (event)
	{
		event.preventDefault();
		box_maximize(minimize);
		$.cookie(box.attr('id'), 1, { expires: 360, path: '/'});
	});
	
	title.unbind('click');
	title.click(function (event)
	{
		event.preventDefault();
		box_maximize(minimize);
		$.cookie(box.attr('id'), 1, { expires: 360, path: '/'});
	});
}

function box_minimize(minimize)
{
	var box = minimize.parent('.mg-box');
	var button = minimize.children('.mg-box-minimize-button');
	
	if (box.hasClass("permanent"))
	{
		box.hide();
	}
	else
	{
		bind_maximize(minimize);

		box.children('.mg-box-minimize-content').animate(
		{ 
			height: "hide",
			opacity: "hide"
		}, 600, function() {
			box.children('.mg-box-minimize-content').hide();
		});

		minimize.children('.mg-box-minimize-title').fadeIn();

		button.children('img').attr('src', 'http://www.subdesu-h.net/wp-content/themes/CustomWPTheme/www.subdesu-h.net/public/img/subdesu/maximize.png?1332902159');
		button.children('img').attr('alt', 'Maximize');
		button.attr('title', 'Maximize');
		box.addClass('mg-box-minimized');
	}
}

function box_maximize(minimize)
{
	var box = minimize.parent('.mg-box');
	var button = minimize.children('.mg-box-minimize-button');
	
	bind_minimize(minimize);
	
	minimize.children('.mg-box-minimize-title').fadeOut();
	
	box.children('.mg-box-minimize-content').animate(
	{ 
		height: "show",
		opacity: "show"
	}, 600, function() {
		box.children('.mg-box-minimize-content').show();
	});
	
	button.mouseover(function()
	{
		var box = $(this).parent('.mg-box-minimize').parent('.mg-box');
		box.addClass('mg-box-highlight');
	}).mouseout(function()
	{
		var box = $(this).parent('.mg-box-minimize').parent('.mg-box');
		box.removeClass('mg-box-highlight');
	});
	
	button.children('img').attr('src', 'http://www.subdesu-h.net/wp-content/themes/CustomWPTheme/www.subdesu-h.net/public/img/subdesu/minimize.png?1332902159');
	button.children('img').attr('alt', 'Minimize');
	button.attr('title', 'Minimize');
	box.removeClass('mg-box-minimized');
}

function clearBoxSettings() {
	$.cookie("mg-post-community", null, { path: "/"});
	$.cookie("mg-post-extra", null, { path: "/"});
	$("#mg-post-community").show();
	$("#mg-post-extra").show();
}

$(document).ready (function ()
{
	$('.mg-box-minimize-button').each(function()
	{
		var minimize = $(this).parent('.mg-box-minimize');
		var box = minimize.parent('.mg-box');
		var cookie = box.attr('id');
		
		if( ! $.cookie(cookie))
		{
			if (box.children('.mg-box-minimize-content').is(':visible'))
			{
				bind_minimize(minimize);
			}
			else
			{
				bind_maximize(minimize);
			}
		}
		else
		{
			if($.cookie(cookie) == '1')
			{
				box_maximize(minimize);
			}
			else if($.cookie(cookie) == '0')
			{
				box_minimize(minimize);
			}
		}
	});
	
	
	// TODO: LEGACY
	
	$('.mg-msg-box-close').click(function (event) {
		event.preventDefault();
		var msg_box_id = $(this).parent('.mg-msg-box').attr('id');
		$(this).parent('.mg-msg-box').animate(
		{ 
			height: "hide",
			opacity: "hide"
		}, 600);
		$.cookie(msg_box_id, 1, { expires: 360, path: '/'});
	});
	
	$('.mg-msg-box').each(function() {
		var msg_box_id = $(this).attr('id');
		if( ! $.cookie(msg_box_id)) {
			$(this).show();
		}
	});
});$(document).ready (function ()
{
	$('#mode a').live('click', function(event) {
		if (navigator.userAgent.match(/(iPhone|iPod|Android)/)) {
			event.preventDefault();
			$.cookie('iphone_mode', null, { path: '/'});
			window.location.href = $(this).attr('href');
		}
	});
});// This module depends on jquery.ui.dialog

function AlertDialog (title/*, text*/)
{
  var text     = (arguments.length >= 2) ? arguments[1] : title;
  var callback = (arguments.length >= 3) ? arguments[2] : null;
  if (arguments.length == 1) { title = 'Alert'; }

  $('<div style="font-size: 10pt;">' + text + '</div>').dialog({
    title : title,
    bgiframe: true,
    modal: true,
    width: "24em",
    overlay: {
      backgroundColor: '#000',
      opacity:         0.5
    },
    buttons: {
      Close: function() {
        $(this).dialog('close');
        if (callback != null)
          callback();
      }
    }
  });
}

function ConfirmDialog (title, text, options)
{
  var options = $.extend ({
    ok        : 'OK',
    cancel    : 'Cancel',
    onConfirm : null,
    onCancel  : null
  }, arguments[2] || {});

  var boptions = {};
  boptions[options.cancel] = function () {
    $(this).dialog('close');
    if (options.onCancel != null) { options.onCancel (); }
  };
  boptions[options.ok] = function() {
    $(this).dialog('close');
    if (options.onConfirm != null) { options.onConfirm (); }
  };
  
  $('<div style="font-size: 10pt;">' + text + '</div>').dialog({
    title : title,
    bgiframe: true,
    width: "auto",
    modal: true,
    overlay: {
      backgroundColor: '#000',
      opacity:         0.5
    },
    buttons: boptions
  });
}

/*!
 * jQuery Cycle Plugin (with Transition Definitions)
 * Examples and documentation at: http://jquery.malsup.com/cycle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version: 2.9995 (09-AUG-2011)
 * Dual licensed under the MIT and GPL licenses.
 * http://jquery.malsup.com/license.html
 * Requires: jQuery v1.3.2 or later
 */
;(function($) {

var ver = '2.9995';

// if $.support is not defined (pre jQuery 1.3) add what I need
if ($.support == undefined) {
  $.support = {
    opacity: !($.browser.msie)
  };
}

function debug(s) {
  $.fn.cycle.debug && log(s);
}    
function log() {
  window.console && console.log && console.log('[cycle] ' + Array.prototype.join.call(arguments,' '));
}
$.expr[':'].paused = function(el) {
  return el.cyclePause;
}


// the options arg can be...
//   a number  - indicates an immediate transition should occur to the given slide index
//   a string  - 'pause', 'resume', 'toggle', 'next', 'prev', 'stop', 'destroy' or the name of a transition effect (ie, 'fade', 'zoom', etc)
//   an object - properties to control the slideshow
//
// the arg2 arg can be...
//   the name of an fx (only used in conjunction with a numeric value for 'options')
//   the value true (only used in first arg == 'resume') and indicates
//   that the resume should occur immediately (not wait for next timeout)

$.fn.cycle = function(options, arg2) {
  var o = { s: this.selector, c: this.context };

  // in 1.3+ we can fix mistakes with the ready state
  if (this.length === 0 && options != 'stop') {
    if (!$.isReady && o.s) {
      log('DOM not ready, queuing slideshow');
      $(function() {
        $(o.s,o.c).cycle(options,arg2);
      });
      return this;
    }
    // is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
    log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
    return this;
  }

  // iterate the matched nodeset
  return this.each(function() {
    var opts = handleArguments(this, options, arg2);
    if (opts === false)
      return;

    opts.updateActivePagerLink = opts.updateActivePagerLink || $.fn.cycle.updateActivePagerLink;
    
    // stop existing slideshow for this container (if there is one)
    if (this.cycleTimeout)
      clearTimeout(this.cycleTimeout);
    this.cycleTimeout = this.cyclePause = 0;

    var $cont = $(this);
    var $slides = opts.slideExpr ? $(opts.slideExpr, this) : $cont.children();
    var els = $slides.get();

    var opts2 = buildOptions($cont, $slides, els, opts, o);
    if (opts2 === false)
      return;

    if (els.length < 2) {
      log('terminating; too few slides: ' + els.length);
      return;
    }

    var startTime = opts2.continuous ? 10 : getTimeout(els[opts2.currSlide], els[opts2.nextSlide], opts2, !opts2.backwards);

    // if it's an auto slideshow, kick it off
    if (startTime) {
      startTime += (opts2.delay || 0);
      if (startTime < 10)
        startTime = 10;
      debug('first timeout: ' + startTime);
      this.cycleTimeout = setTimeout(function(){go(els,opts2,0,!opts.backwards)}, startTime);
    }
  });
};

function triggerPause(cont, byHover, onPager) {
  var opts = $(cont).data('cycle.opts');
  var paused = !!cont.cyclePause;
  if (paused && opts.paused)
    opts.paused(cont, opts, byHover, onPager);
  else if (!paused && opts.resumed)
    opts.resumed(cont, opts, byHover, onPager);
}

// process the args that were passed to the plugin fn
function handleArguments(cont, options, arg2) {
  if (cont.cycleStop == undefined)
    cont.cycleStop = 0;
  if (options === undefined || options === null)
    options = {};
  if (options.constructor == String) {
    switch(options) {
    case 'destroy':
    case 'stop':
      var opts = $(cont).data('cycle.opts');
      if (!opts)
        return false;
      cont.cycleStop++; // callbacks look for change
      if (cont.cycleTimeout)
        clearTimeout(cont.cycleTimeout);
      cont.cycleTimeout = 0;
      opts.elements && $(opts.elements).stop();
      $(cont).removeData('cycle.opts');
      if (options == 'destroy')
        destroy(opts);
      return false;
    case 'toggle':
      cont.cyclePause = (cont.cyclePause === 1) ? 0 : 1;
      checkInstantResume(cont.cyclePause, arg2, cont);
      triggerPause(cont);
      return false;
    case 'pause':
      cont.cyclePause = 1;
      triggerPause(cont);
      return false;
    case 'resume':
      cont.cyclePause = 0;
      checkInstantResume(false, arg2, cont);
      triggerPause(cont);
      return false;
    case 'prev':
    case 'next':
      var opts = $(cont).data('cycle.opts');
      if (!opts) {
        log('options not found, "prev/next" ignored');
        return false;
      }
      $.fn.cycle[options](opts);
      return false;
    default:
      options = { fx: options };
    };
    return options;
  }
  else if (options.constructor == Number) {
    // go to the requested slide
    var num = options;
    options = $(cont).data('cycle.opts');
    if (!options) {
      log('options not found, can not advance slide');
      return false;
    }
    if (num < 0 || num >= options.elements.length) {
      log('invalid slide index: ' + num);
      return false;
    }
    options.nextSlide = num;
    if (cont.cycleTimeout) {
      clearTimeout(cont.cycleTimeout);
      cont.cycleTimeout = 0;
    }
    if (typeof arg2 == 'string')
      options.oneTimeFx = arg2;
    go(options.elements, options, 1, num >= options.currSlide);
    return false;
  }
  return options;
  
  function checkInstantResume(isPaused, arg2, cont) {
    if (!isPaused && arg2 === true) { // resume now!
      var options = $(cont).data('cycle.opts');
      if (!options) {
        log('options not found, can not resume');
        return false;
      }
      if (cont.cycleTimeout) {
        clearTimeout(cont.cycleTimeout);
        cont.cycleTimeout = 0;
      }
      go(options.elements, options, 1, !options.backwards);
    }
  }
};

function removeFilter(el, opts) {
  if (!$.support.opacity && opts.cleartype && el.style.filter) {
    try { el.style.removeAttribute('filter'); }
    catch(smother) {} // handle old opera versions
  }
};

// unbind event handlers
function destroy(opts) {
  if (opts.next)
    $(opts.next).unbind(opts.prevNextEvent);
  if (opts.prev)
    $(opts.prev).unbind(opts.prevNextEvent);
  
  if (opts.pager || opts.pagerAnchorBuilder)
    $.each(opts.pagerAnchors || [], function() {
      this.unbind().remove();
    });
  opts.pagerAnchors = null;
  if (opts.destroy) // callback
    opts.destroy(opts);
};

// one-time initialization
function buildOptions($cont, $slides, els, options, o) {
  // support metadata plugin (v1.0 and v2.0)
  var opts = $.extend({}, $.fn.cycle.defaults, options || {}, $.metadata ? $cont.metadata() : $.meta ? $cont.data() : {});
  var meta = $.isFunction($cont.data) ? $cont.data(opts.metaAttr) : null;
  if (meta)
    opts = $.extend(opts, meta);
  if (opts.autostop)
    opts.countdown = opts.autostopCount || els.length;

  var cont = $cont[0];
  $cont.data('cycle.opts', opts);
  opts.$cont = $cont;
  opts.stopCount = cont.cycleStop;
  opts.elements = els;
  opts.before = opts.before ? [opts.before] : [];
  opts.after = opts.after ? [opts.after] : [];

  // push some after callbacks
  if (!$.support.opacity && opts.cleartype)
    opts.after.push(function() { removeFilter(this, opts); });
  if (opts.continuous)
    opts.after.push(function() { go(els,opts,0,!opts.backwards); });

  saveOriginalOpts(opts);

  // clearType corrections
  if (!$.support.opacity && opts.cleartype && !opts.cleartypeNoBg)
    clearTypeFix($slides);

  // container requires non-static position so that slides can be position within
  if ($cont.css('position') == 'static')
    $cont.css('position', 'relative');
  if (opts.width)
    $cont.width(opts.width);
  if (opts.height && opts.height != 'auto')
    $cont.height(opts.height);

  if (opts.startingSlide)
    opts.startingSlide = parseInt(opts.startingSlide,10);
  else if (opts.backwards)
    opts.startingSlide = els.length - 1;

  // if random, mix up the slide array
  if (opts.random) {
    opts.randomMap = [];
    for (var i = 0; i < els.length; i++)
      opts.randomMap.push(i);
    opts.randomMap.sort(function(a,b) {return Math.random() - 0.5;});
    opts.randomIndex = 1;
    opts.startingSlide = opts.randomMap[1];
  }
  else if (opts.startingSlide >= els.length)
    opts.startingSlide = 0; // catch bogus input
  opts.currSlide = opts.startingSlide || 0;
  var first = opts.startingSlide;

  // set position and zIndex on all the slides
  $slides.css({position: 'absolute', top:0, left:0}).hide().each(function(i) {
    var z;
    if (opts.backwards)
      z = first ? i <= first ? els.length + (i-first) : first-i : els.length-i;
    else
      z = first ? i >= first ? els.length - (i-first) : first-i : els.length-i;
    $(this).css('z-index', z)
  });

  // make sure first slide is visible
  $(els[first]).css('opacity',1).show(); // opacity bit needed to handle restart use case
  removeFilter(els[first], opts);

  // stretch slides
  if (opts.fit) {
    if (!opts.aspect) {
          if (opts.width)
              $slides.width(opts.width);
          if (opts.height && opts.height != 'auto')
              $slides.height(opts.height);
    } else {
      $slides.each(function(){
        var $slide = $(this);
        var ratio = (opts.aspect === true) ? $slide.width()/$slide.height() : opts.aspect;
        if( opts.width && $slide.width() != opts.width ) {
          $slide.width( opts.width );
          $slide.height( opts.width / ratio );
        }

        if( opts.height && $slide.height() < opts.height ) {
          $slide.height( opts.height );
          $slide.width( opts.height * ratio );
        }
      });
    }
  }

  if (opts.center && ((!opts.fit) || opts.aspect)) {
    $slides.each(function(){
      var $slide = $(this);
      $slide.css({
        "margin-left": opts.width ?
          ((opts.width - $slide.width()) / 2) + "px" :
          0,
        "margin-top": opts.height ?
          ((opts.height - $slide.height()) / 2) + "px" :
          0
      });
    });
  }

  if (opts.center && !opts.fit && !opts.slideResize) {
      $slides.each(function(){
        var $slide = $(this);
        $slide.css({
            "margin-left": opts.width ? ((opts.width - $slide.width()) / 2) + "px" : 0,
            "margin-top": opts.height ? ((opts.height - $slide.height()) / 2) + "px" : 0
        });
      });
  }
    
  // stretch container
  var reshape = opts.containerResize && !$cont.innerHeight();
  if (reshape) { // do this only if container has no size http://tinyurl.com/da2oa9
    var maxw = 0, maxh = 0;
    for(var j=0; j < els.length; j++) {
      var $e = $(els[j]), e = $e[0], w = $e.outerWidth(), h = $e.outerHeight();
      if (!w) w = e.offsetWidth || e.width || $e.attr('width');
      if (!h) h = e.offsetHeight || e.height || $e.attr('height');
      maxw = w > maxw ? w : maxw;
      maxh = h > maxh ? h : maxh;
    }
    if (maxw > 0 && maxh > 0)
      $cont.css({width:maxw+'px',height:maxh+'px'});
  }

  var pauseFlag = false;  // https://github.com/malsup/cycle/issues/44
  if (opts.pause)
    $cont.hover(
      function(){
        pauseFlag = true;
        this.cyclePause++;
        triggerPause(cont, true);
      },
      function(){
        pauseFlag && this.cyclePause--;
        triggerPause(cont, true);
      }
    );

  if (supportMultiTransitions(opts) === false)
    return false;

  // apparently a lot of people use image slideshows without height/width attributes on the images.
  // Cycle 2.50+ requires the sizing info for every slide; this block tries to deal with that.
  var requeue = false;
  options.requeueAttempts = options.requeueAttempts || 0;
  $slides.each(function() {
    // try to get height/width of each slide
    var $el = $(this);
    this.cycleH = (opts.fit && opts.height) ? opts.height : ($el.height() || this.offsetHeight || this.height || $el.attr('height') || 0);
    this.cycleW = (opts.fit && opts.width) ? opts.width : ($el.width() || this.offsetWidth || this.width || $el.attr('width') || 0);

    if ( $el.is('img') ) {
      // sigh..  sniffing, hacking, shrugging...  this crappy hack tries to account for what browsers do when
      // an image is being downloaded and the markup did not include sizing info (height/width attributes);
      // there seems to be some "default" sizes used in this situation
      var loadingIE  = ($.browser.msie  && this.cycleW == 28 && this.cycleH == 30 && !this.complete);
      var loadingFF  = ($.browser.mozilla && this.cycleW == 34 && this.cycleH == 19 && !this.complete);
      var loadingOp  = ($.browser.opera && ((this.cycleW == 42 && this.cycleH == 19) || (this.cycleW == 37 && this.cycleH == 17)) && !this.complete);
      var loadingOther = (this.cycleH == 0 && this.cycleW == 0 && !this.complete);
      // don't requeue for images that are still loading but have a valid size
      if (loadingIE || loadingFF || loadingOp || loadingOther) {
        if (o.s && opts.requeueOnImageNotLoaded && ++options.requeueAttempts < 100) { // track retry count so we don't loop forever
          log(options.requeueAttempts,' - img slide not loaded, requeuing slideshow: ', this.src, this.cycleW, this.cycleH);
          setTimeout(function() {$(o.s,o.c).cycle(options)}, opts.requeueTimeout);
          requeue = true;
          return false; // break each loop
        }
        else {
          log('could not determine size of image: '+this.src, this.cycleW, this.cycleH);
        }
      }
    }
    return true;
  });

  if (requeue)
    return false;

  opts.cssBefore = opts.cssBefore || {};
  opts.cssAfter = opts.cssAfter || {};
  opts.cssFirst = opts.cssFirst || {};
  opts.animIn = opts.animIn || {};
  opts.animOut = opts.animOut || {};

  $slides.not(':eq('+first+')').css(opts.cssBefore);
  $($slides[first]).css(opts.cssFirst);

  if (opts.timeout) {
    opts.timeout = parseInt(opts.timeout,10);
    // ensure that timeout and speed settings are sane
    if (opts.speed.constructor == String)
      opts.speed = $.fx.speeds[opts.speed] || parseInt(opts.speed,10);
    if (!opts.sync)
      opts.speed = opts.speed / 2;
    
    var buffer = opts.fx == 'none' ? 0 : opts.fx == 'shuffle' ? 500 : 250;
    while((opts.timeout - opts.speed) < buffer) // sanitize timeout
      opts.timeout += opts.speed;
  }
  if (opts.easing)
    opts.easeIn = opts.easeOut = opts.easing;
  if (!opts.speedIn)
    opts.speedIn = opts.speed;
  if (!opts.speedOut)
    opts.speedOut = opts.speed;

  opts.slideCount = els.length;
  opts.currSlide = opts.lastSlide = first;
  if (opts.random) {
    if (++opts.randomIndex == els.length)
      opts.randomIndex = 0;
    opts.nextSlide = opts.randomMap[opts.randomIndex];
  }
  else if (opts.backwards)
    opts.nextSlide = opts.startingSlide == 0 ? (els.length-1) : opts.startingSlide-1;
  else
    opts.nextSlide = opts.startingSlide >= (els.length-1) ? 0 : opts.startingSlide+1;

  // run transition init fn
  if (!opts.multiFx) {
    var init = $.fn.cycle.transitions[opts.fx];
    if ($.isFunction(init))
      init($cont, $slides, opts);
    else if (opts.fx != 'custom' && !opts.multiFx) {
      log('unknown transition: ' + opts.fx,'; slideshow terminating');
      return false;
    }
  }

  // fire artificial events
  var e0 = $slides[first];
  if (!opts.skipInitializationCallbacks) {
    if (opts.before.length)
      opts.before[0].apply(e0, [e0, e0, opts, true]);
    if (opts.after.length)
      opts.after[0].apply(e0, [e0, e0, opts, true]);
  }
  if (opts.next)
    $(opts.next).bind(opts.prevNextEvent,function(){return advance(opts,1)});
  if (opts.prev)
    $(opts.prev).bind(opts.prevNextEvent,function(){return advance(opts,0)});
  if (opts.pager || opts.pagerAnchorBuilder)
    buildPager(els,opts);

  exposeAddSlide(opts, els);

  return opts;
};

// save off original opts so we can restore after clearing state
function saveOriginalOpts(opts) {
  opts.original = { before: [], after: [] };
  opts.original.cssBefore = $.extend({}, opts.cssBefore);
  opts.original.cssAfter  = $.extend({}, opts.cssAfter);
  opts.original.animIn  = $.extend({}, opts.animIn);
  opts.original.animOut   = $.extend({}, opts.animOut);
  $.each(opts.before, function() { opts.original.before.push(this); });
  $.each(opts.after,  function() { opts.original.after.push(this); });
};

function supportMultiTransitions(opts) {
  var i, tx, txs = $.fn.cycle.transitions;
  // look for multiple effects
  if (opts.fx.indexOf(',') > 0) {
    opts.multiFx = true;
    opts.fxs = opts.fx.replace(/\s*/g,'').split(',');
    // discard any bogus effect names
    for (i=0; i < opts.fxs.length; i++) {
      var fx = opts.fxs[i];
      tx = txs[fx];
      if (!tx || !txs.hasOwnProperty(fx) || !$.isFunction(tx)) {
        log('discarding unknown transition: ',fx);
        opts.fxs.splice(i,1);
        i--;
      }
    }
    // if we have an empty list then we threw everything away!
    if (!opts.fxs.length) {
      log('No valid transitions named; slideshow terminating.');
      return false;
    }
  }
  else if (opts.fx == 'all') {  // auto-gen the list of transitions
    opts.multiFx = true;
    opts.fxs = [];
    for (p in txs) {
      tx = txs[p];
      if (txs.hasOwnProperty(p) && $.isFunction(tx))
        opts.fxs.push(p);
    }
  }
  if (opts.multiFx && opts.randomizeEffects) {
    // munge the fxs array to make effect selection random
    var r1 = Math.floor(Math.random() * 20) + 30;
    for (i = 0; i < r1; i++) {
      var r2 = Math.floor(Math.random() * opts.fxs.length);
      opts.fxs.push(opts.fxs.splice(r2,1)[0]);
    }
    debug('randomized fx sequence: ',opts.fxs);
  }
  return true;
};

// provide a mechanism for adding slides after the slideshow has started
function exposeAddSlide(opts, els) {
  opts.addSlide = function(newSlide, prepend) {
    var $s = $(newSlide), s = $s[0];
    if (!opts.autostopCount)
      opts.countdown++;
    els[prepend?'unshift':'push'](s);
    if (opts.els)
      opts.els[prepend?'unshift':'push'](s); // shuffle needs this
    opts.slideCount = els.length;

    $s.css('position','absolute');
    $s[prepend?'prependTo':'appendTo'](opts.$cont);

    if (prepend) {
      opts.currSlide++;
      opts.nextSlide++;
    }

    if (!$.support.opacity && opts.cleartype && !opts.cleartypeNoBg)
      clearTypeFix($s);

    if (opts.fit && opts.width)
      $s.width(opts.width);
    if (opts.fit && opts.height && opts.height != 'auto')
      $s.height(opts.height);
    s.cycleH = (opts.fit && opts.height) ? opts.height : $s.height();
    s.cycleW = (opts.fit && opts.width) ? opts.width : $s.width();

    $s.css(opts.cssBefore);

    if (opts.pager || opts.pagerAnchorBuilder)
      $.fn.cycle.createPagerAnchor(els.length-1, s, $(opts.pager), els, opts);

    if ($.isFunction(opts.onAddSlide))
      opts.onAddSlide($s);
    else
      $s.hide(); // default behavior
  };
}

// reset internal state; we do this on every pass in order to support multiple effects
$.fn.cycle.resetState = function(opts, fx) {
  fx = fx || opts.fx;
  opts.before = []; opts.after = [];
  opts.cssBefore = $.extend({}, opts.original.cssBefore);
  opts.cssAfter  = $.extend({}, opts.original.cssAfter);
  opts.animIn  = $.extend({}, opts.original.animIn);
  opts.animOut   = $.extend({}, opts.original.animOut);
  opts.fxFn = null;
  $.each(opts.original.before, function() { opts.before.push(this); });
  $.each(opts.original.after,  function() { opts.after.push(this); });

  // re-init
  var init = $.fn.cycle.transitions[fx];
  if ($.isFunction(init))
    init(opts.$cont, $(opts.elements), opts);
};

// this is the main engine fn, it handles the timeouts, callbacks and slide index mgmt
function go(els, opts, manual, fwd) {
  // opts.busy is true if we're in the middle of an animation
  if (manual && opts.busy && opts.manualTrump) {
    // let manual transitions requests trump active ones
    debug('manualTrump in go(), stopping active transition');
    $(els).stop(true,true);
    opts.busy = 0;
  }
  // don't begin another timeout-based transition if there is one active
  if (opts.busy) {
    debug('transition active, ignoring new tx request');
    return;
  }

  var p = opts.$cont[0], curr = els[opts.currSlide], next = els[opts.nextSlide];

  // stop cycling if we have an outstanding stop request
  if (p.cycleStop != opts.stopCount || p.cycleTimeout === 0 && !manual)
    return;

  // check to see if we should stop cycling based on autostop options
  if (!manual && !p.cyclePause && !opts.bounce &&
    ((opts.autostop && (--opts.countdown <= 0)) ||
    (opts.nowrap && !opts.random && opts.nextSlide < opts.currSlide))) {
    if (opts.end)
      opts.end(opts);
    return;
  }

  // if slideshow is paused, only transition on a manual trigger
  var changed = false;
  if ((manual || !p.cyclePause) && (opts.nextSlide != opts.currSlide)) {
    changed = true;
    var fx = opts.fx;
    // keep trying to get the slide size if we don't have it yet
    curr.cycleH = curr.cycleH || $(curr).height();
    curr.cycleW = curr.cycleW || $(curr).width();
    next.cycleH = next.cycleH || $(next).height();
    next.cycleW = next.cycleW || $(next).width();

    // support multiple transition types
    if (opts.multiFx) {
      if (fwd && (opts.lastFx == undefined || ++opts.lastFx >= opts.fxs.length))
        opts.lastFx = 0;
      else if (!fwd && (opts.lastFx == undefined || --opts.lastFx < 0))
        opts.lastFx = opts.fxs.length - 1;
      fx = opts.fxs[opts.lastFx];
    }

    // one-time fx overrides apply to:  $('div').cycle(3,'zoom');
    if (opts.oneTimeFx) {
      fx = opts.oneTimeFx;
      opts.oneTimeFx = null;
    }

    $.fn.cycle.resetState(opts, fx);

    // run the before callbacks
    if (opts.before.length)
      $.each(opts.before, function(i,o) {
        if (p.cycleStop != opts.stopCount) return;
        o.apply(next, [curr, next, opts, fwd]);
      });

    // stage the after callacks
    var after = function() {
      opts.busy = 0;
      $.each(opts.after, function(i,o) {
        if (p.cycleStop != opts.stopCount) return;
        o.apply(next, [curr, next, opts, fwd]);
      });
    };

    debug('tx firing('+fx+'); currSlide: ' + opts.currSlide + '; nextSlide: ' + opts.nextSlide);
    
    // get ready to perform the transition
    opts.busy = 1;
    if (opts.fxFn) // fx function provided?
      opts.fxFn(curr, next, opts, after, fwd, manual && opts.fastOnEvent);
    else if ($.isFunction($.fn.cycle[opts.fx])) // fx plugin ?
      $.fn.cycle[opts.fx](curr, next, opts, after, fwd, manual && opts.fastOnEvent);
    else
      $.fn.cycle.custom(curr, next, opts, after, fwd, manual && opts.fastOnEvent);
  }

  if (changed || opts.nextSlide == opts.currSlide) {
    // calculate the next slide
    opts.lastSlide = opts.currSlide;
    if (opts.random) {
      opts.currSlide = opts.nextSlide;
      if (++opts.randomIndex == els.length)
        opts.randomIndex = 0;
      opts.nextSlide = opts.randomMap[opts.randomIndex];
      if (opts.nextSlide == opts.currSlide)
        opts.nextSlide = (opts.currSlide == opts.slideCount - 1) ? 0 : opts.currSlide + 1;
    }
    else if (opts.backwards) {
      var roll = (opts.nextSlide - 1) < 0;
      if (roll && opts.bounce) {
        opts.backwards = !opts.backwards;
        opts.nextSlide = 1;
        opts.currSlide = 0;
      }
      else {
        opts.nextSlide = roll ? (els.length-1) : opts.nextSlide-1;
        opts.currSlide = roll ? 0 : opts.nextSlide+1;
      }
    }
    else { // sequence
      var roll = (opts.nextSlide + 1) == els.length;
      if (roll && opts.bounce) {
        opts.backwards = !opts.backwards;
        opts.nextSlide = els.length-2;
        opts.currSlide = els.length-1;
      }
      else {
        opts.nextSlide = roll ? 0 : opts.nextSlide+1;
        opts.currSlide = roll ? els.length-1 : opts.nextSlide-1;
      }
    }
  }
  if (changed && opts.pager)
    opts.updateActivePagerLink(opts.pager, opts.currSlide, opts.activePagerClass);
  
  // stage the next transition
  var ms = 0;
  if (opts.timeout && !opts.continuous)
    ms = getTimeout(els[opts.currSlide], els[opts.nextSlide], opts, fwd);
  else if (opts.continuous && p.cyclePause) // continuous shows work off an after callback, not this timer logic
    ms = 10;
  if (ms > 0)
    p.cycleTimeout = setTimeout(function(){ go(els, opts, 0, !opts.backwards) }, ms);
};

// invoked after transition
$.fn.cycle.updateActivePagerLink = function(pager, currSlide, clsName) {
   $(pager).each(function() {
       $(this).children().removeClass(clsName).eq(currSlide).addClass(clsName);
   });
};

// calculate timeout value for current transition
function getTimeout(curr, next, opts, fwd) {
  if (opts.timeoutFn) {
    // call user provided calc fn
    var t = opts.timeoutFn.call(curr,curr,next,opts,fwd);
    while (opts.fx != 'none' && (t - opts.speed) < 250) // sanitize timeout
      t += opts.speed;
    debug('calculated timeout: ' + t + '; speed: ' + opts.speed);
    if (t !== false)
      return t;
  }
  return opts.timeout;
};

// expose next/prev function, caller must pass in state
$.fn.cycle.next = function(opts) { advance(opts,1); };
$.fn.cycle.prev = function(opts) { advance(opts,0);};

// advance slide forward or back
function advance(opts, moveForward) {
  var val = moveForward ? 1 : -1;
  var els = opts.elements;
  var p = opts.$cont[0], timeout = p.cycleTimeout;
  if (timeout) {
    clearTimeout(timeout);
    p.cycleTimeout = 0;
  }
  if (opts.random && val < 0) {
    // move back to the previously display slide
    opts.randomIndex--;
    if (--opts.randomIndex == -2)
      opts.randomIndex = els.length-2;
    else if (opts.randomIndex == -1)
      opts.randomIndex = els.length-1;
    opts.nextSlide = opts.randomMap[opts.randomIndex];
  }
  else if (opts.random) {
    opts.nextSlide = opts.randomMap[opts.randomIndex];
  }
  else {
    opts.nextSlide = opts.currSlide + val;
    if (opts.nextSlide < 0) {
      if (opts.nowrap) return false;
      opts.nextSlide = els.length - 1;
    }
    else if (opts.nextSlide >= els.length) {
      if (opts.nowrap) return false;
      opts.nextSlide = 0;
    }
  }

  var cb = opts.onPrevNextEvent || opts.prevNextClick; // prevNextClick is deprecated
  if ($.isFunction(cb))
    cb(val > 0, opts.nextSlide, els[opts.nextSlide]);
  go(els, opts, 1, moveForward);
  return false;
};

function buildPager(els, opts) {
  var $p = $(opts.pager);
  $.each(els, function(i,o) {
    $.fn.cycle.createPagerAnchor(i,o,$p,els,opts);
  });
  opts.updateActivePagerLink(opts.pager, opts.startingSlide, opts.activePagerClass);
};

$.fn.cycle.createPagerAnchor = function(i, el, $p, els, opts) {
  var a;
  if ($.isFunction(opts.pagerAnchorBuilder)) {
    a = opts.pagerAnchorBuilder(i,el);
    debug('pagerAnchorBuilder('+i+', el) returned: ' + a);
  }
  else
    a = '<a href="#">'+(i+1)+'</a>';
    
  if (!a)
    return;
  var $a = $(a);
  // don't reparent if anchor is in the dom
  if ($a.parents('body').length === 0) {
    var arr = [];
    if ($p.length > 1) {
      $p.each(function() {
        var $clone = $a.clone(true);
        $(this).append($clone);
        arr.push($clone[0]);
      });
      $a = $(arr);
    }
    else {
      $a.appendTo($p);
    }
  }

  opts.pagerAnchors =  opts.pagerAnchors || [];
  opts.pagerAnchors.push($a);
  
  var pagerFn = function(e) {
    e.preventDefault();
    opts.nextSlide = i;
    var p = opts.$cont[0], timeout = p.cycleTimeout;
    if (timeout) {
      clearTimeout(timeout);
      p.cycleTimeout = 0;
    }
    var cb = opts.onPagerEvent || opts.pagerClick; // pagerClick is deprecated
    if ($.isFunction(cb))
      cb(opts.nextSlide, els[opts.nextSlide]);
    go(els,opts,1,opts.currSlide < i); // trigger the trans
//    return false; // <== allow bubble
  }
  
  if ( /mouseenter|mouseover/i.test(opts.pagerEvent) ) {
    $a.hover(pagerFn, function(){/* no-op */} );
  }
  else {
    $a.bind(opts.pagerEvent, pagerFn);
  }
  
  if ( ! /^click/.test(opts.pagerEvent) && !opts.allowPagerClickBubble)
    $a.bind('click.cycle', function(){return false;}); // suppress click
  
  var cont = opts.$cont[0];
  var pauseFlag = false; // https://github.com/malsup/cycle/issues/44
  if (opts.pauseOnPagerHover) {
    $a.hover(
      function() { 
        pauseFlag = true;
        cont.cyclePause++; 
        triggerPause(cont,true,true);
      }, function() { 
        pauseFlag && cont.cyclePause--; 
        triggerPause(cont,true,true);
      } 
    );
  }
};

// helper fn to calculate the number of slides between the current and the next
$.fn.cycle.hopsFromLast = function(opts, fwd) {
  var hops, l = opts.lastSlide, c = opts.currSlide;
  if (fwd)
    hops = c > l ? c - l : opts.slideCount - l;
  else
    hops = c < l ? l - c : l + opts.slideCount - c;
  return hops;
};

// fix clearType problems in ie6 by setting an explicit bg color
// (otherwise text slides look horrible during a fade transition)
function clearTypeFix($slides) {
  debug('applying clearType background-color hack');
  function hex(s) {
    s = parseInt(s,10).toString(16);
    return s.length < 2 ? '0'+s : s;
  };
  function getBg(e) {
    for ( ; e && e.nodeName.toLowerCase() != 'html'; e = e.parentNode) {
      var v = $.css(e,'background-color');
      if (v && v.indexOf('rgb') >= 0 ) {
        var rgb = v.match(/\d+/g);
        return '#'+ hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
      }
      if (v && v != 'transparent')
        return v;
    }
    return '#ffffff';
  };
  $slides.each(function() { $(this).css('background-color', getBg(this)); });
};

// reset common props before the next transition
$.fn.cycle.commonReset = function(curr,next,opts,w,h,rev) {
  $(opts.elements).not(curr).hide();
  if (typeof opts.cssBefore.opacity == 'undefined')
    opts.cssBefore.opacity = 1;
  opts.cssBefore.display = 'block';
  if (opts.slideResize && w !== false && next.cycleW > 0)
    opts.cssBefore.width = next.cycleW;
  if (opts.slideResize && h !== false && next.cycleH > 0)
    opts.cssBefore.height = next.cycleH;
  opts.cssAfter = opts.cssAfter || {};
  opts.cssAfter.display = 'none';
  $(curr).css('zIndex',opts.slideCount + (rev === true ? 1 : 0));
  $(next).css('zIndex',opts.slideCount + (rev === true ? 0 : 1));
};

// the actual fn for effecting a transition
$.fn.cycle.custom = function(curr, next, opts, cb, fwd, speedOverride) {
  var $l = $(curr), $n = $(next);
  var speedIn = opts.speedIn, speedOut = opts.speedOut, easeIn = opts.easeIn, easeOut = opts.easeOut;
  $n.css(opts.cssBefore);
  if (speedOverride) {
    if (typeof speedOverride == 'number')
      speedIn = speedOut = speedOverride;
    else
      speedIn = speedOut = 1;
    easeIn = easeOut = null;
  }
  var fn = function() {
    $n.animate(opts.animIn, speedIn, easeIn, function() {
      cb();
    });
  };
  $l.animate(opts.animOut, speedOut, easeOut, function() {
    $l.css(opts.cssAfter);
    if (!opts.sync) 
      fn();
  });
  if (opts.sync) fn();
};

// transition definitions - only fade is defined here, transition pack defines the rest
$.fn.cycle.transitions = {
  fade: function($cont, $slides, opts) {
    $slides.not(':eq('+opts.currSlide+')').css('opacity',0);
    opts.before.push(function(curr,next,opts) {
      $.fn.cycle.commonReset(curr,next,opts);
      opts.cssBefore.opacity = 0;
    });
    opts.animIn     = { opacity: 1 };
    opts.animOut   = { opacity: 0 };
    opts.cssBefore = { top: 0, left: 0 };
  }
};

$.fn.cycle.ver = function() { return ver; };

// override these globally if you like (they are all optional)
$.fn.cycle.defaults = {
  activePagerClass: 'activeSlide', // class name used for the active pager link
  after:       null,  // transition callback (scope set to element that was shown):  function(currSlideElement, nextSlideElement, options, forwardFlag)
  allowPagerClickBubble: false, // allows or prevents click event on pager anchors from bubbling
  animIn:       null,  // properties that define how the slide animates in
  animOut:     null,  // properties that define how the slide animates out
  aspect:       false,  // preserve aspect ratio during fit resizing, cropping if necessary (must be used with fit option)
  autostop:     0,    // true to end slideshow after X transitions (where X == slide count)
  autostopCount: 0,    // number of transitions (optionally used with autostop to define X)
  backwards:     false, // true to start slideshow at last slide and move backwards through the stack
  before:       null,  // transition callback (scope set to element to be shown):   function(currSlideElement, nextSlideElement, options, forwardFlag)
  center:      null,  // set to true to have cycle add top/left margin to each slide (use with width and height options)
  cleartype:     !$.support.opacity,  // true if clearType corrections should be applied (for IE)
  cleartypeNoBg: false, // set to true to disable extra cleartype fixing (leave false to force background color setting on slides)
  containerResize: 1,    // resize container to fit largest slide
  continuous:     0,    // true to start next transition immediately after current one completes
  cssAfter:     null,  // properties that defined the state of the slide after transitioning out
  cssBefore:     null,  // properties that define the initial state of the slide before transitioning in
  delay:       0,    // additional delay (in ms) for first transition (hint: can be negative)
  easeIn:       null,  // easing for "in" transition
  easeOut:     null,  // easing for "out" transition
  easing:       null,  // easing method for both in and out transitions
  end:       null,  // callback invoked when the slideshow terminates (use with autostop or nowrap options): function(options)
  fastOnEvent:   0,    // force fast transitions when triggered manually (via pager or prev/next); value == time in ms
  fit:       0,    // force slides to fit container
  fx:        'fade', // name of transition effect (or comma separated names, ex: 'fade,scrollUp,shuffle')
  fxFn:       null,  // function used to control the transition: function(currSlideElement, nextSlideElement, options, afterCalback, forwardFlag)
  height:      'auto', // container height (if the 'fit' option is true, the slides will be set to this height as well)
  manualTrump:   true,  // causes manual transition to stop an active transition instead of being ignored
  metaAttr:     'cycle',// data- attribute that holds the option data for the slideshow
  next:       null,  // element, jQuery object, or jQuery selector string for the element to use as event trigger for next slide
  nowrap:       0,    // true to prevent slideshow from wrapping
  onPagerEvent:  null,  // callback fn for pager events: function(zeroBasedSlideIndex, slideElement)
  onPrevNextEvent: null,// callback fn for prev/next events: function(isNext, zeroBasedSlideIndex, slideElement)
  pager:       null,  // element, jQuery object, or jQuery selector string for the element to use as pager container
  pagerAnchorBuilder: null, // callback fn for building anchor links:  function(index, DOMelement)
  pagerEvent:    'click.cycle', // name of event which drives the pager navigation
  pause:       0,    // true to enable "pause on hover"
  pauseOnPagerHover: 0, // true to pause when hovering over pager link
  prev:       null,  // element, jQuery object, or jQuery selector string for the element to use as event trigger for previous slide
  prevNextEvent:'click.cycle',// event which drives the manual transition to the previous or next slide
  random:       0,    // true for random, false for sequence (not applicable to shuffle fx)
  randomizeEffects: 1,  // valid when multiple effects are used; true to make the effect sequence random
  requeueOnImageNotLoaded: true, // requeue the slideshow if any image slides are not yet loaded
  requeueTimeout: 250,  // ms delay for requeue
  rev:       0,    // causes animations to transition in reverse (for effects that support it such as scrollHorz/scrollVert/shuffle)
  shuffle:     null,  // coords for shuffle animation, ex: { top:15, left: 200 }
  skipInitializationCallbacks: false, // set to true to disable the first before/after callback that occurs prior to any transition
  slideExpr:     null,  // expression for selecting slides (if something other than all children is required)
  slideResize:   1,     // force slide width/height to fixed size before every transition
  speed:       1000,  // speed of the transition (any valid fx speed value)
  speedIn:     null,  // speed of the 'in' transition
  speedOut:     null,  // speed of the 'out' transition
  startingSlide: 0,    // zero-based index of the first slide to be displayed
  sync:       1,    // true if in/out transitions should occur simultaneously
  timeout:     4000,  // milliseconds between slide transitions (0 to disable auto advance)
  timeoutFn:     null,  // callback for determining per-slide timeout value:  function(currSlideElement, nextSlideElement, options, forwardFlag)
  updateActivePagerLink: null, // callback fn invoked to update the active pager link (adds/removes activePagerClass style)
  width:         null   // container width (if the 'fit' option is true, the slides will be set to this width as well)
};

})(jQuery);


/*!
 * jQuery Cycle Plugin Transition Definitions
 * This script is a plugin for the jQuery Cycle Plugin
 * Examples and documentation at: http://malsup.com/jquery/cycle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version:   2.73
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($) {

//
// These functions define slide initialization and properties for the named
// transitions. To save file size feel free to remove any of these that you
// don't need.
//
$.fn.cycle.transitions.none = function($cont, $slides, opts) {
  opts.fxFn = function(curr,next,opts,after){
    $(next).show();
    $(curr).hide();
    after();
  };
};

// not a cross-fade, fadeout only fades out the top slide
$.fn.cycle.transitions.fadeout = function($cont, $slides, opts) {
  $slides.not(':eq('+opts.currSlide+')').css({ display: 'block', 'opacity': 1 });
  opts.before.push(function(curr,next,opts,w,h,rev) {
    $(curr).css('zIndex',opts.slideCount + (!rev === true ? 1 : 0));
    $(next).css('zIndex',opts.slideCount + (!rev === true ? 0 : 1));
  });
  opts.animIn.opacity = 1;
  opts.animOut.opacity = 0;
  opts.cssBefore.opacity = 1;
  opts.cssBefore.display = 'block';
  opts.cssAfter.zIndex = 0;
};

// scrollUp/Down/Left/Right
$.fn.cycle.transitions.scrollUp = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var h = $cont.height();
  opts.cssBefore.top = h;
  opts.cssBefore.left = 0;
  opts.cssFirst.top = 0;
  opts.animIn.top = 0;
  opts.animOut.top = -h;
};
$.fn.cycle.transitions.scrollDown = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var h = $cont.height();
  opts.cssFirst.top = 0;
  opts.cssBefore.top = -h;
  opts.cssBefore.left = 0;
  opts.animIn.top = 0;
  opts.animOut.top = h;
};
$.fn.cycle.transitions.scrollLeft = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var w = $cont.width();
  opts.cssFirst.left = 0;
  opts.cssBefore.left = w;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.left = 0-w;
};
$.fn.cycle.transitions.scrollRight = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push($.fn.cycle.commonReset);
  var w = $cont.width();
  opts.cssFirst.left = 0;
  opts.cssBefore.left = -w;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.left = w;
};
$.fn.cycle.transitions.scrollHorz = function($cont, $slides, opts) {
  $cont.css('overflow','hidden').width();
  opts.before.push(function(curr, next, opts, fwd) {
    if (opts.rev)
      fwd = !fwd;
    $.fn.cycle.commonReset(curr,next,opts);
    opts.cssBefore.left = fwd ? (next.cycleW-1) : (1-next.cycleW);
    opts.animOut.left = fwd ? -curr.cycleW : curr.cycleW;
  });
  opts.cssFirst.left = 0;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.top = 0;
};
$.fn.cycle.transitions.scrollVert = function($cont, $slides, opts) {
  $cont.css('overflow','hidden');
  opts.before.push(function(curr, next, opts, fwd) {
    if (opts.rev)
      fwd = !fwd;
    $.fn.cycle.commonReset(curr,next,opts);
    opts.cssBefore.top = fwd ? (1-next.cycleH) : (next.cycleH-1);
    opts.animOut.top = fwd ? curr.cycleH : -curr.cycleH;
  });
  opts.cssFirst.top = 0;
  opts.cssBefore.left = 0;
  opts.animIn.top = 0;
  opts.animOut.left = 0;
};

// slideX/slideY
$.fn.cycle.transitions.slideX = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $(opts.elements).not(curr).hide();
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.animIn.width = next.cycleW;
  });
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
  opts.animIn.width = 'show';
  opts.animOut.width = 0;
};
$.fn.cycle.transitions.slideY = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $(opts.elements).not(curr).hide();
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.animIn.height = next.cycleH;
  });
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.height = 0;
  opts.animIn.height = 'show';
  opts.animOut.height = 0;
};

// shuffle
$.fn.cycle.transitions.shuffle = function($cont, $slides, opts) {
  var i, w = $cont.css('overflow', 'visible').width();
  $slides.css({left: 0, top: 0});
  opts.before.push(function(curr,next,opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,true,true);
  });
  // only adjust speed once!
  if (!opts.speedAdjusted) {
    opts.speed = opts.speed / 2; // shuffle has 2 transitions
    opts.speedAdjusted = true;
  }
  opts.random = 0;
  opts.shuffle = opts.shuffle || {left:-w, top:15};
  opts.els = [];
  for (i=0; i < $slides.length; i++)
    opts.els.push($slides[i]);

  for (i=0; i < opts.currSlide; i++)
    opts.els.push(opts.els.shift());

  // custom transition fn (hat tip to Benjamin Sterling for this bit of sweetness!)
  opts.fxFn = function(curr, next, opts, cb, fwd) {
    if (opts.rev)
      fwd = !fwd;
    var $el = fwd ? $(curr) : $(next);
    $(next).css(opts.cssBefore);
    var count = opts.slideCount;
    $el.animate(opts.shuffle, opts.speedIn, opts.easeIn, function() {
      var hops = $.fn.cycle.hopsFromLast(opts, fwd);
      for (var k=0; k < hops; k++)
        fwd ? opts.els.push(opts.els.shift()) : opts.els.unshift(opts.els.pop());
      if (fwd) {
        for (var i=0, len=opts.els.length; i < len; i++)
          $(opts.els[i]).css('z-index', len-i+count);
      }
      else {
        var z = $(curr).css('z-index');
        $el.css('z-index', parseInt(z,10)+1+count);
      }
      $el.animate({left:0, top:0}, opts.speedOut, opts.easeOut, function() {
        $(fwd ? this : curr).hide();
        if (cb) cb();
      });
    });
  };
  $.extend(opts.cssBefore, { display: 'block', opacity: 1, top: 0, left: 0 });
};

// turnUp/Down/Left/Right
$.fn.cycle.transitions.turnUp = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.cssBefore.top = next.cycleH;
    opts.animIn.height = next.cycleH;
    opts.animOut.width = next.cycleW;
  });
  opts.cssFirst.top = 0;
  opts.cssBefore.left = 0;
  opts.cssBefore.height = 0;
  opts.animIn.top = 0;
  opts.animOut.height = 0;
};
$.fn.cycle.transitions.turnDown = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.animIn.height = next.cycleH;
    opts.animOut.top   = curr.cycleH;
  });
  opts.cssFirst.top = 0;
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.height = 0;
  opts.animOut.height = 0;
};
$.fn.cycle.transitions.turnLeft = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.cssBefore.left = next.cycleW;
    opts.animIn.width = next.cycleW;
  });
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
  opts.animIn.left = 0;
  opts.animOut.width = 0;
};
$.fn.cycle.transitions.turnRight = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.animIn.width = next.cycleW;
    opts.animOut.left = curr.cycleW;
  });
  $.extend(opts.cssBefore, { top: 0, left: 0, width: 0 });
  opts.animIn.left = 0;
  opts.animOut.width = 0;
};

// zoom
$.fn.cycle.transitions.zoom = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,false,true);
    opts.cssBefore.top = next.cycleH/2;
    opts.cssBefore.left = next.cycleW/2;
    $.extend(opts.animIn, { top: 0, left: 0, width: next.cycleW, height: next.cycleH });
    $.extend(opts.animOut, { width: 0, height: 0, top: curr.cycleH/2, left: curr.cycleW/2 });
  });
  opts.cssFirst.top = 0;
  opts.cssFirst.left = 0;
  opts.cssBefore.width = 0;
  opts.cssBefore.height = 0;
};

// fadeZoom
$.fn.cycle.transitions.fadeZoom = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,false);
    opts.cssBefore.left = next.cycleW/2;
    opts.cssBefore.top = next.cycleH/2;
    $.extend(opts.animIn, { top: 0, left: 0, width: next.cycleW, height: next.cycleH });
  });
  opts.cssBefore.width = 0;
  opts.cssBefore.height = 0;
  opts.animOut.opacity = 0;
};

// blindX
$.fn.cycle.transitions.blindX = function($cont, $slides, opts) {
  var w = $cont.css('overflow','hidden').width();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    opts.animIn.width = next.cycleW;
    opts.animOut.left   = curr.cycleW;
  });
  opts.cssBefore.left = w;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
  opts.animOut.left = w;
};
// blindY
$.fn.cycle.transitions.blindY = function($cont, $slides, opts) {
  var h = $cont.css('overflow','hidden').height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    opts.animIn.height = next.cycleH;
    opts.animOut.top   = curr.cycleH;
  });
  opts.cssBefore.top = h;
  opts.cssBefore.left = 0;
  opts.animIn.top = 0;
  opts.animOut.top = h;
};
// blindZ
$.fn.cycle.transitions.blindZ = function($cont, $slides, opts) {
  var h = $cont.css('overflow','hidden').height();
  var w = $cont.width();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    opts.animIn.height = next.cycleH;
    opts.animOut.top   = curr.cycleH;
  });
  opts.cssBefore.top = h;
  opts.cssBefore.left = w;
  opts.animIn.top = 0;
  opts.animIn.left = 0;
  opts.animOut.top = h;
  opts.animOut.left = w;
};

// growX - grow horizontally from centered 0 width
$.fn.cycle.transitions.growX = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true);
    opts.cssBefore.left = this.cycleW/2;
    opts.animIn.left = 0;
    opts.animIn.width = this.cycleW;
    opts.animOut.left = 0;
  });
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
};
// growY - grow vertically from centered 0 height
$.fn.cycle.transitions.growY = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false);
    opts.cssBefore.top = this.cycleH/2;
    opts.animIn.top = 0;
    opts.animIn.height = this.cycleH;
    opts.animOut.top = 0;
  });
  opts.cssBefore.height = 0;
  opts.cssBefore.left = 0;
};

// curtainX - squeeze in both edges horizontally
$.fn.cycle.transitions.curtainX = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,false,true,true);
    opts.cssBefore.left = next.cycleW/2;
    opts.animIn.left = 0;
    opts.animIn.width = this.cycleW;
    opts.animOut.left = curr.cycleW/2;
    opts.animOut.width = 0;
  });
  opts.cssBefore.top = 0;
  opts.cssBefore.width = 0;
};
// curtainY - squeeze in both edges vertically
$.fn.cycle.transitions.curtainY = function($cont, $slides, opts) {
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,false,true);
    opts.cssBefore.top = next.cycleH/2;
    opts.animIn.top = 0;
    opts.animIn.height = next.cycleH;
    opts.animOut.top = curr.cycleH/2;
    opts.animOut.height = 0;
  });
  opts.cssBefore.height = 0;
  opts.cssBefore.left = 0;
};

// cover - curr slide covered by next slide
$.fn.cycle.transitions.cover = function($cont, $slides, opts) {
  var d = opts.direction || 'left';
  var w = $cont.css('overflow','hidden').width();
  var h = $cont.height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts);
    if (d == 'right')
      opts.cssBefore.left = -w;
    else if (d == 'up')
      opts.cssBefore.top = h;
    else if (d == 'down')
      opts.cssBefore.top = -h;
    else
      opts.cssBefore.left = w;
  });
  opts.animIn.left = 0;
  opts.animIn.top = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.left = 0;
};

// uncover - curr slide moves off next slide
$.fn.cycle.transitions.uncover = function($cont, $slides, opts) {
  var d = opts.direction || 'left';
  var w = $cont.css('overflow','hidden').width();
  var h = $cont.height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,true,true);
    if (d == 'right')
      opts.animOut.left = w;
    else if (d == 'up')
      opts.animOut.top = -h;
    else if (d == 'down')
      opts.animOut.top = h;
    else
      opts.animOut.left = -w;
  });
  opts.animIn.left = 0;
  opts.animIn.top = 0;
  opts.cssBefore.top = 0;
  opts.cssBefore.left = 0;
};

// toss - move top slide and fade away
$.fn.cycle.transitions.toss = function($cont, $slides, opts) {
  var w = $cont.css('overflow','visible').width();
  var h = $cont.height();
  opts.before.push(function(curr, next, opts) {
    $.fn.cycle.commonReset(curr,next,opts,true,true,true);
    // provide default toss settings if animOut not provided
    if (!opts.animOut.left && !opts.animOut.top)
      $.extend(opts.animOut, { left: w*2, top: -h/2, opacity: 0 });
    else
      opts.animOut.opacity = 0;
  });
  opts.cssBefore.left = 0;
  opts.cssBefore.top = 0;
  opts.animIn.left = 0;
};

// wipe - clip animation
$.fn.cycle.transitions.wipe = function($cont, $slides, opts) {
  var w = $cont.css('overflow','hidden').width();
  var h = $cont.height();
  opts.cssBefore = opts.cssBefore || {};
  var clip;
  if (opts.clip) {
    if (/l2r/.test(opts.clip))
      clip = 'rect(0px 0px '+h+'px 0px)';
    else if (/r2l/.test(opts.clip))
      clip = 'rect(0px '+w+'px '+h+'px '+w+'px)';
    else if (/t2b/.test(opts.clip))
      clip = 'rect(0px '+w+'px 0px 0px)';
    else if (/b2t/.test(opts.clip))
      clip = 'rect('+h+'px '+w+'px '+h+'px 0px)';
    else if (/zoom/.test(opts.clip)) {
      var top = parseInt(h/2,10);
      var left = parseInt(w/2,10);
      clip = 'rect('+top+'px '+left+'px '+top+'px '+left+'px)';
    }
  }

  opts.cssBefore.clip = opts.cssBefore.clip || clip || 'rect(0px 0px 0px 0px)';

  var d = opts.cssBefore.clip.match(/(\d+)/g);
  var t = parseInt(d[0],10), r = parseInt(d[1],10), b = parseInt(d[2],10), l = parseInt(d[3],10);

  opts.before.push(function(curr, next, opts) {
    if (curr == next) return;
    var $curr = $(curr), $next = $(next);
    $.fn.cycle.commonReset(curr,next,opts,true,true,false);
    opts.cssAfter.display = 'block';

    var step = 1, count = parseInt((opts.speedIn / 13),10) - 1;
    (function f() {
      var tt = t ? t - parseInt(step * (t/count),10) : 0;
      var ll = l ? l - parseInt(step * (l/count),10) : 0;
      var bb = b < h ? b + parseInt(step * ((h-b)/count || 1),10) : h;
      var rr = r < w ? r + parseInt(step * ((w-r)/count || 1),10) : w;
      $next.css({ clip: 'rect('+tt+'px '+rr+'px '+bb+'px '+ll+'px)' });
      (step++ <= count) ? setTimeout(f, 13) : $curr.css('display', 'none');
    })();
  });
  $.extend(opts.cssBefore, { display: 'block', opacity: 1, top: 0, left: 0 });
  opts.animIn     = { left: 0 };
  opts.animOut   = { left: 0 };
};

})(jQuery);/**
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery); /*
 * TipTip
 * Copyright 2010 Drew Wilson
 * www.drewwilson.com
 * code.drewwilson.com/entry/tiptip-jquery-plugin
 *
 * Version 1.3   -   Updated: Mar. 23, 2010
 *
 * This Plug-In will create a custom tooltip to replace the default
 * browser tooltip. It is extremely lightweight and very smart in
 * that it detects the edges of the browser window and will make sure
 * the tooltip stays within the current window size. As a result the
 * tooltip will adjust itself to be displayed above, below, to the left 
 * or to the right depending on what is necessary to stay within the
 * browser window. It is completely customizable as well via CSS.
 *
 * This TipTip jQuery plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($){$.fn.tipTip=function(options){var defaults={activation:"hover",keepAlive:false,maxWidth:"200px",edgeOffset:3,defaultPosition:"bottom",delay:400,fadeIn:200,fadeOut:200,attribute:"title",content:false,enter:function(){},exit:function(){}};var opts=$.extend(defaults,options);if($("#tiptip_holder").length<=0){var tiptip_holder=$('<div id="tiptip_holder" style="max-width:'+opts.maxWidth+';"></div>');var tiptip_content=$('<div id="tiptip_content"></div>');var tiptip_arrow=$('<div id="tiptip_arrow"></div>');$("body").append(tiptip_holder.html(tiptip_content).prepend(tiptip_arrow.html('<div id="tiptip_arrow_inner"></div>')))}else{var tiptip_holder=$("#tiptip_holder");var tiptip_content=$("#tiptip_content");var tiptip_arrow=$("#tiptip_arrow")}return this.each(function(){var org_elem=$(this);if(opts.content){var org_title=opts.content}else{var org_title=org_elem.attr(opts.attribute)}if(org_title!=""){if(!opts.content){org_elem.removeAttr(opts.attribute)}var timeout=false;if(opts.activation=="hover"){org_elem.hover(function(){active_tiptip()},function(){if(!opts.keepAlive){deactive_tiptip()}});if(opts.keepAlive){tiptip_holder.hover(function(){},function(){deactive_tiptip()})}}else if(opts.activation=="focus"){org_elem.focus(function(){active_tiptip()}).blur(function(){deactive_tiptip()})}else if(opts.activation=="click"){org_elem.click(function(){active_tiptip();return false}).hover(function(){},function(){if(!opts.keepAlive){deactive_tiptip()}});if(opts.keepAlive){tiptip_holder.hover(function(){},function(){deactive_tiptip()})}}function active_tiptip(){opts.enter.call(this);tiptip_content.html(org_title);tiptip_holder.hide().removeAttr("class").css("margin","0");tiptip_arrow.removeAttr("style");var top=parseInt(org_elem.offset()['top']);var left=parseInt(org_elem.offset()['left']);var org_width=parseInt(org_elem.outerWidth());var org_height=parseInt(org_elem.outerHeight());var tip_w=tiptip_holder.outerWidth();var tip_h=tiptip_holder.outerHeight();var w_compare=Math.round((org_width-tip_w)/2);var h_compare=Math.round((org_height-tip_h)/2);var marg_left=Math.round(left+w_compare);var marg_top=Math.round(top+org_height+opts.edgeOffset);var t_class="";var arrow_top="";var arrow_left=Math.round(tip_w-12)/2;if(opts.defaultPosition=="bottom"){t_class="_bottom"}else if(opts.defaultPosition=="top"){t_class="_top"}else if(opts.defaultPosition=="left"){t_class="_left"}else if(opts.defaultPosition=="right"){t_class="_right"}var right_compare=(w_compare+left)<parseInt($(window).scrollLeft());var left_compare=(tip_w+left)>parseInt($(window).width());if((right_compare&&w_compare<0)||(t_class=="_right"&&!left_compare)||(t_class=="_left"&&left<(tip_w+opts.edgeOffset+5))){t_class="_right";arrow_top=Math.round(tip_h-13)/2;arrow_left=-12;marg_left=Math.round(left+org_width+opts.edgeOffset);marg_top=Math.round(top+h_compare)}else if((left_compare&&w_compare<0)||(t_class=="_left"&&!right_compare)){t_class="_left";arrow_top=Math.round(tip_h-13)/2;arrow_left=Math.round(tip_w);marg_left=Math.round(left-(tip_w+opts.edgeOffset+5));marg_top=Math.round(top+h_compare)}var top_compare=(top+org_height+opts.edgeOffset+tip_h+8)>parseInt($(window).height()+$(window).scrollTop());var bottom_compare=((top+org_height)-(opts.edgeOffset+tip_h+8))<0;if(top_compare||(t_class=="_bottom"&&top_compare)||(t_class=="_top"&&!bottom_compare)){if(t_class=="_top"||t_class=="_bottom"){t_class="_top"}else{t_class=t_class+"_top"}arrow_top=tip_h;marg_top=Math.round(top-(tip_h+5+opts.edgeOffset))}else if(bottom_compare|(t_class=="_top"&&bottom_compare)||(t_class=="_bottom"&&!top_compare)){if(t_class=="_top"||t_class=="_bottom"){t_class="_bottom"}else{t_class=t_class+"_bottom"}arrow_top=-12;marg_top=Math.round(top+org_height+opts.edgeOffset)}if(t_class=="_right_top"||t_class=="_left_top"){marg_top=marg_top+5}else if(t_class=="_right_bottom"||t_class=="_left_bottom"){marg_top=marg_top-5}if(t_class=="_left_top"||t_class=="_left_bottom"){marg_left=marg_left+5}tiptip_arrow.css({"margin-left":arrow_left+"px","margin-top":arrow_top+"px"});tiptip_holder.css({"margin-left":marg_left+"px","margin-top":marg_top+"px"}).attr("class","tip"+t_class);if(timeout){clearTimeout(timeout)}timeout=setTimeout(function(){tiptip_holder.stop(true,true).fadeIn(opts.fadeIn)},opts.delay)}function deactive_tiptip(){opts.exit.call(this);if(timeout){clearTimeout(timeout)}tiptip_holder.fadeOut(opts.fadeOut)}}})}})(jQuery);
$(document).ready (function () {
    (function(jQuery){
	//	inspired by DISQUS
	jQuery.oauthpopup = function(options)
	{
		options.windowName = options.windowName || 'ConnectWithOAuth'; // should not include space for IE
		options.windowOptions = options.windowOptions || 'location=0,width=800,height=500';
		options.callback = options.callback || function(){ window.location.reload(); };
		var that = this;

		that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
		that._oauthInterval = window.setInterval(function(){
			if (that._oauthWindow.closed) {
				window.clearInterval(that._oauthInterval);
				options.callback();
			}
		}, 1000);
	};
})(jQuery);
function ComCount(){
     var n = 0;
     $('.comment').each(function(){
         n++;
     });
     return n;
} 
   
function enableCommentButtons() {
    if($.cookie('melissa_display_name') && $.cookie('melissa_user_name') && $.cookie('melissa_avatar')) {
        $('#comment-header').hide();
        $('#comment-footer').hide();
        $('.comment-header-button').show();
        m = ComCount();
        if (m > 3) {
            $('.comment-footer-button').show();
        } else {
            $('.comment-footer-button').hide();
        }
    } else {
        $('#comment-header').show();
        m = ComCount();
        if (m > 3) {
             $('#comment-footer').show();
        } else {
             $('#comment-footer').hide();
        }
        $('.comment-header-button').hide();
        $('.comment-footer-button').hide();
    }
}

var m = 0;
enableCommentButtons();

    $('.comment-report').live('click', function (event) {
        event.preventDefault();
        var id = $(this).metadata().id;
        ConfirmDialog (
                "Report Comment",
                "Are you sure you would like to report this comment to a moderator?",
            {
                ok : "Yes",
                cancel : "No",
                onConfirm : function () { window.location = "/report/en/comment/" + id; }
            }
        );
    });

$('.comment-button .btn, .comment-button .button, .comment-reply').live('click', function (event) {
    event.preventDefault();
    var comment_id = $(this).parent('.comment-button').attr('id');
    var settings = comment_id.split("-");
    var item_type = settings[0];
    var item_id = settings[1];
    var parent = settings[2];
    var language = settings[3];
    var parent_author = settings[4];
    var page = location.pathname;
    $('#comment-form-'+parent).show();
    $('#comment-form-'+parent).html('<div class="loading">&nbsp;</div>');
    $('#comment-form-'+parent).load ("/themes/default/ajax/ajax.comment.form.php", { parent: parent, item_id : item_id, item_type : item_type , page : page, language : language, parent_author : parent_author}, function (response, status) {
        if(status == 'error') {
            $('#comment-form-'+parent).hide();
            var url = encodeURIComponent(window.location.pathname);
            if(response=='revoked') {
                window.location.replace("/melissa/site/en/signin/?e=8&redirect="+url);
            } else {
                window.location.replace("/melissa/site/en/signin/?redirect="+url);
            }
        }
    });
    $(this).parent('.comment-button').toggle();
});

$('.comment-cancel-button').live("click", function () {
    var comment_id = this.id;
    var settings = comment_id.split("-");
    var item_type = settings[3];
    var item_id = settings[4];
    var parent = settings[5];
    var language = settings[6];
    var parent_author = settings[7];
    $('#comment-form-'+parent).hide();
    $('#comment-form-'+parent).html('');
    $('#'+item_type+'-'+item_id+'-'+parent+'-'+language+'-'+parent_author).toggle();
});

$(".inline-authorize-twitter").live("click", function(event) {
    event.preventDefault();
    $.oauthpopup({
        path: '/themes/default/ajax/twitter.oauth.connect.php?l=en',
        callback: function(){
            $.ajax({
                type:"GET",
                url:"/themes/default/ajax/twitter.oauth.check.php",
                data:{ l: 'en' },
                success: function(data) {
                    if(data.ok == true) {
                        $(".comment-form-social-options .twitter").html('<label class="inline" for="post_comment_to_twitter">Post comment to Twitter</label>&nbsp;<input id="post_comment_to_twitter" type="checkbox" name="post_comment_to_twitter" value="1" checked="checked"><br /><small>You can use @replies if posting to Twitter</small>');
                        $(".comment-form-social-options .twitter").effect("highlight", {}, 2000);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    $(".comment-form-social-options .twitter").effect("highlight", {color:'red'}, 2000);
                },
                dataType: 'json'
            });
        }
    });
});

    (function ($) {
        function loadComments(commentButton, scrollToHash) {
            // Only call loadComments once via $(window).scroll()
            $(window).unbind('scroll', commentScroll);
            
            // If the comments-loading div no longer exists do not load comments
            if ($('#comments-loading').length <= 0) {
                return false;
            }

            if ($('#comments-loading-notice').length <= 0) {
                $('#comments-loading').after('<div id="comments-loading-notice" class="loading"></div>');
            }

            $('#comments-load').hide();

            $.metadata.setType('html5');
            var data = $('body').metadata();
            // Set metadata back to class for older scripts using class
            $.metadata.setType('class');

            $.ajax({
                url: '/themes/default/ajax/ajax.comments.thread.php',
                type: 'POST',
                data: {
                    'item_uid': data.uid,
                    'item_type': data.type,
                    'language': data.language,
                    'template': data.template
                },
                success: function(data, textStatus, jqXHR) {
                    $('#comments-loading').replaceWith(data);
                    enableCommentButtons();
                    if (commentButton) {
                        commentButton.parent('.comment-button').hide();
                    }
                    if (scrollToHash) {
                        var hash = window.location.hash;
                        window.scrollTo(0, $(hash).offset().top);
                    }

                    if ($.fn.tipTip) {
                        $(".comment-annotation-image").tipTip({
                            activation: "hover",
                            maxWidth: "79px",
                            edgeOffset: 0,
                            defaultPosition: "top",
                            attribute: "data-thumb"
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if($('#comments-loading .error-box').length <= 0) {
                        $('#comments-loading').append('<div class="error-box" style="clear:both">Error loading comments: ' + jqXHR.status + ' - ' + errorThrown + '</div>');
                    } else {
                        $('#comments-loading .error-box').html('Error loading comments: ' + jqXHR.status + ' - ' + errorThrown);
                    }
                    $('#comments-load').show();
                },
                complete: function(jqXHR, textStatus) {
                    $('#comments-loading-notice').remove();
                },
                dataType: 'html'
            });
        }

        var commentScroll = function () {
            var scrollHeight = $(window).scrollTop();

            // Since we can't scroll the lenght of what is already shown in the window, subtract window height from document height to get our remaining scroll length
            var scrollLength = docHeight - winHeight;

            // Set load point to be 50% of scrollLength
            // This means comments will load after scrolling past 50% of the remaining unseen document
            // e.g. remaining scrollLength = 10. When scrolling 5px comments will load.
            // e.g. remaining scrollLength = 4300. When scrolling 2150px comments will load.
            loadPoint = scrollLength / 2;

            if (scrollHeight >= loadPoint) {
                loadComments();
            }
        }

        // Run only if comments-loading div exists
        if ($('#comments-loading').length > 0) {
            // If visiting a comment anchor then load comments asap
            if (window.location.hash.indexOf('comment-') != -1 || window.location.hash.indexOf('c') == 1) {
                loadComments(false, true);
            } else {
                var docHeight = $(document).height();
                var winHeight = $(window).height();

                // If docHeight is greater than winHeight then postpone loading of comments
                if (docHeight > winHeight) {
                    $(window).scroll(commentScroll);
                } else {
                    // The document is smaller than the window, so load comments instantly 
                    loadComments();
                }
            }

            $('.image-annotate-canvas .image-annotate-view .image-annotate-area a').live('click', function(event) {
                window.scrollTo(0, $('#comments').offset().top);
                window.location.hash = $(this).attr('href');
                loadComments(false, true);
            });
        }

        $('.comment-button .btn, .comment-button .button').click(function (event) {
            event.preventDefault();
            if ($('#comments-loading').length > 0) {
                loadComments($(this));
            }
        });

        $('#comments-load').click(function(event) {
            event.preventDefault();
            loadComments();
        });
    }(jQuery));

    if($("#mg-blanket-banner-close").length) {
        var blanketbannercookiename = $("#mg-blanket-banner-close").metadata().name;
        if(!$.cookie("blanketbanner") || ($.cookie("blanketbanner") && $.cookie("blanketbanner") != blanketbannercookiename))
        {
            $("#mg-blanket-banner").show();
        }

        $("#mg-blanket-banner-close").click(function(event) {
            event.preventDefault();
            var cookiename = $(this).metadata().name;
            $("#mg-blanket-banner").slideUp("slow");
            $.cookie("blanketbanner", cookiename, { expires: 360, path: '/'});
        });
    }

    //var header_search_value = '';
    var header_search_width = $("#header-search-input").css("width");
    var header_search_padding_left = $("#header-search-input").css("padding-left");
    $("#header-search-input").focus(function() {
        //$(this).val(header_search_value);
        $(this).animate({ width: '200px', 'padding-left': '32px' }, "slow");
    });

    $("#header-search-input").blur(function() {
        //header_search_value = $(this).val();
        $(this).val('');
        $(this).animate({ width: header_search_width, 'padding-left': header_search_padding_left }, "slow");
    });

    $("#header-search-form").validate({
        errorPlacement: function(error, element) {
            // Do nothing
        },
        errorClass: "",
        submitHandler: function(form) {
            form.submit();
        }
    });

    $('#mg-logo-menu').css('bottom', "-" + $("#mg-logo-menu").height() + "px");

    $('.main-logo').hoverIntent({
        over: function () {
          var dropdown = $("#mg-logo-menu");
          dropdown.css("bottom", "-" + (dropdown.height() - 10) + "px");
          dropdown.animate({
            "bottom": "-" + (dropdown.height()) + "px",
            "opacity": "toggle"
          }, 250);
        },
        timeout: 200,
        interval: 30,
        out: function () {
          var dropdown = $("#mg-logo-menu");
          dropdown.animate({
            "bottom": "-" + (dropdown.height() + (10*4))+"px",
            "opacity": "toggle"
          }, 400, function() {
            dropdown.css("bottom", "-" + (dropdown.height() - 10) + "px");
          });
        }
    });
});

$(window).load(function() {
  $("html").css("background-image", "none");
});
