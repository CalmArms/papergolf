(() => {
    // The width and height of the captured photo. We will set the
    // width to the value defined here, but the height will be
    // calculated based on the aspect ratio of the input stream.

    const width = window.innerWidth; // We will scale the photo width to this
    let height = window.innerHeight; // This will be computed based on the input stream

    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.

    let streaming = false;

    // The various HTML elements we need to configure or control. These
    // will be set by the startup() function.

    let video = null;
    let canvasPrior = null;
    let canvasNext = null;
    let startbutton = null;

    function startup() {
        video = document.getElementById("video");
        video.playsInline = true
        canvasPrior = document.getElementById("canvasPrior");
        canvasNext = document.getElementById("canvasNext");
        startbutton = document.getElementById("done");

        navigator.mediaDevices
            .getUserMedia({
                video: {
                    facingMode: 'environment'
                },
                audio: false
            })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });

        video.addEventListener(
            "canplay",
            (ev) => {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    // Firefox currently has a bug where the height can't be read from
                    // the video, so we will make assumptions if this happens.

                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute("width", width);
                    video.setAttribute("height", height);
                    canvasPrior.setAttribute("width", width);
                    canvasPrior.setAttribute("height", height);
                    canvasNext.setAttribute("width", width);
                    canvasNext.setAttribute("height", height);
                    streaming = true;
                }
            },
            false,
        );

        startbutton.addEventListener(
            "click",
            (ev) => {
                takepicture();
                ev.preventDefault();
            },
            false,
        );
    }

    function takepicture() {
        if (state.isFirstHit) {
            console.log('first hit')
            const contextNext = canvasNext.getContext("2d");
              // set contextPrior to the current contextNext
            canvasNext.width = width;
            canvasNext.height = height;
            contextNext.drawImage(video, 0, 0, width, height);
            state.isFirstHit = false
            return
        }
        console.log('non-first hit')

        const contextPrior = canvasPrior.getContext("2d");
        const contextNext = canvasNext.getContext("2d");
        if (width && height) {
            // set contextPrior to the current contextNext
            canvasPrior.width = canvasNext.width;
            canvasPrior.height = canvasNext.height;
            // contextPrior.drawImage(canvasNext, 0, 0, width, height);
            const data = contextNext.getImageData(0, 0, width, height);
            contextPrior.putImageData(data, 0, 0);


            // set contextNext to the current video frame
            canvasNext.width = width;
            canvasNext.height = height;
            contextNext.drawImage(video, 0, 0, width, height);

            const stroke = magicStroke("canvasPrior", "canvasNext");

            if (stroke) {
                golfBall.setVelocity(stroke.dx, stroke.dy);
            }

            addHit()
            changeScreen('pre-shot')
        }
    }

    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener("load", startup, false);
})();