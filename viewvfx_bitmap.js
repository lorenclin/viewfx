let frames = [];
let nFrame = 0;

document.addEventListener("DOMContentLoaded", () => {
    let tmpCanvas, tmpCanvasContext; 
    let mediaSource01 = "http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv";
    let mediaSource02 = "media/pro01Blur.mp4";
    mediaSource01 = "media/pro01.mp4";
    mediaSource02 = "media/pro01.mp4";

    let muted = true;
    let canvas = document.getElementById('output-canvas'); // get the canvas from the page
    let canvasContext = canvas.getContext("2d");
    let videoContainer, videoContainer02; // object to hold video and associated info
    let video02 = document.createElement("video"); // create a video element
    let video = document.createElement("video"); // create a video element

    video.src = mediaSource01;
    video02.src = mediaSource02;

    // the video will now begin to load.
    // As some additional info is needed we will place the video in a
    // containing object for convenience
    video.autoPlay = false; // ensure that the video does not auto play
    video.loop = false; // set the video to not loop.
    video.muted = muted;

    video02.autoPlay = false;
    video02.loop = false;
    video02.muted = true;

    videoContainer = {  // we will add properties as needed
        video : video,
        ready : false,
        isPause : true 
    };
    videoContainer02 = {  // we will add properties as needed
        video : video02,
        ready : false,   
    };

    //video02.oncanplay = readyToPlayVideo02;
    video.oncanplay = readyToPlayVideo; // set the event to the play function that can be found below
    
    function readyToPlayVideo02(event){
        videoContainer02.ready = true;
    }

    async function getVideoTrack() {
        await videoContainer.video.play();
        const [track] = video.captureStream().getVideoTracks();
        video.onended = (evt) => track.stop();
        return track;
    }

    async function readyToPlayVideo(event){ // this is a referance to the video
        if (window.MediaStreamTrackProcessor) {
            console.log("MediaStreamTrackProcessor");
            const track = await getVideoTrack();
            const processor = new MediaStreamTrackProcessor(track);
            const reader = processor.readable.getReader();
            readChunk();
        
            function readChunk() {
                reader.read().then(async({ done, value }) => {
                    console.log(done);
                    if (value) {
                        const bitmap = await createImageBitmap(value);
                        const index = frames.length;
                        frames.push(bitmap);
                        //select.append(new Option("Frame #" + (index + 1), index));
                        value.close();
                    }
                    if (!done) {
                        readChunk();
                    } else {
                        // Once image is loaded into buffer
                        console.log("Loaded!");
                        console.log(frames.length, " frames.");

                        // the video may not match the canvas size so find a scale to fit
                        videoContainer.scale = Math.min(
                            canvas.width / this.videoWidth, 
                            canvas.height / this.videoHeight
                        );

                        videoContainer.ready = true;
                        // the video can be played so hand it off to the display function
                        requestAnimationFrame(updateCanvas);
                    }
                });
            }
            //playPauseClick();
        } else {
          console.error("your browser doesn't support this API yet");
        }
    }

    function updateCanvas(){
        canvasContext.clearRect(0,0,canvas.width,canvas.height);

        // only draw if loaded and ready
        if(videoContainer !== undefined && videoContainer.ready){ 
            // find the top left of the video on the canvas
            //video.muted = muted;
            var scale = videoContainer.scale;
            var vidH = videoContainer.video.videoHeight;
            var vidW = videoContainer.video.videoWidth;
            var top = canvas.height / 2 - (vidH /2 ) * scale;
            var left = canvas.width / 2 - (vidW /2 ) * scale;

            console.log("loading frame ", nFrame);
            const frame = frames[nFrame];

            // now just draw the video the correct size
            //canvasContext.drawImage(frame, left, top, vidW * scale, vidH * scale);
            canvasContext.drawImage(frame, 0, 0, 800, 400)//, vidW*scale, vidH);

            // Black and White Filter
            let mixAmount = 1; // filter mix
            /*canvasContext.fillStyle = "#888"; // gray colour
            canvasContext.globalAlpha = mixAmount;   // amount of FX
            canvasContext.globalCompositeOperation = "color";  // The comp setting to do BLACK/WHITE
            canvasContext.fillRect(0,0, vidW, vidH);*/

            // Diff Code
            //canvasContext.globalAlpha = mixAmount;   // amount of FX
            //canvasContext.globalCompositeOperation = "difference"; 
            //canvasContext.drawImage(videoContainer02.video, left, top, vidW * scale, vidH * scale);
            //canvasContext.drawImage(canvasContext.canvas, left, top, vidW * scale, vidH * scale);

            // Get Icon back after filter
            canvasContext.globalAlpha = 1;  // reset alpha
            canvasContext.globalCompositeOperation = "source-over";  // reset comp*/

            if (!videoContainer.isPause){
                if (nFrame < frames.length-1){
                    nFrame = nFrame + 1;
                }
                else{
                    console.log("PAUSED");
                    nFrame = 1;
                    videoContainer.isPause = true;
                }
            }

            if(videoContainer.isPause){ // if not playing show the paused screen 
                drawPlayIcon();
            }
        }
        // all done for display 
        // request the next frame in 1/60th of a second
        requestAnimationFrame(updateCanvas);
    }

    function drawPlayIcon(){
        canvasContext.fillStyle = "black";  // darken display
        canvasContext.globalAlpha = 0.5;
        canvasContext.fillRect(0,0,canvas.width,canvas.height);
        canvasContext.fillStyle = "#DDD"; // colour of play icon
        canvasContext.globalAlpha = 0.75; // partly transparent
        canvasContext.beginPath(); // create the path for the icon
        var size = (canvas.height / 2) * 0.5;  // the size of the icon
        canvasContext.moveTo(canvas.width/2 + size/2, canvas.height / 2); // start at the pointy end
        canvasContext.lineTo(canvas.width/2 - size/2, canvas.height / 2 + size);
        canvasContext.lineTo(canvas.width/2 - size/2, canvas.height / 2 - size);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.globalAlpha = 1; // restore alpha
    }    

    function playPauseClick(){
        if(videoContainer !== undefined && videoContainer.ready){
            if(videoContainer.isPause){                                 
                videoContainer.isPause = false;
            }else{
                videoContainer.isPause = true;
            }
        }
    }

    // register the event
    canvas.addEventListener("click",playPauseClick);
});
