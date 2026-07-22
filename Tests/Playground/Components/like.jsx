import React, { useState } from 'react';
import styles from './like.module.css';

export default function LikeButton({ initialCount = 0, onLikeChange, ...props }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [animate, setAnimate] = useState(false);

  const handleLike = () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? count + 1 : count - 1;
    
    setLiked(nextLiked);
    setCount(nextCount);
    setAnimate(true);

    if (onLikeChange) {
      onLikeChange({ liked: nextLiked, count: nextCount });
    }
  };

  return (
    <button 
      className={`${styles.likeButton} ${liked ? styles.liked : ''} ${animate ? styles.pulse : ''}`}
      onClick={handleLike}
      onAnimationEnd={() => setAnimate(false)}
      {...props}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={liked ? "currentColor" : "none"} 
        stroke="currentColor" 
        className={styles.heartIcon}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span className={styles.likeCount}>{count}</span>
    </button>
  );
}