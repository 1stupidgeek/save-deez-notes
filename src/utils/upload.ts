export async function post(message: string) {
  try {
    await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  } catch (e) {
    console.error("Unable to post message", e);
  }
}
