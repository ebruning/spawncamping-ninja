window.onload = function() {
  var serverResponse;
  var instruction = document.getElementById('ins-result');
  var resultData = document.getElementById('rtti-result');
  var showDiagnosticInformation = false;

  var regionUls = {
    "United States": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True",
    "Canada": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true",
    "Africa": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True",
    "Asia": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true",
    "Australia": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True",
    "Europe": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true",
    "Latin America": "//mobiledemo.kofax.com/mobilesdk/api/mobileid?xCropImage=True",
    "Singapore": "//mobiledemo.kofax.com/mobilesdk/api/checkdeposit1_1?processimage=true"
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
              alert(message);
          }

          serverResponse = JSON.parse(data);
          if (serverResponse.error) {
              alert("Error in server response: " + serverResponse.error);
          } else {
              displayExtractedFields(serverResponse.fields);
          }
      }, function(errorResponse) {
          alert('Error in processing request: ' + errorResponse.errorMessage);
      });
  });
  function displayExtractedFields(res) {
    var dynamicHTML = "<div>";
    for (var field in res) {
      dynamicHTML += "<div><h6>" + res[field].name + "</h6></div><div><input type='text' style='height:50px;font-size:20px;padding-left:5px;padding-right:10px' value='" + res[field].text + "'disabled='disabled' /></div><br/>";
    }
    dynamicHTML += "</div>";
    resultData.innerHTML = dynamicHTML;
    instruction.innerHTML = '';
  }

};
