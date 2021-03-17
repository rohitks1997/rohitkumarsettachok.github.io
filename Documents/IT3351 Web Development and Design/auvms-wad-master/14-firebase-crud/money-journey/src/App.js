import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"

import { useAuthState } from 'react-firebase-hooks/auth';


import Home from './Home'
import Journal from './Journal'
import 'bootstrap/dist/css/bootstrap.min.css';

// console.log('process.env.REACT_APP_API_KEY',process.env.REACT_APP_API_KEY)

import firebase from 'firebase/app';
import 'firebase/auth';
if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    databaseUrl:process.env.DATABASE_URL,
    appId: process.env.REACT_APP_APP_ID
  })
}
const auth = firebase.auth()

function App() {
  const [user] = useAuthState(auth);


  return (
    <Router>
      <Switch>
        {/* <Route path="/journal">
          <Journal />
        </Route> */}
        <Route path="/">
          {user ? <Journal user={user}/> : <Home />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
