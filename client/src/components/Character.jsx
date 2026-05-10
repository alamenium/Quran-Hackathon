import { useProgress } from '../context/ProgressContext.jsx';
import { characterImage } from '../lib/characters.js';

// Display the active character. Defaults to "boy1" until the user chooses.
export function Character({ emotion = 'smile', size = 120, className = '', alt = '' }) {
  const { user } = useProgress();
  const id = user?.character || 'boy1';
  return (
    <img
      src={characterImage(id, emotion)}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain select-none pointer-events-none ${className}`}
      draggable="false"
    />
  );
}
