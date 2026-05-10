import React, { useEffect } from 'react';
import aos from 'aos';
import "aos/dist/aos.css"
import Router from './router/Router';
import "../src/assets/scss/main.scss"

function App() {

  useEffect(()=> {
    aos.init({
      offset: 100,
      duration: 1000,
      easing: "ease"
    })
  },[])

  return (<Router />);

}

export default App;
