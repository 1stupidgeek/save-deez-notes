export async function fetchMessage(noteID: string) {
  if (!noteID) return;

  try {
    const response = await fetch("/api/getNote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteID }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export async function postText(noteId: string, message: string) {
  if (!message) return;

  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, noteId }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error posting text:", error);
  }
}

export async function changeTitle(id: string, title: string) {
  try {
    await fetch("/api/changeTitle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title }),
    });
  } catch (error) {
    console.error("Error changing title:", error);
  }
}

export async function getAllChannels() {
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

export async function createNewChannel(channelName: string) {
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

export async function deleteChannel(id: string) {
  try {
    const resp = await fetch("/api/deleteChannel", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await resp.json();
    return data;
  } catch (e) {
    console.error("Unable to delete channel ", e);
    throw e;
  }
}
