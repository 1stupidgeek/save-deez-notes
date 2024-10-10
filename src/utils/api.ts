export async function fetchMessage(currentNote: string) {
  if (!currentNote) return;

  try {
    const response = await fetch("/api/getNote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentNote }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function postText(message: string, currentNote: string) {
  if (!message) return;

  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, currentNote }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error posting text:", error);
  }
}

export async function editText(message: {
  content: string;
  id: string;
  currentNote: string;
}) {
  if (!message.content || !message.id) return;

  try {
    await fetch("/api/send", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch (error) {
    console.error("Error editing text:", error);
  }
}

export async function deleteText(messageId: string, currentNote: string) {
  if (!messageId) return;

  try {
    await fetch("/api/send", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, currentNote }),
    });
  } catch (error) {
    console.error("Error deleting text:", error);
  }
}

export async function changeTitle(channelName: string, newTitle: string) {
  if (!channelName || !newTitle) return;

  try {
    await fetch("/api/changeTitle", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName, newTitle }),
    });
  } catch (error) {
    console.error("Error changing title:", error);
  }
}
