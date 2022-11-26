import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useSelector, useDispatch } from "react-redux"
import { setUsernameAction } from '../redux/actions/main'
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';


const Home = () => {
  const name = useSelector((state) => state.main.name)
  const dispatch = useDispatch()
  const [username, setUsername] = useState("");

  console.log(name);
  // console.log(props);
  // console.log(setInfo);

  useEffect(() => {
    Pusher.logToConsole = true;    // Enable pusher logging - don't include this in production

    const pusher = new Pusher('c25ea714adba518a4f2d', {
      cluster: 'eu'
    });

    const channel = pusher.subscribe('general-channel');
    channel.bind('new-user', function(data) {
      dispatch(setUsernameAction(data.username))
    });
  }, []);

  const handleInputChange = (e) => {
    setUsername(e.target.value)
  };

  const handleSubmit = async (e) =>{
    e.preventDefault();

    console.log('from submit', e.target.value);

    await fetch('/api/general',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        username
      }),
    });

    dispatch(setUsernameAction(username))
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Patchwork</title>
        <meta name="DnD Puzzle Game" content="Patchwork Game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className={styles.main}>
        <p>Hello, {name}</p>
        <div style={{display:"flex"}}>
          <form onSubmit={handleSubmit}>
            <input onChange={handleInputChange} placeholder="Example: Pesho1 ?" value={username}/>
            <button type='submit'>Play</button>
          </form>
        </div>
      </main>


    </div>
  )
};

// const mapStateToProps = state => ({
//   userInfo: state.main.userInfo
// });

// const mapDispatchToProps = {
//   setInfo: setInfoAction,
// };

// export default connect(mapStateToProps)(Home);
export default Home;