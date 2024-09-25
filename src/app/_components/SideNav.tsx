import React, { ChangeEvent, useEffect, useState, useCallback } from "react";
import { noteState } from "../../store/noteState";
import { useRecoilState } from "recoil";

type Note = {
  id: string;
  name: string;
  type: number;
};

export default function SideNav() {
  const [currentNote, setCurrentNote] = useRecoilState(noteState);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");

  const getNotes = useCallback(async () => {
    try {
      const data = await getAllChannels();
      if (data && data.length > 0) {
        setNotes(data);
        if (!currentNote) {
          setCurrentNote(data[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, [currentNote, setCurrentNote]);

  useEffect(() => {
    getNotes();
  }, [getNotes]);

  const handleClick = useCallback((noteName: string) => {
    setCurrentNote(noteName);
  }, [setCurrentNote]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewNote(e.target.value);
  }, []);

  const handleUpload = useCallback(async () => {
    if (newNote.trim()) {
      const formattedNote = newNote.trim().split(" ").join("-");
      if (formattedNote === "general") {
        return;
      }
      try {
        // await createNewNote(formattedNote); // Call the createNewNote function
        setNewNote(""); // Clear the input field
        await getNotes(); // Refresh the list of notes
        setCurrentNote(formattedNote); // Set the current note to the newly created one
      } catch (error) {
        console.error("Error creating new note:", error);
      }
    }
  }, [newNote, setCurrentNote, getNotes, currentNote]);

  return (
    <div className="w-full sm:w-[18vw] border-[#444] border-r border-dashed h-screen bg-black text-white py-4 flex flex-col">
      <div className="flex justify-center flex-col mb-5 w-full">
        <h1 className="text-2xl font-bold border-[#444] border-b pb-2 w-full border-dashed text-center">
          SaveDeezNotes
        </h1>
      </div>
      <h2 className="mb-2 underline px-2">Your Notes -</h2>
      <div className="flex flex-col items-start space-y-2 w-full overflow-y-auto px-3">
        {loading ? (
          <p className="px-2">Loading...</p>
        ) : (
          notes.map((note: Note) => (
            <button
              onClick={() => handleClick(note.name)}
              key={note.id}
              className={`w-full px-4 py-1 transition-colors duration-300 text-start rounded-md ${
                currentNote.trim() === note.name.trim()
                  ? "bg-gray-700 hover:bg-gray-600 bg-opacity-25 hover:bg-opacity-25"
                  : "hover:bg-gray-700"
              }`}
            >
              {note.name}
            </button>
          ))
        )}
      </div>
      {!loading && (
        <div className="mt-auto flex items-center space-x-2 w-full">
          <input
            className="flex-1 px-2 py-1 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-md"
            value={newNote}
            onChange={handleChange}
            placeholder="New note name"
          />
          <button
            className="px-4 py-2 bg-yellow-600 rounded-md hover:bg-yellow-500 transition-colors duration-300"
            onClick={handleUpload}
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
}

async function getAllChannels() {
    try {
        const resp = await fetch("/api/getChannels");
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const data = await resp.json();
        return data;
    } catch (e) {
        console.error("Unable to fetch channels", e);
        throw e;
    }
}
