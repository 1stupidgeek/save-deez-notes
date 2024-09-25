export async function post(message: string) {
  try {
    const resp = await fetch("/api/send", {
      method: "POST",
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

