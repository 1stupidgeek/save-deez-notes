/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { noteState } from "@/store/noteState";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useRecoilState } from "recoil";
import {
  fetchMessage,
  postText,
  editText,
  deleteText,
  changeTitle,
} from "@/utils/api";
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

  const update = useCallback(
    debounce(async (e: ChangeEvent<HTMLTextAreaElement>) => {
      console.debug("Content changed", e.target.value);
      await postText(e.target.value, currentNote);
      setContent(e.target.value);
    }, 500),
    [],
  );

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    update(e);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
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
    <div className="flex flex-col w-full bg-black m-10 my-12 pr-4">
      <input
        value={title}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        className="resize-none border-none focus:outline-none bg-black text-white text-4xl pb-7"
      />
      <div className="flex flex-col w-full space-y-2">
        <TextareaAutosize
          placeholder="type something ..."
          className="flex-grow resize-none border-none focus:outline-none text-white bg-black text-lg h-full"
          onChange={handleContentChange}
          minRows={1}
        />
      </div>
    </div>
  );
}
