import Head from 'next/head'
import { connect, useSelector, useDispatch } from "react-redux"
import {setInfoAction} from '../redux/actions/main'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Pusher from 'pusher-js'
import { v4 as getUUID } from 'uuid';

const Home = () => {
  const name = useSelector((state) => state.main.name)
  const dispatch = useDispatch()
  console.log(name);
  // console.log(props);
  // console.log(setInfo);

  return (
    <div className={styles.container}>
      <Head>
        <title>Patchwork</title>
        <meta name="DnD Puzzle Game" content="Patchwork Game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {name}
        <button onClick={() => dispatch(setInfoAction(name+20))}>ASD</button>
      </main>

      <footer className={styles.footer}>
        Footer
      </footer>
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