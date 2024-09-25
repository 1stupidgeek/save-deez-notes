"use client"
import { noteState } from '@/store/noteState';
import { ChangeEvent, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilState } from 'recoil';

interface Message {
    id: string;
    content: string;
}

export default function TextArea() {
    const [currentNote, setCurrentNote] = useRecoilState(noteState);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [changeableContent, setChangeableContent] = useState<string>('');
    const [newTitle, setNewTitle] = useState<string>("");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setChangeableContent("");
            setNewTitle(currentNote)
            try {
                const data = await useData(currentNote);

                if (data) {
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
                await deleteText(updatedMessages[i].id, currentNote);
                updatedMessages.splice(i, 1);
                i--;
            } else if (joinedMessage !== updatedMessages[i].content) {
                await editText({ content: joinedMessage, id: updatedMessages[i].id, currentNote });
                updatedMessages[i].content = joinedMessage;
            }
        }

        if (index < diffResult!.length) {
            newContent = diffResult!.slice(index).reduce((acc, word) => {
                if (word.type === 'added') {
                    return acc + (acc.length ? " " : "") + word.value;
                }
                return acc;
            }, '');

            if (newContent) {
                const response = await postText(newContent, currentNote);
                if (response && response.id && response.content) {
                    updatedMessages.push({
                        id: response.id,
                        content: response.content,
                    });
                }
            }
        }

        setMessages(updatedMessages);
        setChangeableContent(input);
    }

    function handleTitleChange(e: ChangeEvent<HTMLInputElement>){
        setNewTitle(e.target.value);
    }

    async function handleTitleBlur() {
        // Only update if the title has actually changed
        if (newTitle.trim() === "" || newTitle === currentNote) {
            return;
        }

        try {
            await changeTitle(currentNote, newTitle);
            setCurrentNote(newTitle);  // Update currentNote after successful API call
        } catch (error) {
            console.error("Error changing title:", error);
        }
    }

    if (loading) return <div className='w-full h-screen flex items-center justify-center'>Loading ...</div>;
    return (
        <div className="flex flex-col w-full bg-black m-10 my-12">
            <input 
                value={newTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                className='resize-none border-none focus:outline-none bg-black text-white text-4xl pb-7'
            />
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
async function changeTitle(channelName: string, newTitle: string) {
    if (channelName === "" || newTitle === "") {
        return;
    }
    try {
        const resp = await fetch("/api/changeTitle", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channelName, newTitle }),
        });
        console.log('API Response:', resp);
    } catch (e) {
        console.error("Unable to edit title", e);
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