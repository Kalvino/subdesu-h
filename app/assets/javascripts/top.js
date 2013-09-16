$(document).ready(function() {
  if($.cookie('melissa_user_name') && $('#your-content').length > 0) {
    $("#your-content").load ("/themes/default/ajax/ajax.your.content.php", { language: 'en', username: $.cookie('melissa_user_name') });
  }
});$(document).ready(function() {
		function displayWidgetButton() {
	if($.cookie('melissa_display_name') && $.cookie('melissa_user_name') && $.cookie('melissa_avatar')) {
		$('#upload-widget-form').hide();
		$('#upload-widget-button').show();
		$('#upload-widget-box').hide();
	} else {
		$('#upload-widget-form').show();
		$('#upload-widget-button').hide();
		$('#upload-widget-box').hide();
	}
}

function displayWidget() {
	var language = $('#upload-widget-button').attr('class');
	var page = location.pathname;
	$('#upload-widget-button').hide();
	$('#upload-widget-form').hide();
	$('#upload-widget-box').show();
	$('#upload-widget-box').html('<div class="loading">&nbsp;</div>');
	$('#upload-widget-box').load ("/themes/default/ajax/ajax.upload.widget.php", { language: language }, function (response, status) {
		if(status == 'error') {
			$('#upload-widget-box').hide();
			var url = encodeURIComponent(window.location.pathname);
			if(response=='revoked') {
				window.location.replace("/melissa/site/en/signin/?e=8&redirect="+url);
			} else {
				window.location.replace("/melissa/site/en/signin/?redirect="+url);
			}
		}
	} );
}

displayWidgetButton();
	
$('#upload-widget-button .btn').click (function (event) {
	event.preventDefault();
	displayWidget();
});

$('#upload-widget-cancel-button').live("click", function (event) {
	event.preventDefault();
	displayWidgetButton();
});

if($.cookie('upload_widget') && $.cookie('melissa_display_name') && $.cookie('melissa_user_name') && $.cookie('melissa_avatar')) {
	displayWidget();
	$.cookie('upload_widget', null, { path: '/' })
}	
	//$("#puchi-blurbs-form-wrapper").load ("/themes/default/ajax/ajax.puchi.blurbs.form.php", { language: 'en' });
	//$("#puchi-blurbs-list-wrapper").load ("/themes/default/ajax/ajax.puchi.blurbs.php", { language: 'en' });

	//$('.puchi-blurbs-more').live ('click', function (event) {
	//	event.preventDefault();
	//	var more_id = this.id;
	//	var settings = more_id.split("-");
	//	var max = parseInt(settings[3]) + 10;
	//	$("#puchi-blurbs-list-wrapper").load ("/themes/default/ajax/ajax.puchi.blurbs.php", { language: 'en', max : max });
	//});
	
	//var puchiBlurbsInterval;
	//$('#refresh_puchi_blurbs').live('click', function () { 
	//	if ($('#refresh_puchi_blurbs').is(':checked')) {
	//		$('#puchi-blurbs-refresh-loading').show();
	//		$('#puchi-blurbs-refresh label').html('Refreshing every 5 seconds');
	//		puchiBlurbsInterval = setInterval(refreshPuchiBlurbs, 5000);
	//	} else {
	//		$('#puchi-blurbs-refresh-loading').hide();
	//		$('#puchi-blurbs-refresh label').html('Refresh every 5 seconds');
	//		clearInterval(puchiBlurbsInterval);
	//	}
	//});

	//function refreshPuchiBlurbs() {
	//	var more_id = $('.puchi-blurbs-more').attr('id');
	//	var settings = more_id.split("-");
	//	var max = settings[3];
	//	$('#puchi-blurbs-list-wrapper').load("/themes/default/ajax/ajax.puchi.blurbs.php", { language: 'en', max : max });
	//}
	
		});
