/* eslint-disable @typescript-eslint/no-unused-vars */
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
      console.info("Current note", currentNote);
      const loadData = async () => {
        setLoading(true);
        const data = await fetchMessage(currentNote.id);

        if (data) {
          setContent(data.content);
        }

        setLoading(false);
      };

      setTitle(
        currentNote.name
          .split("-")
          .map((e) => e[0].toUpperCase() + e.substring(1))
          .join(" "),
      );
      loadData();
    }
  }, [currentNote]);

  useEffect(() => {
    if (titleRef.current && currentNote) {
      titleRef.current.value = currentNote.name;
    }
  }, [currentNote]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = content;
    }
  }, [content]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateNote = useCallback(
    debounce(async (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (currentNote) {
        await postText(currentNote.id, e.target.value.trim());
      }
    }, 500),
    [currentNote],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateTitle = useCallback(
    debounce(async (e: ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value.trim();

      if (currentNote) {
        await changeTitle(currentNote.id, title);
        setCurrentNote({ id: currentNote.id, name: title });
      }
    }, 500),
    [currentNote],
  );

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (currentNote) {
      setContent(e.target.value);
      updateNote(e);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateTitle(e);
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
          className={`absolute bottom-0 left-0 h-0.5 w-full bg-yellow-600 origin-left ${titleFocus ? "scale-x-100" : "scale-x-0"} transition-transform duration-300 rounded-md`}
        ></span>
      </div>
      <div className="flex flex-col w-full space-y-2">
        <TextareaAutosize
          placeholder="Type something ..."
          className="resize-none border-none focus:outline-none text-white bg-black text-lg h-full"
          onChange={handleContentChange}
          ref={textAreaRef}
          minRows={1}
        />
      </div>
    </div>
  );
}
