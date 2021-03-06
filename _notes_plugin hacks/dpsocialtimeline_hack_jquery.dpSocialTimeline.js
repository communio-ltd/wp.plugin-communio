/*
 * jQuery DP Social Timeline v1.8.3
 *
 * Copyright 2012, Diego Pereyra
 *
 * @Web: http://www.dpereyra.com
 * @Email: info@dpereyra.com
 *
 * Depends:
 * jquery.js
 */

(function ($) {
	function SocialTimeline(element, options) {
		this.timeline = $(element);
		
		/* Setting vars*/
		this.settings = $.extend({}, $.fn.dpSocialTimeline.defaults, options);  
		var feeds = this.settings.feeds;
		var custom = this.settings.custom;
		this.feeds = new Array();
		this.custom = new Array();
		this.social= new Array();
		var p;
		
		this.is_iOS = false,
			p = navigator.platform;
		
		if( p === 'iPad' || p === 'iPhone' || p === 'iPod' ){
			this.is_iOS = true;
		}

		this.timeline_id = "";
		
		for (x in this.settings.feeds)
		{
			this.feeds[x+'_arr'] = feeds[x].data.split(',');
			if(typeof feeds[x].limit !== 'undefined') {
				try{ if(isNaN(feeds[x].limit)) {this.feeds[x+'_limit'] = feeds[x].limit.split(',');} else { this.feeds[x+'_limit'] = feeds[x].limit; } }catch(err){}
			}
			if(typeof this.feeds[x+'_limit'] === 'undefined') { this.feeds[x+'_limit'] = 0; }
			this.feeds[x+'_url'] = new Array();
			this.timeline_id += this.feeds[x+'_arr'];
		}
		
		for (x in this.settings.custom)
		{
			this.custom[x+'_url'] = new Array(custom[x].url);
			this.custom[x+'_name'] = new Array(custom[x].name);
			this.custom[x+'_icon'] = new Array(custom[x].icon);
			this.custom[x+'_limit'] = custom[x].limit;
			
			this.social.push({ 	
				name: this.custom[x+'_name'],
				url: this.custom[x+'_url'],
				id: x,
				icon: this.custom[x+'_icon'],
				limit: this.custom[x+'_limit']
			});
			
			this.timeline_id += this.custom[x+'_url'];
		}
		
		this.totalFeeds = 0;
		this.resizeTimer;
		this.nameFeeds = new Array();
		this.iconFeeds = new Array();
		this.limitFeeds = new Array();
		this.item = new Array();
		this.settings.itemWidthOrig = this.settings.itemWidth;
		
		var loc = new String(window.document.location); 
		if (loc.indexOf("https://")!= -1) 
			this.prefix = "https://"; 
		else 
			this.prefix = "http://";
		
		switch(this.settings.layoutMode) {
			case 'timeline':
				/*if(typeof $.Isotope == "undefined") {
					this.settings.layoutMode = 'masonry';
					if(this.settings.columnsItemWidth != "") {
						this.settings.itemWidth = this.settings.columnsItemWidth;
					}
				} else {*/
					this.settings.layoutMode = 'spineAlign';
					if(this.settings.timelineItemWidth != "") {
						this.settings.itemWidth = this.settings.timelineItemWidth;
					}					
				//}
				break;	
			case 'columns':
				this.settings.layoutMode = 'masonry';
				if(this.settings.columnsItemWidth != "") {
					this.settings.itemWidth = this.settings.columnsItemWidth;
				}
				break;	
			case 'one_column':
				this.settings.layoutMode = typeof $.Isotope == "undefined" ? 'vertical' : 'vertical';
				if(this.settings.oneColumnItemWidth != "") {
					this.settings.itemWidth = this.settings.oneColumnItemWidth;
				}
				break;	
		}
		this.lastLayout = this.settings.layoutMode;
		this.timeline.addClass(this.settings.skin);
		
		this.init();
	}
	
	SocialTimeline.prototype = {
		init : function(){ 
			var self = this;
			if(this.feeds['twitter_arr']) {

				for(var i = 0; i < this.feeds['twitter_arr'].length; i++) {
					this.feeds['twitter_url'][i] = $.trim(this.feeds['twitter_arr'][i])+'&t='+new Date().getTime();
				}
				
				this.social.push({ 	name: this.feeds['twitter_arr'],
					url: this.feeds['twitter_url'],
					id: 'twitter',
					icon: '',
					limit: this.feeds['twitter_limit']
				});
			}
			
			if(this.feeds['twitter_hash_arr']) {
				for(var i = 0; i < this.feeds['twitter_hash_arr'].length; i++) {
					this.feeds['twitter_hash_url'][i] = $.trim(this.feeds['twitter_hash_arr'][i])+'&t='+new Date().getTime();
				}
				this.social.push({ 	name: this.feeds['twitter_hash_arr'],
					url: this.feeds['twitter_hash_url'],
					id: 'twitter',
					icon: '',
					limit: this.feeds['twitter_hash_limit']
				});
			}
			
			if(this.feeds['twitter_search_arr']) {
				for(var i = 0; i < this.feeds['twitter_search_arr'].length; i++) {
					this.feeds['twitter_search_url'][i] = $.trim(this.feeds['twitter_search_arr'][i])+'&t='+new Date().getTime();
				}
				this.social.push({ 	name: this.feeds['twitter_search_arr'],
					url: this.feeds['twitter_search_url'],
					id: 'twitter',
					icon: '',
					limit: this.feeds['twitter_search_limit']
				});
			}
			
			if(this.feeds['foursquare_arr']) {

				for(var i = 0; i < this.feeds['foursquare_arr'].length; i++) {
					this.feeds['foursquare_url'][i] = $.trim(this.feeds['foursquare_arr'][i])+'&t='+new Date().getTime();
				}
				
				this.social.push({ 	name: this.feeds['foursquare_arr'],
					url: this.feeds['foursquare_url'],
					id: 'foursquare',
					icon: '',
					limit: this.feeds['foursquare_limit']
				});
			}
			
			if(this.feeds['lastfm_tracks_arr']) {
				for(var i = 0; i < this.feeds['lastfm_tracks_arr'].length; i++) {
					this.feeds['lastfm_tracks_url'][i] = 'http://ws.audioscrobbler.com/1.0/user/'+$.trim(this.feeds['lastfm_tracks_arr'][i])+'/recenttracks.rss';
				}
				this.social.push({ 	name: this.feeds['lastfm_tracks_arr'],
					url: this.feeds['lastfm_tracks_url'],
					id: 'lastfm',
					icon: '',
					limit: this.feeds['lastfm_tracks_limit']
				});
			}
			
			if(this.feeds['lastfm_events_arr']) {
				for(var i = 0; i < this.feeds['lastfm_events_arr'].length; i++) {
					this.feeds['lastfm_events_url'][i] = 'http://ws.audioscrobbler.com/1.0/user/'+$.trim(this.feeds['lastfm_events_arr'][i])+'/events.rss';
				}
				this.social.push({ 	name: this.feeds['lastfm_events_arr'],
					url: this.feeds['lastfm_events_url'],
					id: 'lastfm',
					icon: '',
					limit: this.feeds['lastfm_events_limit']
				});
			}
			
			if(this.feeds['lastfm_loved_arr']) {
				for(var i = 0; i < this.feeds['lastfm_loved_arr'].length; i++) {
					this.feeds['lastfm_loved_url'][i] = 'http://ws.audioscrobbler.com/2.0/user/'+$.trim(this.feeds['lastfm_loved_arr'][i])+'/lovedtracks.rss';
				}
				this.social.push({ 	name: this.feeds['lastfm_loved_arr'],
					url: this.feeds['lastfm_loved_url'],
					id: 'lastfm',
					icon: '',
					limit: this.feeds['lastfm_loved_limit']
				});
			}
			
			if(this.feeds['lastfm_artist_events_arr']) {
				for(var i = 0; i < this.feeds['lastfm_artist_events_arr'].length; i++) {
					this.feeds['lastfm_artist_events_url'][i] = 'http://ws.audioscrobbler.com/1.0/artist/'+$.trim(this.feeds['lastfm_artist_events_arr'][i])+'/events.rss';
				}
				this.social.push({ 	name: this.feeds['lastfm_artist_events_arr'],
					url: this.feeds['lastfm_artist_events_url'],
					id: 'lastfm',
					icon: '',
					limit: this.feeds['lastfm_artist_events_limit']
				});
			}
			
			if(this.feeds['lastfm_journal_arr']) {
				for(var i = 0; i < this.feeds['lastfm_journal_arr'].length; i++) {
					this.feeds['lastfm_journal_url'][i] = 'http://ws.audioscrobbler.com/1.0/user/'+$.trim(this.feeds['lastfm_journal_arr'][i])+'/journals.rss';
				}
				this.social.push({ 	name: this.feeds['lastfm_journal_arr'],
					url: this.feeds['lastfm_journal_url'],
					id: 'lastfm',
					icon: '',
					limit: this.feeds['lastfm_journal_limit']
				});
			}
			
			if(this.feeds['google_arr']) {

				for(var i = 0; i < this.feeds['google_arr'].length; i++) {
					this.feeds['google_url'][i] = $.trim(this.feeds['google_arr'][i]);
				}
				
				this.social.push({ 	name: this.feeds['google_arr'],
					url: this.feeds['google_url'],
					id: 'google',
					icon: '',
					limit: this.feeds['google_limit']
				});
			}
			
			if(this.feeds['instagram_arr']) {

				for(var i = 0; i < this.feeds['instagram_arr'].length; i++) {
					this.feeds['instagram_url'][i] = $.trim(this.feeds['instagram_arr'][i])+'&t='+new Date().getTime();
				}
				
				this.social.push({ 	name: this.feeds['instagram_arr'],
					url: this.feeds['instagram_url'],
					id: 'instagram',
					icon: '',
					limit: this.feeds['instagram_limit']
				});
			}
			
			if(this.feeds['instagram_hash_arr']) {
				for(var i = 0; i < this.feeds['instagram_hash_arr'].length; i++) {
					this.feeds['instagram_hash_url'][i] = $.trim(this.feeds['instagram_hash_arr'][i])+'&t='+new Date().getTime();
				}
				this.social.push({ 	name: this.feeds['instagram_hash_arr'],
					url: this.feeds['instagram_hash_url'],
					id: 'instagram',
					icon: '',
					limit: this.feeds['instagram_hash_limit']
				});
			}
			
			if(this.feeds['500px_arr']) {
				for(var i = 0; i < this.feeds['500px_arr'].length; i++) {
					this.feeds['500px_url'][i] = 'http://500px.com/'+$.trim(this.feeds['500px_arr'][i])+'/rss';
				}
				this.social.push({ 	name: this.feeds['500px_arr'],
					url: this.feeds['500px_url'],
					id: 'feed500px',
					icon: '',
					limit: this.feeds['500px_limit']
				});
			}
			
			if(this.feeds['soundcloud_arr']) {
				for(var i = 0; i < this.feeds['soundcloud_arr'].length; i++) {
					this.feeds['soundcloud_url'][i] = 'http://soundfeed.preslav.me/feed/'+$.trim(this.feeds['soundcloud_arr'][i]+'/b800f4');
				}
				this.social.push({ 	name: this.feeds['soundcloud_arr'],
					url: this.feeds['soundcloud_url'],
					id: 'soundcloud',
					icon: 'https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-154f6af5.ico',
					limit: this.feeds['soundcloud_limit']
				});
			}
			
			if(this.feeds['facebook_page_arr']) {
				for(var i = 0; i < this.feeds['facebook_page_arr'].length; i++) {
					this.feeds['facebook_page_url'][i] = $.trim(this.feeds['facebook_page_arr'][i])+'&t='+new Date().getTime();
				}
				
				this.social.push({ 	name: this.feeds['facebook_page_arr'],
					url: this.feeds['facebook_page_url'],
					id: 'facebook',
					icon: '',
					limit: this.feeds['facebook_page_limit']
				});
			}
			
			if(this.feeds['delicious_arr']) {
				for(var i = 0; i < this.feeds['delicious_arr'].length; i++) {
					this.feeds['delicious_url'][i] = 'http://feeds.delicious.com/v2/rss/'+$.trim(this.feeds['delicious_arr'][i]);
				}
				
				this.social.push({ 	name: this.feeds['delicious_arr'],
					url: this.feeds['delicious_url'],
					id: 'delicious',
					icon: '',
					limit: this.feeds['delicious_limit']
				});
			}
			
			if(this.feeds['flickr_arr']) {
				for(var i = 0; i < this.feeds['flickr_arr'].length; i++) {
					this.feeds['flickr_url'][i] = 'http://api.flickr.com/services/feeds/photos_public.gne?id='+$.trim(this.feeds['flickr_arr'][i])+'&format=rss_200';
				}
				
				this.social.push({ 	name: this.feeds['flickr_arr'],
					url: this.feeds['flickr_url'],
					id: 'flickr',
					icon: '',
					limit: this.feeds['flickr_limit']
				});
			}
			
			if(this.feeds['flickr_hash_arr']) {
				for(var i = 0; i < this.feeds['flickr_hash_arr'].length; i++) {
					this.feeds['flickr_hash_url'][i] = 'http://api.flickr.com/services/feeds/photos_public.gne?tags='+$.trim(this.feeds['flickr_hash_arr'][i])+'&lang=es-us&format=rss_200';
				}
				this.social.push({ 	name: this.feeds['flickr_hash_arr'],
					url: this.feeds['flickr_hash_url'],
					id: 'flickr',
					icon: '',
					limit: this.feeds['flickr_hash_limit']
				});
			}
			
			if(this.feeds['tumblr_arr']) {
				for(var i = 0; i < this.feeds['tumblr_arr'].length; i++) {
					this.feeds['tumblr_url'][i] = 'http://'+$.trim(this.feeds['tumblr_arr'][i])+'.tumblr.com/rss';
				}
				
				this.social.push({ 	name: this.feeds['tumblr_arr'],
					url: this.feeds['tumblr_url'],
					id: 'tumblr',
					icon: '',
					limit: this.feeds['tumblr_limit']
				});
			}
			
			if(this.feeds['youtube_arr']) {
				for(var i = 0; i < this.feeds['youtube_arr'].length; i++) {
					this.feeds['youtube_url'][i] = $.trim(this.feeds['youtube_arr'][i])+'&t='+new Date().getTime();
				}
				
				this.social.push({ 	name: this.feeds['youtube_arr'],
					url: this.feeds['youtube_url'],
					id: 'youtube',
					icon: '',
					limit: this.feeds['youtube_limit']
				});
			}
			
			if(this.feeds['youtube_search_arr']) {
				for(var i = 0; i < this.feeds['youtube_search_arr'].length; i++) {
					this.feeds['youtube_search_url'][i] = $.trim(this.feeds['youtube_search_arr'][i])+'&t='+new Date().getTime();
				}
				
				this.social.push({ 	name: this.feeds['youtube_search_arr'],
					url: this.feeds['youtube_search_url'],
					id: 'youtube',
					icon: '',
					limit: this.feeds['youtube_search_limit']
				});
			}
			
			if(this.feeds['dribbble_arr']) {
				for(var i = 0; i < this.feeds['dribbble_arr'].length; i++) {
					this.feeds['dribbble_url'][i] = 'http://dribbble.com/players/'+$.trim(this.feeds['dribbble_arr'][i])+'/shots.rss';
				}
				
				this.social.push({ 	name: this.feeds['dribbble_arr'],
					url: this.feeds['dribbble_url'],
					id: 'dribbble',
					icon: '',
					limit: this.feeds['dribbble_limit']
				});
			}
			
			if(this.feeds['digg_arr']) {
				for(var i = 0; i < this.feeds['digg_arr'].length; i++) {
					this.feeds['digg_url'][i] = 'http://digg.com/users/'+$.trim(this.feeds['digg_arr'][i])+'/history.rss';
				}
				
				this.social.push({ 	name: this.feeds['digg_arr'],
					url: this.feeds['digg_url'],
					id: 'digg',
					icon: '',
					limit: this.feeds['digg_limit']
				});
			}
			
			if(this.feeds['pinterest_arr']) {
				for(var i = 0; i < this.feeds['pinterest_arr'].length; i++) {
					this.feeds['pinterest_url'][i] = 'http://www.pinterest.com/'+$.trim(this.feeds['pinterest_arr'][i])+'/feed.rss';
				}
				
				this.social.push({ 	name: this.feeds['pinterest_arr'],
					url: this.feeds['pinterest_url'],
					id: 'pinterest',
					icon: '',
					limit: this.feeds['pinterest_limit']
				});
			}
			
			if(this.feeds['vimeo_arr']) {
				for(var i = 0; i < this.feeds['vimeo_arr'].length; i++) {
					this.feeds['vimeo_url'][i] = 'http://vimeo.com/'+$.trim(this.feeds['vimeo_arr'][i])+'/videos/rss';
				}
				
				this.social.push({ 	name: this.feeds['vimeo_arr'],
					url: this.feeds['vimeo_url'],
					id: 'vimeo',
					icon: '',
					limit: this.feeds['vimeo_limit']
				});	
			}
			
			
			/* ADDED TO USE COMMUNIO LOADING ANIMATION ------------------------------------------------------------------ */
			
			this.timeline.addClass('_dpSocialTimelineLoading');
			
			this.timeline.html('<style>.loading{position: absolute;top: 50%;left: 50%;}.loading-bar{display: inline-block;width: 4px;height: 18px;margin:1px;border-radius: 4px;animation: loading 1s ease-in-out infinite;}.loading-bar:nth-child(1){background-color: #eab300;animation-delay: 0;}.loading-bar:nth-child(2){background-color: #1a3453;animation-delay: 0.09s;}.loading-bar:nth-child(3){background-color: #2b4d70;animation-delay: .18s;}.loading-bar:nth-child(4){background-color: #4d4d4d;animation-delay: .27s;}@keyframes loading{0%{transform: scale(1);}20%{transform: scale(1, 2.2);}40%{transform: scale(1);}}</style><div class="loading"><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div><div class="loading-bar"></div></div>');
			
			/* END ADDED ---------------------------------------------------------------------------------------------- */
			
			
			this._parseFeeds();
			
			$(window).bind('resize', function() {
				//confirm window was actually resized
				if($(window).height()!= self.lastWindowHeight || $(window).width()!= self.lastWindowWidth){
			
					//set this windows size
					self.lastWindowHeight = $(window).height();
					self.lastWindowWidth = $(window).width();
					
					//on window resize stuff
					
					self._updateTimelineSize();
				}
			});
			
			var tw_widget = "https://platform.twitter.com/widgets.js";
			$.getScript(tw_widget);
		},
		
		_supports_html5_storage : function (){
			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch (e) {
				return false;
			}

		},
		
		_createCookie : function(name,value,days) {
			
			if(this._supports_html5_storage()) {
				localStorage[name] = value;
			}
			
		},
		
		_deleteCookie : function(name) {
			if(this._supports_html5_storage()) {
				localStorage[name] = null;
			}
		},
		
		_getCookie : function(name) {
			if(this._supports_html5_storage()) {
				return localStorage[name];
			}
			
			return null;
		},
		
		_updateTimelineSize : function() {
			var self = this;
			
			if(this.timeline.width() < 480) {
				$('.dpSocialTimeline', this.timeline).removeClass('dpSocialTimeline_layout_timeline');
				$('.dpSocialTimeline', this.timeline).removeClass('dpSocialTimeline_layout_columns');
				$('.dpSocialTimeline', this.timeline).removeClass('dpSocialTimeline_layout_vertical');
					  
				$('button', this.timeline).removeClass('active'); 
			
				$('.dpSocialTimeline_layout', this.timeline).hide();
				
				if(!this.settings.showFilter || this.totalFeeds == 1) {
					$('.dpSocialTimeline_divider', this.timeline).hide();
				}

				$('.dpSocialTimeline_lineWrap', this.timeline).fadeOut('fast');
				$('.dpSocialTimeline_item', this.timeline).css({'width': '100%', 'margin-right': '0px', 'margin-left': '0', 'box-sizing': 'border-box'});
				
				$('.dpSocialTimeline', this.timeline).isotope({ layoutMode: typeof $.Isotope == "undefined" ? 'vertical' : 'vertical' });
				
				if($('.dpSocialTimeline_item.filtered', this.timeline).length){
					$('.dpSocialTimeline_item.filtered:gt('+( this.settings.total - 1 )+')', this.timeline).css({opacity : 0, scale : 0.001, display: 'none'});
					$('.dpSocialTimeline_item.filtered:lt('+( this.settings.total )+')', this.timeline).css({opacity : 1, scale : 1, display: 'block'});
				  } else {
					$('.dpSocialTimeline_item:gt('+( this.settings.total - 1 )+')', this.timeline).css({opacity : 0, scale : 0.001, display: 'none'});
					/*$('.dpSocialTimeline_item', this.timeline).isotope({ filter: function() {
					  var number = $(this).closest('.dpSocialTimeline_item').data('list-number');
					  console.log(number);
					  return parseInt( number, 10 ) < ( self.settings.total );
					} }).isotope('layout');*/
					
				  }
				
			} else if(!$('button.'+this.lastLayout, this.timeline).hasClass('active') || this.lastLayout == (typeof $.Isotope == "undefined" ? 'vertical' : 'vertical')) {
				if(this.settings.showLayout) {
					$('.dpSocialTimeline_layout', this.timeline).show();
				}
				
				switch(this.settings.layoutMode) {
				  case "spineAlign":
					$('.dpSocialTimeline', this.timeline).addClass('dpSocialTimeline_layout_timeline');
					$('.dpSocialTimeline_item', this.timeline).width(($('.dpSocialTimeline', this.timeline).outerWidth() - 50) / 2);
					break;
				  case "masonry":
					$('.dpSocialTimeline', this.timeline).addClass('dpSocialTimeline_layout_columns');
					break;
				  case "straightDown":
				  case "vertical":
					$('.dpSocialTimeline', this.timeline).addClass('dpSocialTimeline_layout_vertical');
					break;
				}

				$('.dpSocialTimeline_item', this.timeline).css({'margin-right': '', 'margin-left': '', 'box-sizing': ''});
												
				$('button.'+this.lastLayout, this.timeline).trigger('click');
			}
			
			if($('.dpSocialTimeline', this.timeline).hasClass('dpSocialTimeline_layout_timeline')) {
				$('.dpSocialTimeline_item', this.timeline).width(($('.dpSocialTimeline', this.timeline).outerWidth() - 50) / 2);
			}
			
			$('.dpSocialTimeline', this.timeline).isotope('layout');

			/*
			if (this.resizeTimer) clearTimeout(this.resizeTimer);
			this.resizeTimer = setTimeout(function() {
				if ($('#cboxOverlay').is(':visible')) {
					$.colorbox.load(true);
				}
			}, 300)
			*/
		},
		
		_addSocial : function(num, multi_counter) {
			var me = this;
			if(this.social[num].name != "") {
				
				//var multi_counter = 0;
				//for(var y = 0; y < this.social[num].url.length; y++) {

					this._parseRSS(this.social[num].url[multi_counter], this.social[num].limit, multi_counter,
					function(feeds, id){
						var xmlString = feeds.xmlString;
						//var feeds = feeds.feed;
						if(!feeds){	continueSocial(); return false; }
						me.nameFeeds[me.totalFeeds] = me.social[num].id;
						me.iconFeeds[me.totalFeeds] = me.social[num].icon;
						me.limitFeeds[me.totalFeeds] = me.social[num].limit;
						me.totalFeeds++;
						if(typeof feeds.feed != "undefined" && typeof feeds.feed.entries != "undefined") {
							feeds.item = feeds.feed.entries;
						}

						if(typeof feeds.item == "undefined") {
							
							continueSocial();
							return;
							
						}
						for(var i=0; i<feeds.item.length; i++){
							feeds.item[i].name = me.social[num].id;
							feeds.item[i].icon = me.social[num].icon;
							feeds.item[i].limit = me.social[num].limit;
							if(typeof feeds.item[i].publishedDate != "undefined") {
								feeds.item[i].pubDate = feeds.item[i].publishedDate;
							}
							feeds.item[i].search_item = me.social[num].name[id];
							
							if(typeof xmlString != "undefined") {
								var xmlDoc = $.parseXML( xmlString ),
									$xml = $( xmlDoc ),
									$enclosure = $xml.find( "enclosure" )[i],
									$description = $xml.find( "description" )[i + 1],
									$guid = $xml.find( "guid" )[i],
									$credit = $xml.find( "credit" )[i],
									$media_content = $xml.find( "thumbnail" )[i];
								
								if($enclosure) {
									feeds.item[i].enclosure = $($enclosure).attr('url');
									feeds.item[i].enclosure_type = $($enclosure).attr('type');
								}
								if($guid) {
									feeds.item[i].guid = $($guid).text();
								}
								if($credit && me.social[num].id == 'instagram') {
									feeds.item[i].author = $($credit).text();
								}
								if($description && feeds.item[i].name == "tumblr") {
									feeds.item[i].content = $($description).text();
								}
								/*if($media_content && feeds.item[i].name == "vimeo") {
									feeds.item[i].thumbnail = $($media_content).attr('url');
								}*/
							}
							
							feeds.item[i].feed_title = feeds.title;
							
							if( feeds.item[i].author == "" || feeds.item[i].author == "Webstagram") { feeds.item[i].author = me.social[num].name[id]; }

							try{
							
								if((feeds.item[i].title != "" || feeds.item[i].contentSnippet != "" || feeds.item[i].content != "" || feeds.item[i].thumbnail != "")) {
									me.item.push(feeds.item[i]);
								}
							
							} catch(err){}
							
						}
						
						function continueSocial() {
							if(me.social[num].url.length >= multi_counter + 1) {
								me._addSocial(num, multi_counter + 1);
							}
							
							if( id == (me.social[num].url.length - 1) ) {
								if(parseInt(num, 10) == (me.social.length - 1)) {
									if(me.settings.cache) {
										me._createCookie('dpSocialTimeline_'+me.timeline_id, JSON.stringify(me.item), 1);
										me._createCookie('dpSocialTimeline_NameFeeds_'+me.timeline_id, JSON.stringify(me.nameFeeds), 1);
										me._createCookie('dpSocialTimeline_IconFeeds_'+me.timeline_id, JSON.stringify(me.iconFeeds), 1);
										me._createCookie('dpSocialTimeline_LimitFeeds_'+me.timeline_id, JSON.stringify(me.limitFeeds), 1);
										me._createCookie('dpSocialTimeline_TotalFeeds_'+me.timeline_id, JSON.stringify(me.totalFeeds), 1);
										me._createCookie('dpSocialTimeline_Time'+me.timeline_id, Math.round($.now() / 1000), 1);
									}
									
									me._output();	
								} else {
									me._addSocial(num + 1, 0);
								}
							}
						}
						
						continueSocial();
					},
					this.settings.total
					);
				//}

			} else {
				if(parseInt(num, 10) == (this.social.length - 1)) {
					
					if(this.settings.cache) {
						this._createCookie('dpSocialTimeline_'+this.timeline_id, JSON.stringify(this.item), 1);
						this._createCookie('dpSocialTimeline_NameFeeds_'+this.timeline_id, JSON.stringify(this.nameFeeds), 1);
						this._createCookie('dpSocialTimeline_IconFeeds_'+this.timeline_id, JSON.stringify(this.iconFeeds), 1);
						this._createCookie('dpSocialTimeline_LimitFeeds_'+this.timeline_id, JSON.stringify(this.limitFeeds), 1);
						this._createCookie('dpSocialTimeline_TotalFeeds_'+this.timeline_id, JSON.stringify(this.totalFeeds), 1);
						this._createCookie('dpSocialTimeline_Time'+this.timeline_id, Math.round($.now() / 1000), 1);
					}
					
					this._output();	
				} else {
					this._addSocial(num + 1, 0);
				}
			}
		},
			
		_parseFeeds : function(){
			
			// CACHE
			//this._deleteCookie('dpSocialTimeline_'+this.item[x].name+'_'+this.item[x].search_item);
			if(!this.is_iOS && this.settings.cache && this._getCookie('dpSocialTimeline_'+this.timeline_id) && this._getCookie('dpSocialTimeline_'+this.timeline_id) != "" && this._getCookie('dpSocialTimeline_'+this.timeline_id) != "null") {
				this.item = ($.parseJSON(this._getCookie('dpSocialTimeline_'+this.timeline_id)));
				this.nameFeeds = ($.parseJSON(this._getCookie('dpSocialTimeline_NameFeeds_'+this.timeline_id)));
				this.iconFeeds = ($.parseJSON(this._getCookie('dpSocialTimeline_IconFeeds_'+this.timeline_id)));
				this.limitFeeds = ($.parseJSON(this._getCookie('dpSocialTimeline_LimitFeeds_'+this.timeline_id)));
				this.totalFeeds = ($.parseJSON(this._getCookie('dpSocialTimeline_TotalFeeds_'+this.timeline_id)));
				
				var d = new Date();
				if(this.settings.cacheTime <= (Math.round($.now() / 1000) - this._getCookie('dpSocialTimeline_Time'+this.timeline_id))) {
					this._deleteCookie('dpSocialTimeline_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_NameFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_IconFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_LimitFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_TotalFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_Time'+this.timeline_id);
				}

				this._output();	
			} else {
				if(!this.settings.cache && !this.is_iOS) {
					this._deleteCookie('dpSocialTimeline_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_NameFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_IconFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_LimitFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_TotalFeeds_'+this.timeline_id);
					this._deleteCookie('dpSocialTimeline_Time'+this.timeline_id);
				}
				
				this._addSocial(0, 0);
			}
					
		},
		
		_strip_tags : function(input, allowed) {
			if(!input) {
				return '';	
			}
			allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); 
			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
				commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
			return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
				return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
			});
		},
		
		_output : function(){
			var me = this,
				is_youtube = false,
				is_vimeo = false,
				$li, 
				$favicon, 
				outputOptions = {
					$dpSocialTimelineLine : '',
					$dpSocialTimelineFilter : '',
					$dpSocialTimelineLayout : '',
					$dpSocialTimelineLineWrap : '',
					$dpSocialTimelineContent : '',
					$div : '',
					showDivider : false,
					appendFilter : false,
					appendLayout : false
				},
				$stContentHead, 
				$stContentFoot, 
				$time, 
				$permalink, 
				$tw_btn,
				$fb_btn,
				$video_icon,
				$get_image,
				$img_link,
				oldNameFeeds = new Array();
			
			outputOptions.$div = $('<div>').addClass('dpSocialTimeline');
			
			outputOptions.$dpSocialTimelineLine = $('<div />').addClass('dpSocialTimeline_line');
			
			outputOptions.$dpSocialTimelineLineWrap = $('<div />').addClass('dpSocialTimeline_lineWrap')
								.append($(outputOptions.$dpSocialTimelineLine));
								
			$(outputOptions.$div).append(outputOptions.$dpSocialTimelineLineWrap);
			
			this.item.sort(function(a,b) {
	
				a = new Date(a["pubDate"]).getTime();
				b = new Date(b["pubDate"]).getTime();
				return a == b ? 0 : (a > b ? -1 : 1)
			});
						
			this._createMarkup(outputOptions, 0, false);
			
			$('.dpSocialTimeline_item', outputOptions.$div).width(this.settings.itemWidth);
			
			if(this.settings.showFilter && this.totalFeeds > 1) {
				outputOptions.$dpSocialTimelineFilter = $('<div />').addClass('dpSocialTimeline_filter');
				
				for(var i = 0; i <= this.totalFeeds; i++) {
					if(typeof this.nameFeeds[i] !== "undefined" && $.inArray(this.nameFeeds[i], oldNameFeeds) === -1) {
						
						outputOptions.$dpSocialTimelineFilter.append(
							$('<button />').attr({'data-filter': '.'+(this.nameFeeds[i])})
										   .append($('<span />').addClass('favicon '+(this.nameFeeds[i])))
						);

						if(typeof this.iconFeeds[i] != "undefined" && this.iconFeeds[i] != "") { $('.'+(this.nameFeeds[i]), outputOptions.$dpSocialTimelineFilter).css('background-image', 'url('+this.iconFeeds[i]+')') }
						
						oldNameFeeds[i] = this.nameFeeds[i];
					}
				}
				
				if( oldNameFeeds.length > 1 ) {
					outputOptions.appendFilter = true;
					
					outputOptions.showDivider = true;
				}
			}
			
			
			outputOptions.$dpSocialTimelineLayout = $('<div />').addClass('dpSocialTimeline_layout');
			
			if(this.settings.showLayoutTimeline) {
				outputOptions.$dpSocialTimelineLayout.append($('<button />').attr({'data-style': 'spineAlign'}).addClass('spineAlign').append($('<span />')));
			}
			
			if(this.settings.showLayoutColumns) {
				outputOptions.$dpSocialTimelineLayout.append($('<button />').attr({'data-style': 'masonry'}).addClass('masonry').append($('<span />')));
			}
			
			if(this.settings.showLayoutOneColumn) {
				outputOptions.$dpSocialTimelineLayout.append($('<button />').attr({'data-style': typeof $.Isotope == "undefined" ? 'vertical' : 'vertical'}).addClass('straightDown').append($('<span />')));
			}
		
			outputOptions.appendLayout = true;
			
			if(this.settings.showLayout) {	
				outputOptions.showDivider = true;
			} else {
				outputOptions.$dpSocialTimelineLayout.hide();	
			}
			
			me._onLoadHook(outputOptions);
			
			// filter items when filter link is clicked
			if(outputOptions.$dpSocialTimelineFilter.length) {
				$('button', outputOptions.$dpSocialTimelineFilter).click(function(){
				  
				  if(!me.settings.allowMultipleFilters) {
					$('button', outputOptions.$dpSocialTimelineFilter).not(this).removeClass('active');  
				  }

				  if(!$(this).hasClass('active')) { $(this).addClass('active'); } else { $(this).removeClass('active'); }
	
				  var selector = '';
				  
				  $('.dpSocialTimeline_item.filtered', outputOptions.$div).removeClass('filtered');
				  
				  $('button.active', outputOptions.$dpSocialTimelineFilter).each(function(i){
					  if($(this).attr('data-filter') != "" && typeof $(this).attr('data-filter') !== "undefined") {
						  if(i > 0) { selector += ","; }
						  selector += $(this).attr('data-filter');
						  
						  $('.dpSocialTimeline_item'+$(this).attr('data-filter'), outputOptions.$div).addClass('filtered');
					  }
				  });
				  
				  if(selector == '') { 
				  
					  selector = $('.dpSocialTimeline_item:lt('+( me.settings.total )+')', me.timeline);  
					  outputOptions.$div.isotope({ filter: selector });
					  $('.dpSocialTimeline_item:gt('+( me.settings.total - 1 )+')', outputOptions.$div).css({opacity : 0, scale : 0.001, display: 'block'});
					  
				  } else { 
					
					  selector = $('.filtered:lt('+( me.settings.total )+')', me.timeline); 
					  outputOptions.$div.isotope({ filter: selector });
					  $('.dpSocialTimeline_item.filtered:gt('+( me.settings.total - 1 )+')', outputOptions.$div).css({opacity : 0, scale : 0.001, display: 'none'});
	
					  $('.dpSocialTimeline_item.filtered:lt('+( me.settings.total )+')', outputOptions.$div).css({opacity : 1, scale : 1, display: 'block'});
				  }
				  
				  outputOptions.$div.isotope('layout');
	
				  return false;
				});
			}
			
			// filter items when layout link is clicked
			//if(this.settings.showLayout) {
				$('button', outputOptions.$dpSocialTimelineLayout).click(function(){
					
				  if($(this).hasClass('active')) 
				  	return;
					
				  $('button', outputOptions.$dpSocialTimelineLayout).removeClass('active'); 
				  $(this).addClass('active'); 
				  
				  if($(this).attr('data-style') != "" && typeof $(this).attr('data-style') !== "undefined") {
					  
					  me.lastLayout = $(this).attr('data-style');
					  var switch_layout = me.lastLayout;
					  $(outputOptions.$div).removeClass('dpSocialTimeline_layout_timeline');
					  $(outputOptions.$div).removeClass('dpSocialTimeline_layout_columns');
					  $(outputOptions.$div).removeClass('dpSocialTimeline_layout_vertical');
					  
					  switch(me.lastLayout) {
						  case "spineAlign":
							outputOptions.$dpSocialTimelineLineWrap.fadeIn('fast');
							//if(me.settings.timelineItemWidth != "") {
								//$('.dpSocialTimeline_item', outputOptions.$div).css('width', me.settings.timelineItemWidth);
							//} else {
								$('.dpSocialTimeline_item', outputOptions.$div).width(($(outputOptions.$div).outerWidth() - 50) / 2);
							//}
							$(outputOptions.$div).addClass('dpSocialTimeline_layout_timeline');
							switch_layout = 'masonry';
							break;
						  case "masonry":
							outputOptions.$dpSocialTimelineLineWrap.fadeOut('fast');
							if(me.settings.columnsItemWidth != "") {
								$('.dpSocialTimeline_item', outputOptions.$div).css('width', me.settings.columnsItemWidth);
							} else {
								$('.dpSocialTimeline_item', outputOptions.$div).width(me.settings.itemWidthOrig);
							}
							$(outputOptions.$div).addClass('dpSocialTimeline_layout_columns');
							break;
						  case "straightDown":
						  case "vertical":
							outputOptions.$dpSocialTimelineLineWrap.fadeOut('fast');
							if(me.settings.oneColumnItemWidth != "") {
								$('.dpSocialTimeline_item', outputOptions.$div).css('width', me.settings.oneColumnItemWidth);
							} else {
								$('.dpSocialTimeline_item', outputOptions.$div).width(me.settings.itemWidthOrig);
							}
							$(outputOptions.$div).addClass('dpSocialTimeline_layout_vertical');
							break;
					  }
						
					  outputOptions.$div.isotope({ layoutMode: switch_layout });
					  
					  if($('.dpSocialTimeline_item.filtered', outputOptions.$div).length){
						$('.dpSocialTimeline_item.filtered:gt('+( me.settings.total - 1 )+')', outputOptions.$div).css({opacity : 0, scale : 0.001, display: 'none'});
						$('.dpSocialTimeline_item.filtered:lt('+( me.settings.total )+')', outputOptions.$div).css({opacity : 1, scale : 1, display: 'block'});
					  } else {
						$('.dpSocialTimeline_item:gt('+( me.settings.total - 1 )+')', outputOptions.$div).css({opacity : 0, scale : 0.001, display: 'none'});
					  }
				  }
				  
				  return false;
				});
			//}
		},
		
		_createMarkup : function(outputOptions, num, afterLoad) {
			var el = this;
			
			for (x = num; x < this.item.length; x++)
			{
				
				//if(x >= this.settings.total && !afterLoad) break;
				
				if(this.settings.showSocialIcons) {
					$favicon = $('<span />').addClass('favicon '+this.item[x].name);
					if(typeof this.item[x].icon != "undefined" && this.item[x].icon != "") { $($favicon).css('background-image', 'url('+this.item[x].icon+')') }
				} else {
					$favicon = '';
				}
				date_published = new Date( this.item[x].pubDate );
				published_parse = Date.UTC( date_published.getFullYear(), date_published.getMonth(), date_published.getDate(), date_published.getHours(), date_published.getMinutes() );

				$time = $('<span />').addClass('time').html( this._relativeTime( published_parse ));
				$permalink = $('<a />').addClass('permalink').attr({href: this.item[x].link, target: '_blank'});
				
				if(typeof this.item[x].link == "undefined" || this.item[x].link == null) {
					this.item[x].link = "";
				}
									
				if(this.item[x].link.indexOf('youtube.com/watch') !== -1) {
					is_youtube = true;
					this.item[x].thumbnail = 'https://i.ytimg.com/vi/'+this._getYoutubeId(this.item[x].link)+'/0.jpg';
					is_vimeo = false;
					$video_icon = $('<div />').addClass('video_icon');
				} else if(this.item[x].link.substr(0,16) == 'http://vimeo.com') {
					is_youtube = false;
					is_vimeo = true;
					$video_icon = $('<div />').addClass('video_icon');
				} else {
					is_youtube = false;
					is_vimeo = false;
					$video_icon = '';
				}
				
				var author = this.item[x].author,
					feed_title = this.item[x].feed_title,
					enclosure = this.item[x].enclosure,
					guid = this.item[x].guid;
				
				if(this.item[x].name == 'flickr') {
					author = this.item[x].author.content.match(/\((.*?)\)/g)[0];
				} else {
					if(typeof author != "undefined" && author != null) {
						author = author.replace( /\((.*?)\)/g, "" );
					}
				}
				
				if(this.item[x].name == 'twitter') {
					author = "@"+author;
				}
				
				if(this.item[x].name == 'google') {
					author = feed_title.substr(0, feed_title.indexOf('.')).replace("Public RSS-Feed of ", "");
				}
				
				if(this.item[x].name == 'soundcloud') {
					author = feed_title;
				}
				
				outputOptions.$dpSocialTimelineContent = $('<div />').addClass('dpSocialTimelineContent');
				var title = "";
				

				if(this.item[x].link.indexOf('twitter.com') !== -1) {
					var tw_parts = this.item[x].link.split('/');
					var tw_id = tw_parts[5];
					
					title = this._linkify(this.item[x].title.replace(new RegExp( "(" + this.preg_quote( author.replace("@", "")+": " ) + ")" , 'gi' ), ""));
					$(outputOptions.$dpSocialTimelineContent)
							.append($('<div>').addClass('dpSocialTimelineTwitterActions')
								.append($('<a>').attr({href: 'https://twitter.com/intent/tweet?in_reply_to='+tw_id}).addClass('tw_reply').text('Reply'))
								.append($('<a>').attr({href: 'https://twitter.com/intent/retweet?tweet_id='+tw_id}).addClass('tw_retweet').text('Retweet'))
								.append($('<a>').attr({href: 'https://twitter.com/intent/favorite?tweet_id='+tw_id}).addClass('tw_favorite').text('Like'))
							);
					if(typeof title != "undefined") {
						title = title.replace(/nolinkVideo/g, "https://");
					}

				} else if(this.item[x].link.indexOf('facebook.com') !== -1 || this.item[x].link.indexOf('pinterest.com') !== -1) {
					
					if(typeof this.item[x].description != "undefined") {
						this.item[x].content = this.item[x].description;
					}

					if(this.item[x].content != null) {
					
						this.item[x].content = this.item[x].content.replace('rel="nofollow">www','rel="nofollow">http://www');
					
					} else {
						
						this.item[x].content = "&nbsp;";
						
					}
					
					// Hide Albumns
					if(this.item[x].link.indexOf('media/set/') !== -1 ) {
						continue;	
					}
					
					if(!typeof this.item[x].content == "undefined" || this.item[x].link.indexOf('pinterest.com') !== -1) {
						title = this._linkify(this._strip_tags(this.item[x].content, '<br>, <p>, <video>, <source>')).replace('<br><br>', '');
						if(title.indexOf('<br>') == 0) {
							title = title.substr(4);
						}
					}
					if(title == "") { title = this._linkify(this.item[x].title); }
					//title = title.replace("www.", "<br />www.");
					//title = title.replace(".com", ".com<br />");
					if(typeof title == "undefined") {
						title = "&nbsp;";
					}
					
					title = title.replace('.jpg" target="_blank"', '.jpg" style="display:none;"');
					
					title = title.replace(/nolinkVideo/g, "https://");
				
									
				} else {
					title = this._linkify(this.item[x].title);
				}
				
				if(this.item[x].name == 'tumblr') {

					if(!typeof this.item[x].description == "undefined") {
						title = this._linkify(this._strip_tags(this.item[x].description, '<p>, <video>, <source>')).replace('<br><br>', '');
					}

					if(this.item[x].description.indexOf('<iframe') != -1) {
						title = this.item[x].description;	
					}
					
				}

				if(this.item[x].name == 'vimeo') {
					
					title = this.item[x].content.title;

				}
				
				if(this.settings.skin != "modern") {
					$(outputOptions.$dpSocialTimelineContent).prepend($('<div>').addClass('dpSocialTimelineText').html(title));
				}
				
				if(this._getImage(this.item[x], false) != '') {
					
					$get_image = this._getImage(this.item[x], false);
					$img_link = $('<a />').attr({href: this.item[x].link, target: '_blank'}).addClass('img_link'+(is_youtube || is_vimeo ? ' youtube' : ''));
					
					$($img_link).append($get_image).append($video_icon);
					
					if((this.settings.addColorbox || this.settings.addLightbox) && this.item[x].name != "google") {
						$($img_link).addClass('addColorbox');
						
						if(is_youtube) {
							$($img_link).attr({href: this.item[x].link.replace('&feature=youtube_gdata', '')});
						} else if(is_vimeo) {
							//$($img_link).attr({href: this._getVimeoVideo(this.item[x].link)});
						} else {
							$($img_link).attr({href: this._getImage(this.item[x], true)});
						}
						
					}
					
					outputOptions.$dpSocialTimelineContent.prepend($img_link);

					if($get_image.attr('src').indexOf('graph.facebook.com') !== -1) {
						
						$.getJSON( $get_image.attr('src')+'&redirect=false', function( data ) {
							var img_src = $get_image.attr('src');
							if(data.data.is_silhouette) {
								
								$("img[src='"+this.url.replace('&redirect=false', '')+"']").hide();
								
							} 
						
						});
					
					}

					
				} else {
					$(outputOptions.$dpSocialTimelineContent).addClass('dpSocialTimeline_noImage');
				}

				if(this.item[x].name == 'soundcloud') {
					var track_guid = guid.substr(guid.lastIndexOf("/")+1);
					outputOptions.$dpSocialTimelineContent.addClass('track-'+track_guid);
					var soundcloud_iframe = '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/'+track_guid+'"></iframe>';

					
					if(el.settings.skin == "modern") {
						outputOptions.$dpSocialTimelineContent
							.prepend(soundcloud_iframe);
					} else {
						outputOptions.$dpSocialTimelineContent
							.append($('<br />'))
							.append($('<br />'))
							.append(soundcloud_iframe);
					}

					/*console.log(guid);
					console.log(track_guid);
					$.getJSON('https://soundcloud.com/oembed?callback=?',
						{format: 'js', url: guid, iframe: true, guid: '.track-'+guid.substr(guid.lastIndexOf("/",1)+1)},
						function(data) {
							// Stick the html content returned in the object into the page
							var class_item_arr = this.url.substr(this.url.lastIndexOf(".track")).split("&");
							if(el.settings.skin == "modern") {
								$($(outputOptions.$div).find(class_item_arr[0])[0])
									.prepend(data['html']);
							} else {
								$($(outputOptions.$div).find(class_item_arr[0])[0])
									.append($('<br />'))
									.append($('<br />'))
									.append(data['html']);
							}
							
							outputOptions.$div.isotope('layout');
						}
					)*/
					
				}

				if(this.settings.skin == "modern") {
					$(outputOptions.$dpSocialTimelineContent).append($('<div>').addClass('dpSocialTimelineText').html(title));
				}
				
				// Social Buttons
				//
				if(typeof title == "undefined") {
					title = "";
				}
				title = title.replace(/[\ud800-\udfff]/g, '');
				
				var $tw_btn = jQuery('<a />')
									.addClass('share_twitter')
									.attr( { href: 'https://twitter.com/intent/tweet?original_referer='+this.item[x].link+'&url='+this.item[x].link+'&text='+encodeURIComponent(this._strip_tags(title).length > 110 ? this._strip_tags(title).substr(0, 110)+"... - " : this._strip_tags(title)), title: 'Share in Twitter' } )
									.click(function(event) {
										var width  = 575,
											height = 400,
											left   = (jQuery(window).width()  - width)  / 2,
											top    = (jQuery(window).height() - height) / 2,
											url    = this.href,
											opts   = 'status=1' +
													 ',width='  + width  +
													 ',height=' + height +
													 ',top='    + top    +
													 ',left='   + left;
										
										window.open(url, 'twitter', opts);
									 
										return false;
								  }),
				$fb_btn = jQuery('<a />')
								.addClass('share_facebook')
								.attr( { href: 'http://www.facebook.com/share.php?u='+this.item[x].link, title: 'Share in Facebook' } )
								.click(function(event) {
										var width  = 575,
											height = 400,
											left   = (jQuery(window).width()  - width)  / 2,
											top    = (jQuery(window).height() - height) / 2,
											url    = this.href,
											opts   = 'status=1' +
													 ',width='  + width  +
													 ',height=' + height +
													 ',top='    + top    +
													 ',left='   + left;
										
										window.open(url, 'facebook', opts);
									 
										return false;
								  });
								
				if(typeof author == "undefined" && typeof this.item[x].search_item != "undefined") {
					author = this.item[x].search_item;
				}

								if(typeof author == 'undefined') {
									author = ".";
								}

				$stContentHead = $('<div />').addClass('dpSocialTimelineContentHead')
									.append($($favicon))
									.append($('<span />').addClass('user').append($('<strong/>').html(author).text()))
									.append($($permalink))
									.append($("<div />").css('clear', 'both'));
				
				$stContentFoot = $('<div />').addClass('dpSocialTimelineContentFoot')
									.append((this.settings.showTime ? $($time) : ''))
									.append((this.settings.share ? $($tw_btn) : ''))
									.append((this.settings.share ? $($fb_btn) : ''));
									
				outputOptions.$dpSocialTimelineContent.append($("<div />").css('clear', 'both'));
				
				$li = $('<div>').addClass((afterLoad ? 'dpSocialTimeline_hideMe ' : '') +'dpSocialTimeline_item').addClass(this.item[x].name)
								.attr('data-list-number', x)
								.append($($stContentHead))
								.append($(outputOptions.$dpSocialTimelineContent))
								.append($($stContentFoot))
								.attr({'data-timeline-time': new Date( this.item[x].pubDate ).getTime()});
								
				$(outputOptions.$div).append($li);
				
			}	
		},
		
		_onLoadHook : function(outputOptions){
			var me = this;
			$(me.timeline).append($(outputOptions.$div).hide());
			
			
			$('img', me.timeline).dpSocialTimeline_batchImageLoad({
				
				loadingCompleteCallback: function(){
					if(outputOptions.showDivider) {
						// Clearfix
						$(me.timeline).prepend($('<div />').addClass('dpSocialTimeline_divider'));
					}
					
					if(outputOptions.appendLayout) {
						$(me.timeline).prepend(outputOptions.$dpSocialTimelineLayout);
					}
					
					if(outputOptions.appendFilter) {
						$(me.timeline).prepend(outputOptions.$dpSocialTimelineFilter);
					}

					$(outputOptions.$div).show();
					
					$(me.timeline).removeClass('dpSocialTimelineLoading');
								
					if(me.settings.layoutMode == "spineAlign")
						$(outputOptions.$dpSocialTimelineLineWrap).show();
					
					$(outputOptions.$div).removeClass('dpSocialTimeline_layout_timeline');
					$(outputOptions.$div).removeClass('dpSocialTimeline_layout_columns');
					$(outputOptions.$div).removeClass('dpSocialTimeline_layout_vertical');
					var layout_mode = me.settings.layoutMode;
					switch(me.settings.layoutMode) {
					  case "spineAlign":
						$(outputOptions.$div).addClass('dpSocialTimeline_layout_timeline');
						$('.dpSocialTimeline_item', outputOptions.$div).width(($(outputOptions.$div).outerWidth() - 50) / 2);
						layout_mode = 'masonry';
						break;
					  case "masonry":
						$(outputOptions.$div).addClass('dpSocialTimeline_layout_columns');
						break;
					  case "straightDown":
					  case "vertical":
						$(outputOptions.$div).addClass('dpSocialTimeline_layout_vertical');
						break;
				  }
				  
					$(outputOptions.$div).isotope({
					  // options
					  itemSelector : '.dpSocialTimeline_item',
					  layoutMode: layout_mode,
					  itemPositionDataEnabled: true,
					  getSortData : {
						  time : function ( $elem ) {
							return $($elem).attr('data-timeline-time');
						  }
					  },
					  sortBy : 'time',
					  sortAscending : false,
					  spineAlign: {
						gutterWidth: 20
					  },
					  transformsEnabled: (me.settings.rtl ? false : true),
					  onLayout: function( $elems, instance ) {
						  
						  $(outputOptions.$dpSocialTimelineLayout).find("button[data-style='"+me.settings.layoutMode+"']").addClass('active');
		
						  $('span', outputOptions.$dpSocialTimelineLine).fadeOut('fast', function() { $(this).remove(); } );
						  $elems.each(function(i) {
							  var spanPointer = $('<span />');
							  outputOptions.$dpSocialTimelineLine.append( spanPointer.css({top: ($(this).data('isotope-item-position').y + 18)}) );
						  });
					  }
					});
					
				
					//$(outputOptions.$div).isotope({ filter: '.dpSocialTimeline_item:lt('+( me.settings.total )+')' });
					
					$('.dpSocialTimeline_item:gt('+( me.settings.total - 1 )+')', outputOptions.$div).css({opacity : 0, scale : 0.001, display: 'none'});
					$('.dpSocialTimeline_item:lt('+( me.settings.total )+')', outputOptions.$div).css({opacity : 1, scale : 1, display: 'block'});
					
					$('.dpSocialTimeline_item', outputOptions.$div).width(me.settings.itemWidth);
					
					$(outputOptions.$div).isotope('layout');
					
					if(me.settings.addColorbox || me.settings.addLightbox) {
						$(outputOptions.$div).find(".addColorbox:not(.youtube)").magnificPopup({type: 'image'});
						$(outputOptions.$div).find(".addColorbox.youtube").magnificPopup({type: 'iframe'});
					}	
					
					me._updateTimelineSize();
					
					//$('.dpSocialTimeline_filter button[data-filter=".twitter"]').trigger('click');
				}
			});
			
		},
			
		_parseRSS : function(url, limit, int_val, fnk, num){
			if(url == null) return false;
			
			//encodeURIComponent
			//var gurl = this.prefix+"ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json_xml&callback=?&q="+encodeURIComponent(url);
			var gurl = this.prefix+"query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20'"+encodeURIComponent(url)+"'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
			if(limit != null && limit > 0 && typeof limit != 'undefined') gurl += "&num="+limit;
			else if($.isArray(limit)) gurl += "&num="+limit[int_val];
			else if(num != null) gurl += "&num="+num;
			
			if(url.indexOf('user_timeline.php') !== -1 
				|| url.indexOf('search.php') !== -1 
				|| url.indexOf('instagram.php') !== -1 
				|| url.indexOf('instagram_hash.php') !== -1 
				|| url.indexOf('foursquare.php') !== -1 
				|| url.indexOf('facebook_page.php') !== -1
				|| url.indexOf('youtube.php') !== -1
			) {
				gurl = url;	
				if(limit != null && limit > 0 && typeof limit != 'undefined') gurl += "&count="+limit;
				else if(num != null) gurl += "&count="+num;
			}
			
			$.getJSON(gurl, function(data){
				if(typeof fnk == 'function') {
					if(url.indexOf('user_timeline.php') !== -1 
							|| url.indexOf('search.php') !== -1 
							|| url.indexOf('instagram.php') !== -1 
							|| url.indexOf('instagram_hash.php') !== -1 
							|| url.indexOf('foursquare.php') !== -1 
							|| url.indexOf('facebook_page.php') !== -1
							|| url.indexOf('youtube.php') !== -1
						) 
					{
						fnk.call(this, data.responseData, int_val);
					} else {
						
						try 
						{
							data.query.results.rss.channel;

						} catch(err) { 
							console.log("Feed: "+gurl+" could not be loaded");
							fnk.call(this, false, int_val);
							return false;
						}
						
						fnk.call(this, data.query.results.rss.channel, int_val);

						
					}
				} else {
					return false;
				}
			});
		},
		
		preg_quote : function( str ) {
			// http://kevin.vanzonneveld.net
			// +   original by: booeyOH
			// +   improved by: Ates Goral (http://magnetiq.com)
			// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +   bugfixed by: Onno Marsman
			// *     example 1: preg_quote("$40");
			// *     returns 1: '\$40'
			// *     example 2: preg_quote("*RRRING* Hello?");
			// *     returns 2: '\*RRRING\* Hello\?'
			// *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
			// *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
		
			return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
		},
			
		// Convert Timestamp to "Time Ago"
		_relativeTime : function(time_value) {
	
			var parsed_date = time_value;
			var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
			var delta = parseInt((Date.UTC( relative_to.getFullYear(), relative_to.getMonth(), relative_to.getDate(), relative_to.getHours(), relative_to.getMinutes() ) - parsed_date) / 1000);
			//delta = delta + (relative_to.getTimezoneOffset() * 60);
			
			var r = '';
			if (delta < 60) { //60 sec
				r = this.settings.lang_less;
			} else if(delta < 120) { //2 min
				r = this.settings.lang_about+' 1 '+this.settings.lang_minute+' '+this.settings.lang_ago;
			} else if(delta < (60*60)) { //60 min
				r = this.settings.lang_about+' ' + (parseInt(delta / 60)).toString() + ' '+this.settings.lang_minutes+' '+this.settings.lang_ago;
			} else if(delta < (120*60)) { //2 hours
				r = this.settings.lang_about+' 1 '+this.settings.lang_hour+' '+this.settings.lang_ago;
			} else if(delta < (24*60*60)) { //1 day
				r = this.settings.lang_about+' ' + (parseInt(delta / 3600)).toString() + ' '+this.settings.lang_hours+' '+this.settings.lang_ago;
			} else if(delta < (48*60*60)) { //2 days
				r = '1 '+this.settings.lang_day + ' '+ this.settings.lang_ago;
			} else { // > 2 days
				r = (parseInt(delta / 86400)).toString() + ' '+this.settings.lang_days + ' '+ this.settings.lang_ago;
			}
			
			return r;
		},
			
		_getImage : function(entry, returnSrc){
		
			var backRefs = new Array();
			var re = /<img .*?src=["\']([^ ^"^\']*)["\']/gi;
			var matches;
			var width = "";
			var html = entry.content;
			var alt = entry.title;
			
			if(typeof html == 'undefined') {
				html = entry.description;
			}

			if(entry.thumbnail != "" && typeof entry.thumbnail !== "undefined") {
				backRefs[0] = entry.thumbnail;
			} else {
				while (matches = re.exec(html)) {
					
					backRefs.push(matches[1]);
				}
			}
			
			if(typeof backRefs[0] == "undefined" || backRefs[0] == null) {
				return false;
			}
			if($.type(backRefs[0]) == 'object') {
				backRefs[0] = backRefs[0].url;
			}
			
			if(backRefs.length > 0 && backRefs[0].indexOf('sndcdn.com') === -1) {
				var image = backRefs[0];
				if(image.indexOf('instagram.com/profiles') !== -1) { image = backRefs[1]; }
				image = image.replace("_m.jpg", ".jpg");
				if(image.indexOf('fbcdn') == -1) {
					image = image.replace("_b.jpg", "_f.jpg");
					image = image.replace("_b.png", "_f.png");
				} else {
					//image = image.replace("_t.jpg", "_b.jpg");
					//image = image.replace("_t.png", "_b.png");					
					
					if(image.indexOf('safe_image.php') == -1 && false) {
						var pic_id = image.split("_");
						object_id = pic_id[1];
						image = 'https://graph.facebook.com/'+object_id+'/picture?type=normal';
					}
				}
				image = image.replace("_s.jpg", "_b.jpg");
				image = image.replace("_m.png", ".png");
				image = image.replace("_s.png", "_b.png");
				image = image.replace("236x/", "736x/");
				//image = image.replace("&amp;", "");
				image = image.replace(/\&amp;/g,'&');
				
				
				/*image = image.replace("/v/t1.0-0/", "/t1.0-0/");
				image = image.replace("/v/l/t1.0-0/", "/t1.0-0/");
				image = image.replace("/v/l/t1.0-9/", "/t1.0-9/");
				image = image.replace("/t1.0-9/", "/");
				image = image.replace("/v/", "/");
				image = image.replace("/s130x130/", "/");
				image = image.replace("/p130x130/", "/");
				image = image.replace("/p100x100/", "/");
				image = image.replace("/p118x90/", "/");
				image = image.replace("/192x/", "/736x/");*/
				if(image.indexOf('safe_image.php') != -1) {
					image = unescape(image.match(/url=([^&]+)/)[1]);
				}
				if(image.indexOf('app_full_proxy.php') != -1) {
					image = unescape(image.match(/src=([^&]+)/)[1]);
				}
				width = ((this.settings.itemWidth != "" ? this.settings.itemWidth : 200) - 40);
				
				if(this.prefix == 'https://') {
					var image_tmp = image.replace('http://', 'https://');	
					
					//if(this._checkImage(image_tmp)) {
						image = image_tmp;
					//}
				}
				
				if(returnSrc) {
					return image;
				} else {
					return $('<img />').attr({ src: image, alt: alt }).addClass('item_thumb').css({width:'98%'});
				}
			} else {
				return false
			}
		
		},
		
		_checkImage : function(src) {
		  var img = new Image();
		  img.onload = function() {
			return true;
		  };
		  img.onerror = function() {
			return false;
		  };
		
		  img.src = src; // fires off loading of image
		},
			
		_getYoutubeVideo : function(html){
		
			return html.replace(/https:\/\/(www.)?(youtu.be\/|youtube.com\/watch\?v=)([a-zA-Z0-9?%.;:\\/=+_-]+)([&]*([a-zA-Z0-9?&%.;:\\/=+_-]*))/i, 'http://www.youtube.com/v/$3?fs=1&amp;hl=en_US');
		
		},
		
		_getYoutubeId: function(url){
			var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
			var match = url.match(regExp);
			if (match&&match[1].length==11){
				return match[1];
			}
			
			return false;
		},
		
		_getVimeoVideo : function(html){
		
			return html.replace(/http:\/\/(www.)?(vimeo.com\/)([a-zA-Z0-9?%.;:\\/=+_-]+)([&]*([a-zA-Z0-9?&%.;:\\/=+_-]*))/i, 'http://player.vimeo.com/video/$3');
		
		},
		
		_linkify : function(html){
			if(!html) {
				return;	
			}
			if($.isArray(html)) {
				html = html[0];
			}
			return html.replace(/(\b((https?|ftp|file):\/\/|(www.))[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, function(m) {

				if(m.indexOf('://') === -1) {
					m = "http://"+m;
				}
				return '<a href="'+m+'" target="_blank">'+m+'</a>';
			});
		
		}
	}
	$.fn.dpSocialTimeline = function(options){  

		var dpSocialTimeline;
		this.each(function(){

			dpSocialTimeline = new SocialTimeline($(this), options);
			$(this).data("dpSocialTimeline", dpSocialTimeline);
			
		});
		
		return this;

	}
	
  	/* Default Parameters and Events */
	$.fn.dpSocialTimeline.defaults = {  
		feeds: null, // Feeds
		layoutMode: 'timeline',
		addColorbox: false,
		addLightbox: false,
		showSocialIcons: true,
		showFilter: true,
		allowMultipleFilters: true,
		showLayout: true,
		showLayoutTimeline: true,
		showLayoutColumns: true,
		rtl: false,
		cache: false,
		cacheTime: 900,
		showTime: true,
		showLayoutOneColumn: true,
		itemWidth: 200,
		share: true,
		timelineItemWidth: '',
		columnsItemWidth: '',
		oneColumnItemWidth: '',
		skin: 'light',
		total: 10 // Total items to retrieve
	};  
	
	$.fn.dpSocialTimeline.settings = {}
	
	$.fn.dpSocialTimeline_batchImageLoad = function(options) {
		var images = $(this);
		var originalTotalImagesCount = images.size();
		var totalImagesCount = originalTotalImagesCount;
		var elementsLoaded = 0;
	
		// Init
		$.fn.dpSocialTimeline_batchImageLoad.defaults = {
			loadingCompleteCallback: null, 
			imageLoadedCallback: null
		}
		var opts = $.extend({}, $.fn.dpSocialTimeline_batchImageLoad.defaults, options);
			
		// Start
		images.each(function() {
			// The image has already been loaded (cached)
			if ($(this)[0].complete) {
				totalImagesCount--;
				if (opts.imageLoadedCallback) opts.imageLoadedCallback(elementsLoaded, originalTotalImagesCount);
			// The image is loading, so attach the listener
			} else {
				$(this).load(function() {
					elementsLoaded++;
					
					if (opts.imageLoadedCallback) opts.imageLoadedCallback(elementsLoaded, originalTotalImagesCount);
	
					// An image has been loaded
					if (elementsLoaded >= totalImagesCount)
						if (opts.loadingCompleteCallback) opts.loadingCompleteCallback();
				});
				$(this).error(function() {
					elementsLoaded++;
					
					if (opts.imageLoadedCallback) opts.imageLoadedCallback(elementsLoaded, originalTotalImagesCount);
						
					// The image has errored
					if (elementsLoaded >= totalImagesCount)
						if (opts.loadingCompleteCallback) opts.loadingCompleteCallback();
				});
			}
		});
	
		// There are no unloaded images
		if (totalImagesCount <= 0)
			if (opts.loadingCompleteCallback) opts.loadingCompleteCallback();
	};

	try {
	// custom layout mode spineAlign
	$.Isotope.prototype._spineAlignReset = function() {
		this.spineAlign = {
			colA: 0,
			colB: 10
		};
	};
	
	$.Isotope.prototype._spineAlignLayout = function( $elems ) {
		var instance = this,
		props = this.spineAlign,
		gutterWidth = Math.round( this.options.spineAlign && this.options.spineAlign.gutterWidth ) || 0,
		centerX = Math.round(this.element.width() / 2);
		
		$elems.each(function(){
			var $this = $(this),
			isColA = props.colB > props.colA,
			x = isColA ?
			centerX - ( $this.outerWidth(true) + gutterWidth / 2 ) : // left side
			centerX + gutterWidth / 2, // right side
			y = isColA ? props.colA : props.colB;
			instance._pushPosition( $this, x, y );
			
			if(isColA) { $this.removeClass('colB').addClass('colA'); } else { $this.removeClass('colA').addClass('colB'); }
			props[( isColA ? 'colA' : 'colB' )] += $this.outerHeight(true);
		});
	};
	
	$.Isotope.prototype._spineAlignGetContainerSize = function() {
		var size = {};
		size.height = this.spineAlign[( this.spineAlign.colB > this.spineAlign.colA ? 'colB' : 'colA' )];
		return size;
	};
	
	$.Isotope.prototype._spineAlignResizeChanged = function() {
		return true;
	};
	
	$.Isotope.prototype._positionAbs = function( x, y ) {
	  return { right: x, top: y };
	};
  	
	} catch(err) {}
})(jQuery);