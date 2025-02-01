import { useState , useEffect } from "react";
import { Assistant } from "./assistants/googleai";
import { Loader } from "./components/Loader/Loader";
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Controls";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "./firebase-config";
import styles from "./App.module.css";


function App() {
  const assistant = new Assistant();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  //utilisateur
  const [user, setUser] = useState(null);

  // 🚀 Authentification anonyme
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth)
          .then((result) => setUser(result.user))
          .catch((error) => console.error("Erreur d'authentification :", error));
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Connexion anonyme
  const handleLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  function updateLastMessageContent(content) {
    setMessages((prevMessages) =>
      prevMessages.map((message, index) =>
        index === prevMessages.length - 1
          ? { ...message, content: `${message.content}${content}` }
          : message
      )
    );
  }

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  async function handleContentSend(content) {
    addMessage({ content, role: "user" });
    setIsLoading(true);
    try {
      const result = await assistant.chatStream(content, messages);
      let isFirstChunk = false;

      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIsStreaming(true);
        }

        updateLastMessageContent(chunk);
      }

      setIsStreaming(false);
    } catch (error) {
      addMessage({
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer !!",
        role: "system",
      });
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  return (
    <div className={styles.App}>
      {isLoading && <Loader />}
      <header className={styles.Header}>
        <img className={styles.Logo} src="/chat-bot.png" />
        <h2 className={styles.Title}>Votre assistant virtuel</h2>
        {/* Affichage de l'utilisateur connecté */}
        {user && (
          <div className={styles.UserInfo}>
            <h3>Utilisateur : {user.isAnonymous ? "Accès sans compte" : user.email}</h3>
          </div>
        )}
      </header>
      <div className={styles.ChatContainer}>
        <Chat messages={messages} />
      </div>
      <Controls
        isDisabled={isLoading || isStreaming}
        onSend={handleContentSend}
      />
    </div>
  );
}

export default App;
