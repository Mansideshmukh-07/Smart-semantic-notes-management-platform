import React, { useState } from "react";

export default function NotesSearch({ notes, setFilteredNotes }) {
  const [query, setQuery] = useState("");

  const handleSearch = (value) => {
    setQuery(value);

    const filtered = notes.filter((note) =>
      note.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredNotes(filtered);
  };

  return (
    <input
      placeholder="Search notes by file name..."
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}