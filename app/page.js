'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleButtonClick = async () => {
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
		throw new Error(`HTTP error! status: ${response.status}`);
	  }
  
	  const data = await response.json();
	  console.log('Received data:', data);
  
	  if (!data.audioUrl) {
		throw new Error('No audio URL provided');
	  }
  
	  console.log('Audio URL:', data.audioUrl);
  
	  // 오디오 파일 가져오기
	  const audioResponse = await fetch(data.audioUrl, {
		method: 'GET',
		mode: 'no-cors',
	  });
  
	  if (!audioResponse.ok) {
		throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
	  }
  
	  const blob = await audioResponse.blob();
	  const objectUrl = URL.createObjectURL(blob);
	  setAudioUrl(objectUrl);
  
	} catch (error) {
	  console.error('Error:', error);
	  setError(`Failed to load audio: ${error.message}`);
	} finally {
	  setIsLoading(false);
	}
  };

  useEffect(() => {
    return () => {
      // Clean up object URL when component unmounts
      if (audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>홈페이지</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Link href="/sign_in_page" style={{ marginRight: '20px', padding: '10px 20px', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          로그인
        </Link>
        <Link href="/sign_up_page" style={{ marginLeft: '20px', padding: '10px 20px', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          회원가입
        </Link>
      </div>
      <br />
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Call Lambda'}
      </button>
      {isLoading && <p>Loading audio...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {audioUrl && (
        <div>
          <p>Audio URL: {audioUrl}</p>
          <audio controls onError={(e) => console.error("Audio playback error:", e)}>
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}