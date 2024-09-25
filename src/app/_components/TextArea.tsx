"use client"

import { noteState } from '@/store/noteState';
import { ChangeEvent, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilValue } from 'recoil';

interface Message {
    id: string;
    content: string;
}

export default function TextArea() {
    const currentNote = useRecoilValue(noteState);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [changeableContent, setChangeableContent] = useState<string>('');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const data = await useData(currentNote);

                if (data) {
                    // check if data is an array before reversing it
                    const messagesArray = Array.isArray(data) ? data.reverse() : [data];
                    setMessages(messagesArray);
                    setChangeableContent(messagesArray.map(m => m.content).join(" "));
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [currentNote]);

    function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
        console.log(e.target.value)
        setChangeableContent(e.target.value);
    }

    async function handleBlur() {
        const input = changeableContent;
        const dataFromDiscord = messages.map(m => m.content).join(" ") || "";
        const diffResult = myersDiff(dataFromDiscord, input);

        let index = 0;
        let updatedMessages = [...messages];
        let newContent = "";

        for (let i = 0; i < updatedMessages.length; i++) {
            console.log(updatedMessages[i].content)
            const messageWords = updatedMessages[i].content.split(" ");
            const elementsOfThisMessage = diffResult!.slice(index, index + messageWords.length);
            index += messageWords.length;

            const joinedMessage = elementsOfThisMessage.reduce((acc, word) => {
                if (word.type === 'added' || word.type === 'unchanged') {
                    return acc + (acc.length ? " " : "") + word.value;
                }
                return acc;
            }, '');

            if (joinedMessage === "") {
                console.log("Delete Entire Message - ", updatedMessages[i]);
                await deleteText(updatedMessages[i].id, currentNote);
                updatedMessages.splice(i, 1);
                i--;

            } else if (joinedMessage !== updatedMessages[i].content) {
                console.log("Edit message -", updatedMessages[i].content, "with ID -", updatedMessages[i].id, "to -", joinedMessage);
                await editText({ content: joinedMessage, id: updatedMessages[i].id, currentNote });
                updatedMessages[i].content = joinedMessage;
            }
        }

        // Handle new content
        if (index < diffResult!.length) {
            newContent = diffResult!.slice(index).reduce((acc, word) => {
                if (word.type === 'added') {
                    return acc + (acc.length ? " " : "") + word.value;
                }
                return acc;
            }, '');

            if (newContent) {
                console.log("New String to be Posted - ", newContent);
                const response = await postText(newContent, currentNote);

                // Ensure response is not undefined and properly typed before pushing
                if (response && response.id && response.content) {
                    updatedMessages.push({
                        id: response.id,
                        content: response.content,
                    });
                } else {
                    console.error("Invalid response from postText:", response);
                }
            }
        }

        setMessages(updatedMessages);
        setChangeableContent(input);
    }

    if (loading) return <div className='w-full h-screen flex items-center justify-center'>Loading ...</div>;
    return (
        <div className="flex flex-col w-full bg-black m-10">
            <h1 className='text-4xl pb-7 underline'>{currentNote}</h1>
            <div className='flex flex-col w-full space-y-2'>
                <TextareaAutosize
                    placeholder='type something ...'
                    className="flex-grow resize-none border-none focus:outline-none text-white bg-black text-lg"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={changeableContent}
                    minRows={1}
                />
            </div>
        </div>
    );
}

async function useData(currentNote: string) {
    if (currentNote === "") {
        return;
    }
    // console.log("current note -> ", currentNote)
    try {
        const resp = await fetch("/api/get", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentNote }),
        });
        const data = await resp.json();
        console.log(data)
        return data;
    } catch (e) {
        console.error("Unable to post message", e);
    }
}
async function postText(message: string, currentNote: string) {
    // after data is posted, need to update the original messages state
    if (message === '') {
        return {};
    };
    try {
        const resp = await fetch("/api/send", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, currentNote: currentNote }),
        });
        console.log('API Response:', resp);
        const data = await resp.json();
        return {
            content: data.data.content,
            id: data.data.id
        }
    } catch (e) {
        console.error("Unable to post message", e);
    }
}
async function editText(message: { content: string, id: string, currentNote: string }) {
    if (message.content === "" || message.id === "") {
        return;
    }
    try {
        const resp = await fetch("/api/send", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
        console.log('API Response:', resp);
    } catch (e) {
        console.error("Unable to post message", e);
    }
}

async function deleteText(messageId: string, currentNote: string) {
    if (messageId === "") {
        return;
    }
    try {
        const resp = await fetch("/api/send", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messageId, currentNote }),
        });
        console.log('API Response:', resp);
    } catch (e) {
        console.error("Unable to post message", e);
    }
}

function myersDiff(oldStr: string, newStr: string) {
    const oldLines = oldStr.split(' ');
    const newLines = newStr.split(' ');

    // Create a 2D array to store the edit graph
    const N = oldLines.length;
    const M = newLines.length;
    const max = N + M;
    const V = new Array(2 * max + 1).fill(0);
    const trace = [];

    for (let D = 0; D <= max; D++) {
        trace.push([...V]);
        for (let k = -D; k <= D; k += 2) {
            let x, y;
            if (k == -D || (k != D && V[k - 1 + max] < V[k + 1 + max])) {
                x = V[k + 1 + max];
            } else {
                x = V[k - 1 + max] + 1;
            }
            y = x - k;

            while (x < N && y < M && oldLines[x] === newLines[y]) {
                x++;
                y++;
            }

            V[k + max] = x;

            if (x >= N && y >= M) {
                return backtrack(trace, oldLines, newLines);
            }
        }
    }
}

function backtrack(trace: any[][], oldLines: string[], newLines: string[]) {
    const N = oldLines.length;
    const M = newLines.length;
    const diff = [];
    let x = N;
    let y = M;

    for (let D = trace.length - 1; D >= 0; D--) {
        const V = trace[D];
        const k = x - y;

        let prevK;
        if (k == -D || (k != D && V[k - 1 + N + M] < V[k + 1 + N + M])) {
            prevK = k + 1;
        } else {
            prevK = k - 1;
        }

        const prevX = V[prevK + N + M];
        const prevY = prevX - prevK;

        while (x > prevX && y > prevY) {
            diff.unshift({ type: 'unchanged', value: oldLines[x - 1] });
            x--;
            y--;
        }

        if (D > 0) {
            if (x == prevX) {
                diff.unshift({ type: 'added', value: newLines[y - 1] });
                y--;
            } else {
                diff.unshift({ type: 'removed', value: oldLines[x - 1] });
                x--;
            }
        }
    }

    return diff;
}