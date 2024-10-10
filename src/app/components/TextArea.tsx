/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { noteState } from "@/store/noteState";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useRecoilState } from "recoil";
import { fetchMessage, postText, changeTitle } from "@/utils/api";
import { debounce } from "lodash";

interface Message {
  id: string;
  content: string;
}

export default function TextArea() {
  const [currentNote, setCurrentNote] = useRecoilState(noteState);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [titleFocus, setTitleFocus] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchMessage(currentNote);

      if (data) {
        setMessage(data);
        setContent(data.content);
      }
      setLoading(false);
    };

    if (currentNote) {
      setTitle(currentNote);
      loadData();
    }
  }, [currentNote]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = content;
    }
  }, [content]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const update = useCallback(
    debounce(async (e: ChangeEvent<HTMLTextAreaElement>) => {
      await postText(e.target.value, currentNote);
    }, 500),
    [currentNote],
  );

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    update(e);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    setTitleFocus(false);
    if (title.trim() && title !== currentNote) {
      try {
        await changeTitle(currentNote, title);
        setCurrentNote(title);
      } catch (error) {
        console.error("Error changing title:", error);
      }
    }
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
          value={title}
          onChange={handleTitleChange}
          onFocus={() => setTitleFocus(true)}
          onBlur={handleTitleBlur}
          className="w-full border-none bg-transparent text-neutral-200 focus:text-neutral-50 focus:outline-none text-4xl"
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
