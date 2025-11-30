interface Cursor {
  username: string;
  position: { lineNumber: number; column: number };
  color: string;
}

interface CursorIndicatorsProps {
  cursors: Cursor[];
}

export default function CursorIndicators({ cursors }: CursorIndicatorsProps) {
  return (
    <div className="pointer-events-none">
      {cursors.map((cursor, index) => (
        <div
          key={index}
          className="absolute z-10"
          style={{
            // Position will be calculated based on Monaco editor coordinates
            display: 'none', // Hide for now, requires Monaco integration
          }}
        >
          <div
            className="w-0.5 h-5 animate-pulse"
            style={{ backgroundColor: cursor.color }}
          />
          <div
            className="text-xs px-2 py-1 rounded text-white whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </div>
  );
}