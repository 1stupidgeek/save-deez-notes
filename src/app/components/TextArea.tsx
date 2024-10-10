/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { noteState } from "@/store/noteState";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useRecoilState } from "recoil";
import { fetchMessage, postText, changeTitle } from "@/utils/api";
import { debounce } from "lodash";

export default function TextArea() {
  const [currentNote, setCurrentNote] = useRecoilState(noteState);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [titleFocus, setTitleFocus] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentNote) {
      const loadData = async () => {
        setLoading(true);
        try {
          const data = await fetchMessage(currentNote.id);
          if (data) {
            setContent(data.content);
            setTitle(formatTitle(currentNote.name));
          }
        } catch (error) {
          console.error("Error fetching message:", error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [currentNote]);

  const formatTitle = (name: string) =>
    name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const updateNote = useCallback(
    debounce(async (value: string) => {
      if (currentNote) {
        try {
          await postText(currentNote.id, value.trim());
        } catch (error) {
          console.error("Error updating note:", error);
        }
      }
    }, 500),
    [currentNote],
  );

  const updateTitle = useCallback(
    debounce(async (value: string) => {
      if (currentNote) {
        try {
          await changeTitle(currentNote.id, value.trim());
          setCurrentNote({ id: currentNote.id, name: value.trim() });
        } catch (error) {
          console.error("Error updating title:", error);
        }
      }
    }, 500),
    [currentNote, setCurrentNote],
  );

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateNote(newContent);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateTitle(newTitle);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading ...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full bg-black mt-12 md:mt-0 p-4 md:p-12 mr-8 pr-4">
      <div className="relative w-full">
        <input
          className="w-full border-none bg-transparent text-neutral-200 focus:text-neutral-50 focus:outline-none text-4xl"
          placeholder="New note..."
          value={title}
          onChange={handleTitleChange}
          onFocus={() => setTitleFocus(true)}
          onBlur={() => setTitleFocus(false)}
          ref={titleRef}
        />
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full bg-yellow-600 origin-left ${
            titleFocus ? "scale-x-100" : "scale-x-0"
          } transition-transform duration-300 rounded-md`}
        />
      </div>
      <div className="flex flex-col w-full space-y-2">
        <TextareaAutosize
          placeholder="Type something ..."
          className="resize-none border-none focus:outline-none text-white bg-black text-lg h-full"
          onChange={handleContentChange}
          value={content}
          ref={textAreaRef}
          minRows={1}
        />
      </div>
    </div>
  );
}
