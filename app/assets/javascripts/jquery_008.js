/*

uSquare 1.0 - Universal Responsive Grid

Copyright (c) 2012 Br0 (shindiristudio.com)

Project site: http://codecanyon.net/
Project demo: http://shindiristudio.com/usquare/

*/

(function($) {

    function uSquareItem(element, options) {
        this.$item = $(element);
		this.$parent = options.$parent;
		this.parent_this = options.parent_this;
		this.options = options;
        this.$trigger = this.$(options.trigger);
        this.$close = this.$('.close');
        this.$info = this.$(options.moreInfo);
		this.$trigger_text = this.$trigger.find('.usquare_square_text_wrapper');
		this.$image = this.$item.find('img.usquare_square');
		this.$image_parent = this.$image.parent();
		this.linked_image=0;
		if (this.$image_parent.is('a'))
		{
			var opened_only = this.$image_parent.attr('data-only-open');
			this.image_parent_opened_only=0;
			if (typeof opened_only != 'undefined')
			{
				this.image_parent_opened_only=1;
				this.image_parent_href=this.$image_parent.attr('data-href');
				this.image_parent_rel=this.$image_parent.attr('data-rel');
				this.image_parent_target=this.$image_parent.attr('data-target');
			}
			this.linked_image=1;
		}
		this.image_clicked=0;
		this.$usquare_about = this.$info.find('.usquare_about');

		this.$image.click ($.proxy(this.image_click, this));
		this.$trigger.click($.proxy(this.show, this));
        this.$close.click($.proxy(this.close, this));
        options.$overlay.click($.proxy(this.close, this));
    };
    uSquareItem.prototype = {
        image_click: function(e) {
			if (this.linked_image==1) {
				this.image_clicked=1;
			}
		},
        show: function(e) {
			var skip_prevent=0;
			if (this.linked_image==1 && this.image_clicked==1) {
				if (this.image_parent_opened_only==0) if (this.$image_parent.attr('rel')=='') {
					if (!this.$item.data('showed')) this.parent_this.overlayHide();
					this.$parent.data('in_trans', 0);
					this.image_clicked=0;
					return;
				}
				if (this.image_parent_opened_only==1) skip_prevent=1;
			}
			
			if (skip_prevent==0) e.preventDefault();

			if (!this.$parent.data('in_trans'))
			{
				if (!this.$item.data('showed'))
				{
					this.$parent.data('in_trans', 1);
					this.$item.data('showed', 1);
					if (this.options.before_item_opening_callback) this.options.before_item_opening_callback(this.$item);
					var item_position = this.$item.position();
					var trigger_text_position;
					var this_backup=this;
					var moving=0;
					if (item_position.top>0) // && this.$parent.width()>=640)
					{
						var parent_position=this.$parent.offset();
						var parent_top = parent_position.top;
						var non_visible_area=$(window).scrollTop()-parent_top;
						var going_to=item_position.top;
						if (non_visible_area>0)
						{
							var non_visible_row=Math.floor(non_visible_area/this.$item.height())+1;
							going_to=this.$item.height()*non_visible_row;
							going_to=item_position.top-going_to;
						}
						if (going_to>0) moving=1;						
						
						if (moving)
						{
							this.$item.data('moved', going_to);
							var top_string='-'+going_to+'px';
							var speed=this.options.opening_speed+(going_to/160)*100;
							this.$item.animate({top: top_string}, speed, this.options.easing, function(){
								trigger_text_position = this_backup.$item.height() - this_backup.$trigger_text.height();
								this_backup.$trigger_text.data('top', trigger_text_position);
								this_backup.$trigger_text.css('top', trigger_text_position);
								this_backup.$trigger_text.css('bottom', 'auto');
								this_backup.$trigger_text.animate({'top': 0}, 'slow');
							});
						}
					}
					if (!moving)
					{
						trigger_text_position = this_backup.$item.height() - this_backup.$trigger_text.height();
						this_backup.$trigger_text.data('top', trigger_text_position);
						this_backup.$trigger_text.css('top', trigger_text_position);
						this_backup.$trigger_text.css('bottom', 'auto');
						this_backup.$trigger_text.animate({'top': 0}, 'slow');
					}
		            this.$item.addClass('usquare_block_selected');
					var height_backup=this.$info.css('height');
					this.$info.css('height', 0);
					this.$info.show();
					//this.$usquare_about.tinyscrollbar();
					if (typeof this_backup.open_counter == 'undefined') this_backup.open_counter=0;
					this_backup.open_counter++;
					if (this_backup.open_counter==1) this_backup.$usquare_about.tinyscrollbar();
					else this_backup.$usquare_about.tinyscrollbar_update();
					
					if (this.options.before_info_rolling_callback) this.options.before_info_rolling_callback(this.$item);
					this.$info.animate({height:height_backup}, 'slow', this.options.easing, function()
					{
						this_backup.$parent.data('in_trans', 0);
						if (this_backup.options.after_info_rolling_callback) this_backup.options.after_info_rolling_callback(this_backup.$item);
						
						if (this_backup.linked_image==1 && this_backup.image_parent_opened_only==1) {
							this_backup.$image_parent.attr('href', this_backup.image_parent_href);
							this_backup.$image_parent.attr('rel', this_backup.image_parent_rel);
							this_backup.$image_parent.attr('target', this_backup.image_parent_target);
						}
					});
				}
			}
        },
        close: function(e) {
            e.preventDefault();
			this.image_clicked=0;

			if (!this.$parent.data('in_trans'))
			{
				if (this.$item.data('showed'))
				{
					var this_backup=this;
					if (this_backup.linked_image==1 && this_backup.image_parent_opened_only==1) {
						this_backup.$image_parent.attr('href', '#');
						this_backup.$image_parent.removeAttr('rel');
						this_backup.$image_parent.removeAttr('target');
					}
		            this.$info.hide();
					var trigger_text_position_top = this_backup.$item.height() - this_backup.$trigger_text.height();
					this_backup.$item.removeClass('usquare_block_selected');							
					if (this.$item.data('moved'))
					{
						var top_backup=this.$item.data('moved');
						var speed=this.options.closing_speed+(top_backup/160)*100;
						this.$item.data('moved', 0);
						this.$item.animate({'top': 0}, speed, this.options.easing, function()
						{
							this_backup.$trigger_text.animate({'top': trigger_text_position_top}, 'slow');
						});
					}
					else
					{
						this_backup.$trigger_text.animate({'top': trigger_text_position_top}, 'slow');
					}
					this.$item.data('showed', 0);
				}
			}
        },
        $: function (selector) {
            return this.$item.find(selector);
        }
    };

    function uSquare(element, options) {
        var self = this;
        this.options = $.extend({}, $.fn.uSquare.defaults, options);
        this.$element = $(element);
        this.$overlay = this.$('.usquare_module_shade');
        this.$items = this.$(this.options.block);
        this.$triggers = this.$(this.options.trigger);
        this.$closes = this.$('.close');
   
        this.$triggers.click($.proxy(this.overlayShow, this));
        this.$closes.click ($.proxy(this.overlayHide, this));
        this.$overlay.click($.proxy(this.overlayHide, this));

        $.each( this.$items, function(i, element) {
            new uSquareItem(element, $.extend(self.options, {$overlay: self.$overlay, $parent: self.$element, parent_this: self }) );
        });
    };

    uSquare.prototype = {
        $: function (selector) {
            return this.$element.find(selector);
        },
        overlayShow: function() {
            this.$overlay.fadeIn('slow', function(){
				$(this).css({opacity : 0.5});
			})
        },
        overlayHide: function() {
			if (!this.$element.data('in_trans'))
			{
				this.$overlay.fadeOut('slow');
			}
        }
    };

    $.fn.uSquare = function ( option ) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('tooltip'),
                options = typeof option == 'object' && option;

            data || $this.data('tooltip', (data = new uSquare(this, options)));
            (typeof option == 'string') && data[option]();
        });
    };

    $.fn.uSquare.Constructor = uSquare;
    $.fn.uSquare.defaults = {
        block:     '.usquare_block',
        trigger:   '.usquare_square',
        moreInfo:  '.usquare_block_extended',
		opening_speed:				300,
		closing_speed:					500,
		easing:							'swing',
		before_item_opening_callback:	null,
		before_info_rolling_callback:	null,
		after_info_rolling_callback:	null
    };

	$(window).load(function() {
		// $(".usquare_about").tinyscrollbar(); //mCustomScrollbar();
	});

})(jQuery);