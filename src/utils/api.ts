export async function fetchMessage(currentNote: string) {
  if (!currentNote) return;

  try {
    const response = await fetch("/api/get", {
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

type DiffResult = { type: "added" | "removed" | "unchanged"; value: string };

export function myersDiff(oldStr: string, newStr: string): DiffResult[] {
  const oldWords = oldStr.split(" ");
  const newWords = newStr.split(" ");

  const N = oldWords.length;
  const M = newWords.length;
  const maxSteps = N + M;
  const V = new Array(2 * maxSteps + 1).fill(0);
  const trace: number[][] = [];

  // Run the diff algorithm
  for (let D = 0; D <= maxSteps; D++) {
    trace.push([...V]);
    for (let k = -D; k <= D; k += 2) {
      const x = getNextX(k, V, maxSteps);
      const y = x - k;

      // Follow the diagonal as far as the strings match
      let newX = x;
      let newY = y;
      while (newX < N && newY < M && oldWords[newX] === newWords[newY]) {
        newX++;
        newY++;
      }

      V[k + maxSteps] = newX;

      // If the end of both strings is reached, backtrack to build the diff
      if (newX >= N && newY >= M) {
        return backtrackDiff(trace, oldWords, newWords);
      }
    }
  }

  return [];
}

// Helper function to compute the next x coordinate in the graph
function getNextX(k: number, V: number[], maxSteps: number): number {
  if (
    k === -maxSteps ||
    (k !== maxSteps && V[k - 1 + maxSteps] < V[k + 1 + maxSteps])
  ) {
    return V[k + 1 + maxSteps]; // Move down
  } else {
    return V[k - 1 + maxSteps] + 1; // Move right
  }
}

// Function to backtrack and build the final diff result
function backtrackDiff(
  trace: number[][],
  oldWords: string[],
  newWords: string[],
): DiffResult[] {
  const N = oldWords.length;
  const M = newWords.length;
  const diff: DiffResult[] = [];

  let x = N;
  let y = M;

  for (let D = trace.length - 1; D >= 0; D--) {
    const V = trace[D];
    const k = x - y;

    const prevK = getPreviousK(k, V, N + M);
    const prevX = V[prevK + N + M];
    const prevY = prevX - prevK;

    // Process unchanged words
    while (x > prevX && y > prevY) {
      diff.unshift({ type: "unchanged", value: oldWords[x - 1] });
      x--;
      y--;
    }

    // Process added or removed words
    if (D > 0) {
      if (x === prevX) {
        diff.unshift({ type: "added", value: newWords[y - 1] });
        y--;
      } else {
        diff.unshift({ type: "removed", value: oldWords[x - 1] });
        x--;
      }
    }
  }

  return diff;
}

// Helper function to compute the previous k value during backtracking
function getPreviousK(k: number, V: number[], offset: number): number {
  if (
    k === -offset ||
    (k !== offset && V[k - 1 + offset] < V[k + 1 + offset])
  ) {
    return k + 1; // Move down
  } else {
    return k - 1; // Move right
  }
}
