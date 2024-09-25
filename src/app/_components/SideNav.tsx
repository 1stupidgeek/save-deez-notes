import React, { ChangeEvent, useEffect, useState, useCallback } from "react";
import { noteState } from "../../store/noteState";
import { useRecoilState } from "recoil";
import { Menu, X, Plus, Check } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
    setIsOpen(false);
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
        setNewNote("");
        await createNewChannel(newNote);
        await getNotes();
        setCurrentNote(formattedNote);
        setIsCreating(false);
      } catch (error) {
        console.error("Error creating new note:", error);
      }
    }
  }, [newNote, setCurrentNote, getNotes]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`fixed top-2 left-4 z-50 md:hidden bg-yellow-600 p-2 rounded-full transition-all duration-200 ease-in-out ${isOpen ? 'left-[232px]' : 'left-4'
          }`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 md:w-[18vw] border-[#444] border-r border-dashed h-screen bg-black text-white flex flex-col
        z-40 md:z-auto
      `}>
        <div className="flex justify-center flex-col w-full p-4 border-b border-[#444] border-dashed">
          <h1 className="text-2xl font-bold text-center">
            SaveDeezNotes
          </h1>
        </div>
        <h2 className="text-sm font-semibold px-4 py-2 border-b border-[#444] border-dashed">Your Notes</h2>
        <div className="flex-1 flex flex-col items-start w-full overflow-y-auto">
          {loading ? (
            <p className="px-4 py-2">Loading...</p>
          ) : (
            notes.map((note: Note) => (
              <button
                onClick={() => handleClick(note.name)}
                key={note.id}
                className={`w-full px-4 py-2 transition-colors duration-300 text-start ${currentNote.trim() === note.name.trim()
                    ? "bg-yellow-600 text-white"
                    : "hover:bg-gray-800"
                  }`}
              >
                {note.name}
              </button>
            ))
          )}
        </div>
        {!loading && (
          <div className="mt-auto p-2 border-t border-[#444] border-dashed">
            {isCreating ? (
              <div className="flex flex-col space-y-2">
                <input
                  className="w-full px-2 py-1 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-md text-sm"
                  value={newNote}
                  onChange={handleChange}
                  placeholder="New note name"
                />
                <button
                  className="w-full px-3 py-1 bg-yellow-600 text-whitex  rounded-md hover:bg-yellow-500 transition-colors duration-300 text-sm font-semibold flex items-center justify-center"
                  onClick={handleUpload}
                >
                  Create Note
                  <Check size={16} className="text-white ml-1" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-300 flex items-center justify-center space-x-2 text-sm"
              >
                <Plus size={16} />
                <span>New Note</span>
              </button>
            )}
          </div>
        )}
          {/* </div> */}
        {/* )} */}
      </div>
    </>
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

async function createNewChannel(channelName: string) {
  try {
    const resp = await fetch("/api/createNewChannel", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelName }),
    });
    console.log('API Response:', resp);
    const data = await resp.json();
    return data;
  } catch (e) {
    console.error("Unable to post message", e);
  }
}