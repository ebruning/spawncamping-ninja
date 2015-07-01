window.onload = function() {
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
}
