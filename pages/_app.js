import React from "react"
import '../styles/globals.css';
import { wrapper } from "../redux/store"
import Header from '../components/Header';
import Footer from '../components/Footer';

const MyApp = ({ Component, pageProps}) => (
  <>
    <Header />
    <Component {...pageProps} />
    <Footer />
  </>
)

export default wrapper.withRedux(MyApp);