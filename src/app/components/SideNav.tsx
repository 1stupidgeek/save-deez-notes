import React, { useEffect, useState, useCallback } from "react";
import { Note, noteState } from "@/store/noteState";
import { useRecoilState } from "recoil";
import { Menu, X, Plus, Trash2, Loader, AlertCircle } from "lucide-react";
import { getAllChannels, createNewChannel, deleteChannel } from "@/utils/api";

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

      if (data) {
        setNotes(data);
      }

      if (data.length > 0) {
        const note = data[0];

        if (!currentNote) {
          setCurrentNote({ id: note.id, name: note.name });
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

  const createNote = useCallback(async () => {
    const noteTitle = newNote.trim().split(" ").join("-");

    if (noteTitle) {
      try {
        setNewNote("");

        const { messages: channel } = await createNewChannel(newNote);
        const updatedNotes = await getAllChannels();

        const noteCreated = updatedNotes.some(
          (note: { name: string }) => note.name === noteTitle,
        );

        console.debug("new note: ", channel);

        if (!noteCreated) {
          setErrorMessage("Failed to create a note.");
          setTimeout(() => setErrorMessage(null), 3000);
        } else {
          setCurrentNote({ id: channel.id, name: channel.name });
        }

        setIsCreating(false);
      } catch (error) {
        console.error("Error creating new note:", error);
        setErrorMessage(
          "An error occurred while creating the note. Please try again.",
        );
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  }, [newNote, setCurrentNote]);

  const changeNote = useCallback(
    (id: string) => {
      if (currentNote && id === currentNote.id) return;
      const note = notes.find((note) => note.id === id);
      setCurrentNote(note!);
      setIsOpen(false);
    },
    [currentNote, setCurrentNote, notes],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!currentNote) return;
      try {
        setDeletingNotes((prev) => [...prev, id]);

        await deleteChannel(id);
        await getNotes();

        if (currentNote.id === id) {
          const newCurrentNote = notes.find((note) => note.id !== id);
          if (newCurrentNote) {
            setCurrentNote({
              id: newCurrentNote.id,
              name: newCurrentNote.name,
            });
          }
        }
      } catch (error) {
        console.error("Error deleting note:", error);
      } finally {
        setDeletingNotes((prev) => prev.filter((name) => name !== id));
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
          ) : notes.length <= 0 ? (
            <p className="text-sm p-4">No notes, create one</p>
          ) : (
            notes.map(
              (note: Note) =>
                currentNote && (
                  <div
                    key={note.id}
                    className={`w-full flex justify-between transition-colors duration-300 text-start ${
                      currentNote && currentNote.id === note.id
                        ? "bg-yellow-600 text-white"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <button
                      onClick={() => changeNote(note.id)}
                      className="w-full h-full px-4 py-2 text-start"
                    >
                      {note.name}
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="flex items-center justify-center w-8 h-8 m-2"
                      disabled={deletingNotes.includes(note.id)}
                    >
                      {deletingNotes.includes(note.id) ? (
                        <Loader className="animate-spin text-white" size={16} />
                      ) : (
                        <Trash2
                          className="text-white hover:text-red-400 transition-all duration-300 rounded-sm"
                          strokeWidth={1.75}
                        />
                      )}
                    </button>
                  </div>
                ),
            )
          )}
        </div>
        {!loading && (
          <div className="mt-auto p-2 border-t border-[#444] border-dashed">
            {isCreating ? (
              <div className="flex flex-col space-y-2">
                <input
                  className="w-full px-2 py-1 bg-black focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-md text-sm"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="New note name"
                />
                <button
                  className="w-full px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-500 transition-colors duration-300 text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={createNote}
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
