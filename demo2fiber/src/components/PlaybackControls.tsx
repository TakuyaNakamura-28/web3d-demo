import React from 'react';

interface PlaybackControlsProps {
  progress: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onProgressChange: (progress: number) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  progress,
  isPlaying,
  onPlayPause,
  onProgressChange
}) => {
  return (
    <div className="flex flex-row items-center gap-8 w-full">
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="w-6 h-6 flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="5" width="4" height="14" fill="#0a0a0a" />
            <rect x="14" y="5" width="4" height="14" fill="#0a0a0a" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 3L19 12L5 21V3Z"
              fill="#0a0a0a"
            />
          </svg>
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden relative cursor-pointer"
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const width = rect.width;
             const newProgress = Math.max(0, Math.min(1, x / width));
             onProgressChange(newProgress);
           }}>
        <div 
          className="h-full bg-neutral-900 transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};

export default PlaybackControls;