import React, { useEffect } from 'react';
import aos from 'aos';
import "aos/dist/aos.css"
import "./assets/client-css/main.css"
import Router from './router/Router';

function App() {

  useEffect(()=> {
    aos.init({
      offset: 100,
      duration: 650,
      easing: "ease-out-cubic",
      once: true
    })
  },[])

  return (<Router />);

}

export default App;
