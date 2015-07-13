$(document).ready(function() {
  $("#image-section").hide("slow", function() {
  	console.log("hide");
  });

  $("#rtti-section").hide("slow", function() {
    console.log("hide");
  });

  $("#slideImage").click(function () {
   $('#image-section').slideToggle();

   if ($("#slideImageButton").hasClass('glyphicon-chevron-down')) {
     $("#slideImageButton").addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');
   }
   else {
     $("#slideImageButton").addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-right');
   }
  });

  $("#slideRtti").click(function () {
   $('#rtti-section').slideToggle();

   if ($("#slideRttiButton").hasClass('glyphicon-chevron-down')) {
     $("#slideRttiButton").addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');
   }
   else {
     $("#slideRttiButton").addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-right');
   }
  });
});
