import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [loginAttempt, setLoginAttempt] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [retryText, setRetryText] = useState('');
  const [retryColor, setRetryColor] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [userChoice, setUserChoice] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setRetryText(`${loginAttempt} / 4`);
  }, [loginAttempt]);

  const handleLogin = () => {
    setShowCaptcha(true);
    setLoginAttempt(0);
    setRetryText('0 / 4');
    setRetryColor('');
    setUserChoice('');
  };

  const handleCloseCaptcha = () => {
    setShowCaptcha(false);
    setLoginAttempt(0);
    setRetryText('');
    setRetryColor('');
    setUserChoice('');
    setAudioUrl('');
  };

  const handlePlay = async () => {
    if (isPlaying) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}captcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'initialize' }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (!data.audioUrl) {
        throw new Error('No audio URL provided');
      }

      const decodedUrl = decodeURIComponent(data.audioUrl);
      setAudioUrl(decodedUrl);

      setIsPlaying(true);
      document.documentElement.style.setProperty('--my-end-width', '60px');
      document.documentElement.style.setProperty('--my-end-height', '60px');
      document.documentElement.style.setProperty('--animate-opacity', '0.8');
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const audio = new Audio(decodedUrl);
      audioRef.current = audio;
      
      audio.play();
      audio.onended = function() {
        document.documentElement.style.setProperty('--animate-opacity', '0');
        setIsPlaying(false);
        audioRef.current = null;
      };
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    if (loginAttempt === 3) {
      setUserChoice(answer);
      alert(`Test completed. You chose: ${answer}`);
      handleCloseCaptcha();
      return;
    }

    // 여기서 서버로 답변을 보내고 검증하는 로직을 추가해야 합니다.
    // 지금은 임시로 항상 맞았다고 가정합니다.
    setLoginAttempt(prev => prev + 1);
    setRetryColor('green');
  };

  return (
    <div className={styles.parent}>
      <div className={styles.blockingFrame}>
        <div className={styles.loginLogo}>
          <img src="/insideout-logo.png" className={styles.insideoutLogo} alt="Inside Out Logo" />
        </div>
        {!showCaptcha ? (
          <div className={styles.loginFrame}>
            <div className={styles.loginElems}>
              <input className={styles.inputId} type="text" placeholder="e-mail" />
              <input className={styles.inputPw} type="password" placeholder="password" />
              <div className={styles.forgotPasswordText}>Forgot password?</div>
              <button className={styles.btnApply} onClick={handleLogin}>LOGIN</button>
            </div>
          </div>
        ) : (
          <div className={styles.captchaWrapper}>
            <div className={styles.captcha}>
              <div className={styles.captchaLogo}>
                <img src="/recaptcha.png" className={styles.captchaLogoSrc} alt="reCAPTCHA Logo" />
              </div>
              <div className={styles.soundWrap}>
                <div className={styles.eleWrap}>
                  <button 
                    className={styles.btnPlay} 
                    onClick={handlePlay}
                    disabled={isPlaying || isLoading}
                  >
                    {isLoading ? 'Loading...' : <img src="/play_button.png" className={styles.btnPlaySrc} alt="Play Button" />}
                  </button>
                </div>
              </div>
              <div className={styles.textRetry} style={retryColor ? {color: retryColor} : {}}>
                {retryText}
              </div>
              <div className={styles.question}>
                {loginAttempt === 3 ? "Final test: Select any emotion for this audio." : "Play audio and select proper emotion."}
              </div>
              <div className={styles.answers}>
                <div className={styles.answerA}>
                  {['anger', 'fearful', 'disgust', 'sad'].map(emotion => (
                    <button key={emotion} onClick={() => handleAnswer(emotion)}>{emotion}</button>
                  ))}
                </div>
                <div className={styles.answerB}>
                  {['neutral', 'calm', 'happy', 'surprised'].map(emotion => (
                    <button key={emotion} onClick={() => handleAnswer(emotion)}>{emotion}</button>
                  ))}
                </div>
              </div>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}