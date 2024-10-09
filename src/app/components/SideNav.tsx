import React, { ChangeEvent, useEffect, useState, useCallback } from "react";
import { noteState } from "@/store/noteState";
import { useRecoilState } from "recoil";
import { Menu, X, Plus, Trash2, Loader, AlertCircle } from "lucide-react";

type Note = {
  id: string;
  name: string;
  type: number;
};

export default function SideNav() {
  const [currentNote, setCurrentNote] = useRecoilState(noteState);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingNotes, setDeletingNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleClick = useCallback(
    (noteName: string) => {
      setCurrentNote(noteName);
      setIsOpen(false);
    },
    [setCurrentNote],
  );

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

        const updatedNotes = await getAllChannels();
        const noteCreated = updatedNotes.some(
          (note: { name: string }) => note.name === formattedNote,
        );

        if (!noteCreated) {
          setErrorMessage("Too many requests. Please try again later.");
          setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
        } else {
          setCurrentNote(formattedNote);
        }

        setIsCreating(false);
      } catch (error) {
        console.error("Error creating new note:", error);
        setErrorMessage(
          "An error occurred while creating the note. Please try again.",
        );
        setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
      }
    }
  }, [newNote, setCurrentNote, getNotes]);

  const handleDelete = useCallback(
    async (noteName: string) => {
      try {
        setDeletingNotes((prev) => [...prev, noteName]);
        await deleteChannel(noteName);
        await getNotes();
        if (currentNote === noteName && notes.length > 1) {
          const newCurrentNote = notes.find((note) => note.name !== noteName);
          if (newCurrentNote) {
            setCurrentNote(newCurrentNote.name);
          }
        }
      } catch (error) {
        console.error("Error deleting note:", error);
      } finally {
        setDeletingNotes((prev) => prev.filter((name) => name !== noteName));
      }
    },
    [currentNote, notes, getNotes, setCurrentNote],
  );

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <>
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-md flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        onClick={toggleSidebar}
        className={`fixed top-2 z-50 md:hidden text-white bg-yellow-600 p-2 rounded-full transition-all duration-200 ease-in-out ${
          isOpen ? "left-[232px]" : "left-4"
        }`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`
        fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 md:w-[18vw] border-[#444] border-r border-dashed bg-black text-white flex flex-col
        z-40 md:z-auto
      `}
      >
        <div className="flex justify-center flex-col w-full p-4 border-b border-[#444] border-dashed">
          <h1 className="text-2xl font-bold text-center">SaveDeezNotes</h1>
        </div>
        <h2 className="text-sm font-semibold px-4 py-2 border-b border-[#444] border-dashed">
          Your Notes
        </h2>
        <div className="flex-1 flex flex-col items-start w-full overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center w-full p-4">
              <Loader className="animate-spin text-yellow-600" />
            </div>
          ) : (
            notes.map((note: Note) => (
              <div
                key={note.id}
                className={`w-full flex justify-between px-4 py-2 transition-colors duration-300 text-start ${
                  currentNote && currentNote.trim() === note.name.trim()
                    ? "bg-yellow-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                <button
                  onClick={() => handleClick(note.name)}
                  className="w-full h-full text-start"
                >
                  {note.name}
                </button>
                <button
                  onClick={() => handleDelete(note.name)}
                  className="flex items-center justify-center w-8 h-8"
                  disabled={deletingNotes.includes(note.name)}
                >
                  {deletingNotes.includes(note.name) ? (
                    <Loader className="animate-spin text-white" size={16} />
                  ) : (
                    <Trash2
                      className="text-gray-400 hover:text-red-400 transition-all duration-300 rounded-sm"
                      strokeWidth={1.75}
                    />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
        {!loading && (
          <div className="mt-auto p-2 border-t border-[#444] border-dashed">
            {isCreating ? (
              <div className="flex flex-col space-y-2">
                <input
                  className="w-full px-2 py-1 bg-black focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-md text-sm"
                  value={newNote}
                  onChange={handleChange}
                  placeholder="New note name"
                />
                <button
                  className="w-full px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-500 transition-colors duration-300 text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={handleUpload}
                >
                  Create Note
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channelName }),
    });
    const data = await resp.json();
    return data;
  } catch (e) {
    console.error("Unable to post message", e);
    throw e;
  }
}

async function deleteChannel(channelName: string) {
  try {
    const resp = await fetch("/api/deleteChannel", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channelName }),
    });
    const data = await resp.json();
    return data;
  } catch (e) {
    console.error("Unable to delete channel ", e);
    throw e;
  }
}
