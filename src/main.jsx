import { render } from 'preact'
import './style.css'
import { App } from './app.jsx'

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const loginToken = urlParams.get('loginToken') || (
  localStorage.getItem('loginToken')
);

render(<App loginToken={loginToken} />, document.getElementById('app'));
