import React, { useState, useEffect } from 'react';

// Set your target date for the launch
const LAUNCH_DATE = new Date('December 31, 2026 00:00:00').getTime();

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // 1. Calculate the initial time difference
    const initialDifference = LAUNCH_DATE - new Date().getTime();
    setTimeLeft(initialDifference > 0 ? initialDifference : 0);
    
    // 2. Set up an interval to update the countdown every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    // 3. Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Helper function to format the time (days, hours, minutes, seconds)
  const formatTime = (time) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    
    // Ensure all values are displayed as 2 digits for better formatting
    const pad = (num) => String(num).padStart(2, '0');

    return {
      days: pad(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    };
  };

  const time = formatTime(timeLeft);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // In a real application, you would send the 'email' to your server here
      // console.log(`Subscribing email: ${email}`);
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 Our Website Is Coming Soon!</h1>
      <p style={styles.subtitle}>We're working hard to launch on schedule.</p>

      {timeLeft > 0 ? (
        <div style={styles.countdown}>
          <div style={styles.timeBox}>
            <span style={styles.timeValue}>{time.days}</span>
            <span style={styles.timeLabel}>Days</span>
          </div>
          <div style={styles.timeBox}>
            <span style={styles.timeValue}>{time.hours}</span>
            <span style={styles.timeLabel}>Hours</span>
          </div>
          <div style={styles.timeBox}>
            <span style={styles.timeValue}>{time.minutes}</span>
            <span style={styles.timeLabel}>Minutes</span>
          </div>
          <div style={styles.timeBox}>
            <span style={styles.timeValue}>{time.seconds}</span>
            <span style={styles.timeLabel}>Seconds</span>
          </div>
        </div>
      ) : (
        <h2 style={styles.launchedMessage}>🎉 We Are Live!</h2>
      )}

      {subscribed ? (
        <p style={styles.successMessage}>Thank you for subscribing! We'll notify you when we launch.</p>
      ) : (
        <form onSubmit={handleSubscribe} style={styles.form}>
          <p>Be the first to know when we launch:</p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Notify Me</button>
        </form>
      )}
    </div>
  );
};

// Simple inline styling for demonstration
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f0f2f5',
    color: '#333',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '10px',
    color: '#3f51b5',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '30px',
  },
  countdown: {
    display: 'flex',
    gap: '20px',
    marginBottom: '40px',
  },
  timeBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    minWidth: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#ff9800',
  },
  timeLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: '#777',
    marginTop: '5px',
  },
  launchedMessage: {
    fontSize: '2rem',
    color: '#4CAF50',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    marginBottom: '10px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.3s',
  },
  successMessage: {
    fontSize: '1.2rem',
    color: '#4CAF50',
    fontWeight: 'bold',
  }
};

export default ComingSoon;