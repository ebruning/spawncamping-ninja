(function () {
    var INVALID_SRC_MSG = "Please give valid source id. KfxMobileCapture is expecting file input element as source";
    var INVALID_TARGET_MSG = "Please give valid target id. KfxMobileCapture is expecting image or canvas element as Target";
    var NO_API_SUPPORT = "Neither createObjectURL or FileReader are supported";
    var pictureInput, targetOutput, targetWidth, targetHeight, scale, captureCallback, utf8ImageArray;
    var scaleMegapixels;
    /** KfxMobileCapture class
    
    @param options: JSON object
    EX:
    {sourceId:'sourceId',targetId:'targetId',width: 600, height: 600}
    @param callback: callback returning utf8 array representation of image after successful rendering otherwise error messages
    
    */
    var KfxMobileCapture = function (options, callback) {
        validateKfxMobileCaptureOptions(options, callback);
        captureCallback = callback;
        scale = options.scale;
        scaleMegapixels = options.scaleMegapixels;
        targetWidth = options.width;
        targetHeight = options.height;
    }

    function validateKfxMobileCaptureOptions(options, callback) {

        // validating input source and adding listeners
        if (document.getElementById(options.sourceId) != null && document.getElementById(options.sourceId).tagName.toLowerCase() === "input") {
            pictureInput = document.getElementById(options.sourceId);
            pictureInput.addEventListener('change', function imageSelected(e) {
                pictureInput.removeEventListener('change', imageSelected);
                onPictureSelection.call(this, e);
            });
        } else {
            throwOptionsValidationError(callback, INVALID_SRC_MSG);
        }

        //validating target
        if (options.targetId === null || typeof options.targetId === 'undefined') {
            targetOutput = document.createElement('canvas');
        } else if (document.getElementById(options.targetId) != null && (document.getElementById(options.targetId).tagName.toLowerCase() === "img" || document.getElementById(options.targetId).tagName.toLowerCase() === "canvas")) {
            targetOutput = document.getElementById(options.targetId);
        } else {
            throwOptionsValidationError(callback, INVALID_TARGET_MSG);
        }

    }

    // Called when a picture is taken or selected from the gallery
    var onPictureSelection = function (event) {

        // Get a reference to the taken picture or chosen file
        var files = event.target.files,
            file;
        if (files && files.length > 0) {
            file = files[0];
            try {
                setImageSource(file);
            } catch (e) {
                try {
                    // Fallback if createObjectURL is not supported
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        setImageSource(event.target.result);
                    };
                    fileReader.readAsDataURL(file);

                } catch (e) {

                    if (captureCallback && typeof captureCallback === 'function')
                        captureCallback(NO_API_SUPPORT);

                }
            }

            var fr = new FileReader();
            fr.onload = function () {
                utf8ImageArray = new Uint8Array(this.result);
            }
            fr.readAsArrayBuffer(file);

        }
    }

    /**
   * setting Image 
   */
    function setImageSource(srcImage) {
        if (window.Blob && srcImage instanceof Blob) {
            if (!URL) {
                throw Error("No createObjectURL function found to create blob url");
            }
            var img = new Image();
            img.src = URL.createObjectURL(srcImage);
            srcImage = img;
        }
        if (!srcImage.naturalWidth && !srcImage.naturalHeight) {
            srcImage.onload = srcImage.onerror = function () {
                render(targetOutput);
            };
        }
        this.srcImage = srcImage;
    }

    /**
   * Rendering image into specified target element
   */
    function render(target) {

        var tagName = target.tagName.toLowerCase();
        if (tagName === 'img') {
            target.src = renderImageToDataURL(this.srcImage);
        } else if (tagName === 'canvas') {
            renderImageToCanvas(this.srcImage, target);
        }

        if (captureCallback && typeof captureCallback === 'function') {
            captureCallback(utf8ImageArray);
        }
    };

    /**
       * Detect subsampling in loaded image.
       * In iOS, larger images than 2M pixels may be subsampled in rendering.
       */
    function doImageScaling(img) {
        var iw = img.naturalWidth, ih = img.naturalHeight;
        if (iw * ih > 1024 * 1024) {
            var canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, -iw + 1, 0);
            return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
        } else {
            return false;
        }
    }

    /**
   * Rendering image element (with resizing) and get its data URL
   */
    function renderImageToDataURL(img) {
        var canvas = document.createElement('canvas');
        renderImageToCanvas(img, canvas);
        return canvas.toDataURL("image/jpeg", 1);
    }

    /**
   * Rendering image element (with resizing) into the canvas element
   */
    function renderImageToCanvas(img, canvas) {
        var iw = img.naturalWidth, ih = img.naturalHeight;
        if (!(iw + ih)) return;
        var width, height;

        if (targetWidth !== null && typeof targetWidth !== 'undefined') {
            width = targetWidth;
        } else {
            width = iw;
        }

        if (targetHeight !== null && typeof targetHeight !== 'undefined') {
            height = targetHeight;
        } else {
            height = ih;
        }

        if (scaleMegapixels) {
            var megapixels = width * height / (1024 * 1024);
            if (megapixels <= scaleMegapixels) {
                scale = 1;
            } else {
                scale = Math.sqrt(scaleMegapixels / megapixels);
            }
        }

        if (scale) {
            width = width * scale;
            height = height * scale;
        }

        var ctx = canvas.getContext('2d');
        ctx.save();

        canvas.width = width;
        canvas.height = height;
        var subsampled = doImageScaling(img);
        if (subsampled) {
            iw /= 2;
            ih /= 2;
        }
        var d = 1024; // size of tiling canvas
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = tmpCanvas.height = d;
        var tmpCtx = tmpCanvas.getContext('2d');

        var dw = Math.ceil(d * width / iw);
        var dh = Math.ceil(d * height / ih);
        var sy = 0;
        var dy = 0;
        while (sy < ih) {
            var sx = 0;
            var dx = 0;
            while (sx < iw) {
                tmpCtx.clearRect(0, 0, d, d);
                tmpCtx.drawImage(img, -sx, -sy);
                ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
                sx += d;
                dx += dw;
            }
            sy += d;
            dy += dh;
        }

        ctx.restore();
        utf8ImageArray = dataUrlToUint8Array(canvas.toDataURL("image/jpeg"));
        tmpCanvas = tmpCtx = null;
    }

    function dataUrlToUint8Array(data) {
        var base64 = data.replace(/^data:image\/(jpeg|jpg|png);base64,/, ""); // Remove leading mimetype
        var base64Map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var length = Math.floor(base64.length) / 4 * 3;
        if (base64Map.charAt(base64.length - 1) === '=') {
            length--;
        }
        if (base64Map.charAt(base64.length - 2) === '=') {
            length--;
        }
        var binary = new Uint8Array(length);
        var byteIndex = 0;
        for (var i = 0; i < base64.length; i += 4) {
            var c1 = base64Map.indexOf(base64.charAt(i + 0));
            var c2 = base64Map.indexOf(base64.charAt(i + 1));
            var c3 = base64Map.indexOf(base64.charAt(i + 2));
            var c4 = base64Map.indexOf(base64.charAt(i + 3));
            var b1 = (c1 << 2) | (c2 >> 4);
            var b2 = ((c2 & 15) << 4) | (c3 >> 2);
            var b3 = ((c3 & 3) << 6) | c4;
            binary[byteIndex] = b1;
            //console.log('b1: ' + b1);
            if (c3 != 64) {
                binary[byteIndex + 1] = b2;
                //console.log('b2: ' + b2);
            }
            if (c4 != 64) {
                binary[byteIndex + 2] = b3;
                //console.log('b3: ' + b3);
            }
            byteIndex += 3;
        }
        return binary;
    }

    function throwOptionsValidationError(callback, MSG) {
        if (callback && typeof callback === 'function')
            callback(MSG);
    }

    /**
   * Export base64 data to given RTTI url by converting it into UTF-8
   @param options: JSON object
EX:
{utf8Image:'utf8Image',url:'url'}
@param callback: callback returning status
   */
    KfxMobileCapture.prototype.export = function (options, callback, errorCallback) {
        var mypostrequest = new ajaxRequest()
        mypostrequest.onreadystatechange = function () {
            if (mypostrequest.readyState == 4) {
                if (mypostrequest.status == 200 || window.location.href.indexOf("http") == -1) {
                    if (typeof callback === 'function')
                        callback(mypostrequest.responseText);
                } else {
                    if (typeof errorCallback === 'function')
                        errorCallback({ errorMessage: mypostrequest.responseText });
                }
            }
        }
        mypostrequest.open('put', options.url, true);
        mypostrequest.setRequestHeader("Content-Type", 'image/jpeg');
        mypostrequest.send(options.utf8Image);

    }

    function ajaxRequest() {
        var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
        if (window.ActiveXObject) { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
            for (var i = 0; i < activexmodes.length; i++) {
                try {
                    return new ActiveXObject(activexmodes[i])
                } catch (e) {
                    //suppress error
                }
            }
        } else if (window.XMLHttpRequest) // if Mozilla, Safari etc
            return new XMLHttpRequest()
        else
            return false
    }

    /**
   * Export class to global
   */
    if (typeof define === 'function' && define.amd) {
        define([], function () { return KfxMobileCapture; }); // for AMD loader
    } else {
        this.KfxMobileCapture = KfxMobileCapture;
    }

})();