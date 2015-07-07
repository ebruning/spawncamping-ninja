/*jshint devel:true */

window.onload = function() {
  var serverResponse;
  var instruction = document.getElementById('ins-result');
  var resultData = document.getElementById('rtti-result');
  var showDiagnosticInformation = false;

  var regionUls = {
    "United States": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True",
    "Canada": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true&xregion=Canada",
    "Africa": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True&xregion=Africa",
    "Asia": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true&xregion=Asia",
    "Australia": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True&xregion=Australia",
    "Europe": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true&xregion=Europe",
    "Latin America": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True&xregion=Latin%20America",
    "Singapore": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true&xregion=Asia"
  };

  var select = document.getElementById('regionSelect');

  select.innerHTML = Object.keys(regionUls).map(function (data) {
    return '<option value="' + regionUls[data] + '">' + data + '</option>';
  });

  var kfxImage = new KfxMobileCapture({ sourceId: 'take-picture', targetId: 'raw-canvas', scaleMegapixels: 1.2 }, function (res) {
      var startTime = new Date();
      var originalSize = document.getElementById('take-picture').files[0].size / 1024;
      var scaledSize = res.length / 1024;

      instruction.innerHTML = 'Please wait... While getting response from server';
      kfxImage.export({ utf8Image: res, url: select.value }, function (data) {
          var finishTime = new Date();
          var delta = (finishTime - startTime) / 1000;
          var message = 'Original Size: ' + originalSize + ' kb\nScaled Size: ' + scaledSize + ' kb.\nTime: ' + delta + ' seconds.';
          if (showDiagnosticInformation) {
              instruction.innerHTML = message;
          }

          serverResponse = JSON.parse(data);
          if (serverResponse.error) {
              instruction.innerHTML = "Error in server response: " + serverResponse.error;
          } else {
              displayExtractedFields(serverResponse.fields);
          }
      }, function(errorResponse) {
          instruction.innerHTML = 'Error in processing request: ' + errorResponse.errorMessage;
      });
  });

  function parseFieldName(name) {
    if ((name === "Address") ||
        (name === "City") ||
        (name === "Sate") ||
        (name === "ZIP") ||
        (name === "Country") ||
        (name === "Gender") ||
        (name === "Eyes") ||
        (name === "Hair") ||
        (name === "Height") ||
        (name === "License")) {
      return name;
    }

    if(name === "FirstName"){
      return "First Name";
    }

    if(name === "MiddleName"){
      return "Middle Name";
    }

    if(name === "LastName"){
      return "Last Name";
    }

    if(name === "IDNumber"){
      return "ID Number";
    }

    if(name === "IssueDate"){
      return "Issue Date";
    }
  }

  function displayExtractedFields(res) {
    var fields = [
      "FirstName",
      "MiddleName",
      "LastName",
      "IDNumber",
      "Address",
      "City",
      "Sate",
      "ZIP",
      "Country",
      "Gender",
      "Eyes",
      "Hair",
      "Height",
      "IssueDate",
      "License"
    ];

    var dynamicHTML = "<div>";

    for (var field in res) {
    	for (var count = 0; count < fields.length; count++ ) {
    		if (res[field].name === fields[count]) {
          dynamicHTML += "<div id=\"index-field\">" + parseFieldName(fields[count]) + "</div><div><input id=\"index-text\" type='text' value='" + res[field].text + "'disabled='disabled' /></div><br/>";
    			break;
    		}
    	}
    }

    dynamicHTML += "</div>";
    resultData.innerHTML = dynamicHTML;
    instruction.innerHTML = '';
  }
};
