// src/components/SpotifyModal.jsx
export default function SpotifyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>
        <h3 className="text-lg font-semibold mb-4">Ascultă pe Spotify</h3>
        <iframe
          className="w-full h-40 rounded-lg"
          src="https://open.spotify.com/embed/artist/3fPcnUFKjZegfNMpx7lea3?utm_source=generator"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}
