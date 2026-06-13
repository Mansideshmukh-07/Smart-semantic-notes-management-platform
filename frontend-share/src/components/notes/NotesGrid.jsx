import React from "react";
import NoteCard from "./NoteCard";

export default function NotesGrid({ notes }) {
  return (
    <div className="notes-grid">
      {notes.length === 0 ? (
        <p>No notes uploaded yet</p>
      ) : (
        notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))
      )}
    </div>
  );
}