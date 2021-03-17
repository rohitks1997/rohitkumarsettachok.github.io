import { Container } from "react-bootstrap"
import { Link } from "react-router-dom"

import firebase from 'firebase/app';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    databaseUrl: process.env.DATABASE_URL,
    appId: process.env.REACT_APP_APP_ID
  })
}
const auth = firebase.auth()

export default function Home() {
  const [user] = useAuthState(auth);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  function SignIn() {
    return (
      <div>
        <h1>Enter Clubhouse</h1>
        <button onClick={signInWithGoogle}>
          <img src="https://icon-library.com/images/sign-in-with-google-icon/sign-in-with-google-icon-3.jpg" alt='Google Icon' />
        </button>
      </div>
    )
  }


  return (
    <Container>
      <header className="App-header">
        <h1>Money Journey</h1>
        <button onClick={signInWithGoogle}>
          <img height="40" src="https://icon-library.com/images/sign-in-with-google-icon/sign-in-with-google-icon-3.jpg" alt='Google Icon' />
        </button>
      </header>
      <footer>
        Mode: {process.env.NODE_ENV}<br />
      Project ID: {process.env.REACT_APP_PROJECT_ID}
      </footer>
    </Container>

  )
}


