import { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const Main = () => {
    const {
        onSent,
        recentPrompt,
        showResults,
        loading,
        resultData,
        setInput,
        input,
        onImageUpload,
    } = useContext(Context);

    const [listening, setListening] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [webcamActive, setWebcamActive] = useState(false);
    const [autoCaptureInterval, setAutoCaptureInterval] = useState(null);
    const [chatMode, setChatMode] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const webcamTimeoutRef = useRef(null);

    const handleCardClick = (promptText) => {
        setInput(promptText);
    };

    const handleMicClick = () => {
        if (!recognition) {
            alert("Speech Recognition is not supported in your browser.");
            return;
        }

        if (listening) {
            recognition.stop();
            setListening(false);
        } else {
            recognition.start();
            setListening(true);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setListening(false);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error: ", event.error);
                setListening(false);
            };
        }
    };

    useEffect(() => {
        if (resultData) {
            responsiveVoice.cancel();
            responsiveVoice.speak(resultData, "Hindi Male");
        }
    }, [resultData]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            onImageUpload(file);
            setUploadedImage(URL.createObjectURL(file));
        }
    };

    const startWebcam = () => {
        setWebcamActive(true);
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;

                // Start a 5-second timer to enable the microphone automatically
                webcamTimeoutRef.current = setTimeout(() => {
                    handleMicClick(); // Start speech recognition
                }, 5000);
            })
            .catch((err) => {
                console.error("Webcam error: ", err);
            });
    };

    const captureFromWebcam = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
    
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        canvas.toBlob((blob) => {
            const file = new File([blob], "webcam_image.png", { type: "image/png" });
            onImageUpload(file);
            setUploadedImage(URL.createObjectURL(blob));
    
            // stopWebcam(); // Stop the webcam after capturing the image
        });
    };

    const stopWebcam = () => {
        clearTimeout(webcamTimeoutRef.current); // Clear the microphone enable timeout
        if (autoCaptureInterval) {
            clearInterval(autoCaptureInterval); // Stop automatic captures
        }

        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop()); // Stop the webcam stream

        setWebcamActive(false);
        setChatMode(false); // Reset chat mode
    };

    const startAutoCapture = () => {
        const interval = setInterval(() => {
            captureFromWebcam(); // Capture an image every second
        }, 1000);
        setAutoCaptureInterval(interval); // Store the interval ID for later clearing
    };

    const handleLiveChat = () => {
        setChatMode(true);
        handleMicClick(); // Automatically start speech recognition
        startAutoCapture(); // Start capturing images automatically
    };

    return (
        <div className="main">
            <div className="nav">
                <p>InsightFul Eyes</p>
                <img src={assets.user} alt="" />
            </div>
            <div className="main-container">
                {!showResults ? (
                    <>
                        <div className="greet">
                            <p>
                                <span>Hello, Guys! </span>
                            </p>
                            <p>How can I assist you today?</p>
                        </div>
                        <div className="cards">
                            {/* Cards with different prompts */}
                            {/* ... */}
                        </div>
                    </>
                ) : (
                    <div className="result">
                        <div className="result-title">
                            <img src={assets.user} alt="" />
                            <p>{recentPrompt}</p>
                        </div>
                        <div className="result-data">
                            <img src={assets.gemini_icon} alt="" />
                            {loading ? (
                                <div className="loader">
                                    <hr />
                                    <hr />
                                    <hr />
                                </div>
                            ) : (
                                <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                            )}
                        </div>
                    </div>
                )}

                <div className="main-bottom">
                    <div className="search-box">
                        <input
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            value={input}
                            type="text"
                            placeholder="Enter the Prompt Here"
                        />
                        <div>
                            {uploadedImage && (
                                <img
                                    src={uploadedImage}
                                    alt="Uploaded Preview"
                                    className="uploaded-image-preview"
                                    style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "8px" }}
                                />
                            )}

                            <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
                                <img src={assets.gallery_icon} alt="Gallery Icon" />
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageUpload}
                            />

                            <img
                                src={assets.mic_icon}
                                alt="Mic Icon"
                                onClick={handleMicClick}
                                className={listening ? "listening" : ""}
                                style={{ cursor: "pointer" }}
                            />

                            <button className="btn-webcam" onClick={startWebcam}>
                                Start Webcam
                            </button>

                            {webcamActive && !chatMode && (
                                <div>
                                    <button className="btn-webcam-capture" onClick={captureFromWebcam}>
                                        Capture Image
                                    </button>
                                    <button className="btn-live-chat" onClick={handleLiveChat}>
                                        Start Live Chat
                                    </button>
                                </div>
                            )}

                            <img
                                src={assets.send_icon}
                                alt="Send Icon"
                                onClick={() => {
                                    onSent();
                                }}
                            />
                        </div>
                    </div>

                    {webcamActive && (
                        <div className="webcam-preview">
                            <video ref={videoRef} autoPlay style={{ width: "100%" }}></video>
                            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                        </div>
                    )}

                    <div className="bottom-info">
                        <p>
                            Insightful eyes may display inaccurate info, including about people, so
                            double-check its responses. Your privacy & our Apps
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
