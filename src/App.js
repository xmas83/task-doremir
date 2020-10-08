import React, {useState, useRef, useEffect} from 'react';

function App() {
  // some states and references
  const [recording, setRecording] = useState(false);
  const [appMediaRecorder, setAppMediaRecorder] = useState(null);
  const [audioDataChunks, setAudioDataChunks] = useState([]);
  const [countDown, setCountDown] = useState(5);
  const resetTimer = useRef(null);
  const isCancelled = useRef(false);
  const interval = useRef(null);

  useEffect(() => {
    // taking permission
    navigator.mediaDevices
      .getUserMedia({audio: true})
      .then((stream) => {

        // initialising the media recorder
        const mediaRecorder = new MediaRecorder(stream);

        // when recording stops it returns the data which we set for playing
        mediaRecorder.addEventListener('dataavailable', (event) => {
          setAudioDataChunks([...audioDataChunks, event.data]);

          // in case recording was cancelled, reset the cancel mode and ask for saving recording
          if (isCancelled.current) {
            isCancelled.current = false;
            if (!window.confirm('Save recording?')) {
              setAudioDataChunks([]);
            }
          }
        });
        // store the media recorder in app state
        setAppMediaRecorder(mediaRecorder);
      })
      .catch((err) => {
        // in case permission was denied notify user
        alert('You will need to allow permission for audio recording');
        window.location.reload();
        console.log(err);
      });

    return () => {
      // clean up the interval and even listeners
      appMediaRecorder.removeEventListener('dataavailable');
      clearInterval(interval.current);
    };
  }, []);

  // starting recording and initialising
  const startRecording = () => {
    setAudioDataChunks([]);
    setRecording(true);

    appMediaRecorder.start();
    startTimer();
    resetTimer.current = setTimeout(() => {
      resetRecording();
    }, 5000);
  };

  const playRecording = () => {
    // takes the audio chunks and plays the audio
    const audioBlob = new Blob(audioDataChunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const startTimer = () => {
    interval.current = setInterval(() => {
      setCountDown((count) => count - 0.025);
    }, 25);
  };

  // to restart recording

  const resetRecording = () => {
    // stop recording and reinitialse the values
    appMediaRecorder.stop();
    clearInterval(interval.current);
    setCountDown(5);
    setRecording(false);
  };

  const cancelRecording = () => {
    // if recording cancelled then reset and clear auto reset
    isCancelled.current = true;
    resetRecording();
    clearTimeout(resetTimer.current);
  };

  return (
    <div className='player-container'>
      <h1 className='player-heading'>Audio Recorder</h1>
      {recording ? (
        <>
          <h3 className='player-countdown'>{countDown.toFixed(2)}</h3>
          <button onClick={cancelRecording} className='player-cancel'>
            <i className='fas fa-stop-circle'></i>
          </button>
        </>
      ) : (
        <>
          <button onClick={startRecording} className='player-start'>
            <i className='fas fa-microphone'></i>
          </button>
          {audioDataChunks.length !== 0 && (
            <button onClick={playRecording} className='player-play'>
              <i className='fas fa-play'></i>
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default App;
