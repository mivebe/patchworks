import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Pusher from 'pusher-js'
import { v4 as getUUID } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { updateChatAction } from '../redux/actions/main';

const Chat = () => {
  const username = "gosho";
  const initialMessages = useSelector((state)=> state.chatReducer.messages)
  const [allMessages, setAllMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch()

  useEffect(() => {
    Pusher.logToConsole = true;    // Enable pusher logging - don't include this in production

    const pusher = new Pusher('c25ea714adba518a4f2d', {
      cluster: 'eu'
    });

    const channel = pusher.subscribe('chat-channel');
    channel.bind('message-event', function(data) {
      dispatch(updateChatAction(data.message))
    });
  }, []);

  useEffect(()=>{
    setAllMessages(initialMessages)
  },[initialMessages]);

  const handleInputChange = (e) => {
    setMessage(e.target.value)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('/api/chat',{
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
          {allMessages.map(msg => <p key={getUUID()}>{msg}</p>)}
        </div>
        <form onSubmit={handleSubmit}>
          <input onChange={handleInputChange} placeholder="Write a message" value={message}/>
        </form>
      </main>

    </div>
  )
};
export default Chat;