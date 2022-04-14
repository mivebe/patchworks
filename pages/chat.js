import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Pusher from 'pusher-js'
import { v4 as getUUID } from 'uuid';

const Chat = () => {
  const username = "gosho";
  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Pusher.logToConsole = true;    // Enable pusher logging - don't include this in production

    const pusher = new Pusher('c25ea714adba518a4f2d', {
      cluster: 'eu'
    });

    const channel = pusher.subscribe('chat-channel');
    channel.bind('message-event', function(data) {
      setAllMessages([...allMessages, data.message])
    });
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('/api/hello',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        username,
        message
      }),
    });

    setMessage('')
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Chat</title>
        <meta name="Player Chat" content="Patchwork Chat" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          {allMessages.map(msg => <p key={getUUID}>{msg}</p>)}
        </div>
        <form onSubmit={handleSubmit}>
          <input onChange={handleInputChange} placeholder="Write a message" value={message}/>
        </form>
      </main>

      <footer className={styles.footer}>
        Footer
      </footer>
    </div>
  )
};
export default Chat;