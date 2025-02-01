class Assistant {
    constructor() {
        this.apiEndpoint = "http://localhost:11434/api/chat"; // Note: http, not https if not configured for SSL
    }

    async *chatStream(content, messages) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama2-uncensored", // Or whatever model you are using
                    messages: [...messages, { role: "user", content }],
                    stream: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let partialResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                partialResponse += decoder.decode(value, { stream: true });

                let lines = partialResponse.split('\n');
                partialResponse = lines.pop();  // Keep the last (incomplete) line

                for (const line of lines) {
                    if (line.trim() !== "") {
                        try {
                            const jsonChunk = JSON.parse(line);

                            if (jsonChunk.done) { // Check for the 'done' flag
                                // Handle the final response (if needed)
                                // console.log("Final Response:", jsonChunk);
                                break; // Exit the inner loop when done
                            } else if (jsonChunk.message && jsonChunk.message.content) {
                                yield jsonChunk.message.content;
                            }

                        } catch (jsonError) {
                            console.error("JSON parsing error:", jsonError, line);
                            // Handle non-JSON data or incomplete JSON objects here if necessary
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Assistant streaming error:", error);
            throw error;
        }
    }
}

export { Assistant };