'use client';

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
  const [currentFileName, setCurrentFileName] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    setRetryText(`${loginAttempt} / 2`);
  }, [loginAttempt]);

  const handleLogin = () => {
    setShowCaptcha(true);
    setLoginAttempt(0);
    setRetryText('0 / 2');
    setRetryColor('');
    setUserChoice('');
    setWrongAttempts(0);
  };

  const handleCloseCaptcha = () => {
    setShowCaptcha(false);
    setLoginAttempt(0);
    setRetryText('');
    setRetryColor('');
    setUserChoice('');
    setAudioUrl('');
    setCurrentFileName('');
    setWrongAttempts(0);
  };

  // handlePlay 함수는 변경 없음

  const handleAnswer = async (answer) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}captcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'check', 
          fileName: currentFileName, 
          answer: answer,
          attempt: loginAttempt
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (loginAttempt === 1 && data.finalTest) {
        setUserChoice(answer);
        handleCloseCaptcha();
        return;
      }
  
      if (data.correct) {
        setLoginAttempt(prev => prev + 1);
        setRetryColor('green');
        setWrongAttempts(0);
      } else {
        setWrongAttempts(prev => prev + 1);
        if (wrongAttempts >= 4) {
          handleCloseCaptcha();
        } else {
          setLoginAttempt(0);
          setRetryColor('red');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to check answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.parent}>
      <div className={styles.blockingFrame}>
        <div className={styles.loginLogo}>
          <img src="/insideout-logo.png" className={styles.insideoutLogo} alt="Inside Out Logo" />
        </div>
        {!showCaptcha ? (
          <div className={styles.loginFrame}>
            {/* 로그인 폼 코드는 변경 없음 */}
          </div>
        ) : (
          <div className={styles.captchaWrapper}>
            <div className={styles.captcha}>
              {/* 캡차 UI 코드는 대부분 변경 없음 */}
              <div className={styles.textRetry} style={retryColor ? {color: retryColor} : {}}>
                {retryText}
              </div>
              <div className={styles.question}>
                Play audio and select proper emotion.
              </div>
              {/* 답변 버튼 코드는 변경 없음 */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}