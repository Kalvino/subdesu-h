$(document).ready(function() {

  $('#mg-special-logo-menu').css('right', "-" + $("#mg-special-logo-menu").width() + "px");

  $('.special-logo').hoverIntent({
      over: function () {
        var dropdown = $("#mg-special-logo-menu");
        dropdown.css("right", "-" + (dropdown.width() - 10) + "px");
        dropdown.animate({
          "right": "-" + (dropdown.width() + 10) + "px",
          "opacity": "toggle"
        }, 250);
      },
      timeout: 200,
      interval: 30,
      out: function () {
        var dropdown = $("#mg-special-logo-menu");
        dropdown.animate({
          "right": "-" + (dropdown.width() + (10*4))+"px",
          "opacity": "toggle"
        }, 400, function() {
          dropdown.css("right", "-" + (dropdown.width() - 10) + "px");
        });
      }
  });

  if(!($.browser.msie && $.browser.version=="6.0")) {
      $('#special-bg-slideshow .bg-slide').each(function(i) {
        $(this).show();
      });

      if($('#special-bg-slideshow .bg-slide').length > 1) {
        // Preload next/prev hover states
        var slideshow_next = new Image();
        slideshow_next.src = "http://www.subdesu-h.net/wp-content/themes/CustomWPTheme/www.subdesu-h.net/public/img/subdesu/slideshow-next-hover.png?1332902159";
        var slideshow_prev = new Image();
        slideshow_prev.src = "http://www.subdesu-h.net/wp-content/themes/CustomWPTheme/www.subdesu-h.net/public/img/subdesu/slideshow-prev-hover.png?1332902159";

        $('#special-bg-slideshow-next').show();
        $('#special-bg-slideshow-prev').show();
      }

      $('#special-bg-slideshow').cycle({
        fx: 'fade',
        speed: 600,
        timeout: 10000,
        next: '#special-bg-slideshow-next',
        prev: '#special-bg-slideshow-prev'
      });

  //  if(!($.browser.msie)) {
  //    $('.special-slideshow-button').each(function(i) {
  //      $(this).show();
  //    });
  //    $(".special-slideshow-button").fadeTo("slow", 0); // This sets the opacity to 0 on page load
  //    $("#special-slideshow").hover(function(){
  //      $(".special-slideshow-button").fadeTo("slow", 1.0); // This sets the opacity to 100% on hover
  //    },function(){
  //      $(".special-slideshow-button").fadeTo("slow", 0); // This sets the opacity back to 0 on mouseout
  //    });
  //  } else {
  //    $(".special-slideshow-button").hide();
  //    $("#special-slideshow").hover(function(){
  //      $(".special-slideshow-button").show();
  //    },function(){
  //      $(".special-slideshow-button").hide();
  //    });
  //  }
  } else {
    $('#special-bg-slideshow img:first').show();
  }

});