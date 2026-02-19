import 'lite-youtube-embed';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import { useState, useRef, useContext, useEffect } from 'preact/hooks'
import { createContext, createElement } from 'preact';
import cn from 'classnames';
function C(...args) { return { className: cn(...args) }; }

function SHA(msg) { return sha256(msg).toString(); }

/*
function ENC(msg, key) {
  return CryptoJS.AES.encrypt(msg, key).toString();
}
*/

function DEC(msg, key) {
  return JSON.parse(CryptoJS.AES.decrypt(msg, key).toString(CryptoJS.enc.Utf8));
}

function ENCODING(...args) { return args.join(''); }

const ENCODED_SESSIONS = [
  ENCODING(
    'U2FsdGVkX1/yv5L95C/uQ2N/ZYbQ0gj+mw8ZzfOnkjpMWMHnqsbPAk3j+5LDH2JDO',
    'G1fMhAXWkuchVaPzYgpT1GejJQlwR1No0PnXxQQeGimbxc0/hvmgdnruSnE8VIu',
  ),
];

function getSession(token) {
  for (const session of ENCODED_SESSIONS) {
    try { return DEC(session, token); } catch { }
  }
}

const XCtx = createContext();
function useX() { return useContext(XCtx); }

function YoutubeClipImpl(props) {
  const elRef = useRef(null);
  useEffect(() => {
    ((async () => {
      const player = await elRef.current.getYTPlayer();
      player.addEventListener('onStateChange', (event, ...rest) => {
        console.log('STATE CHANGE');
        console.log(event);
        console.log(rest);
      });
    })());
  }, []);
  return createElement('lite-youtube', {
    ...props,
    'params': 'mute=1',
    'autoload': true,
    'js-api': true,
    'ref': elRef,
  });
}

function YoutubeClip(props) {
  return <YoutubeClipImpl key={props.ytId} videoid={props.ytId} {...props} />;
}

function SessionedPage() {
  return (
    <div className='bg-black border-base-300 border-b-1' >
      <YoutubeClip ytId="SYKpc-PrY5g" className="m-auto" />
    </div>
  );
}

function Body() {
  const X = useX();
  const { session, sessionData } = X.state;
  const games = (sessionData || {}).games || {};
  const gameVals = Object.values(games);
  const recordedCount = gameVals.filter(g => g.ytId).length;
  return (
    <div className='bg-base-300 relative'>
      <div className={cn(
        'container rounded-none min-h-screen mx-auto card relative',
        'bg-base-100 shadow-xl mx-4 my-0'
      )}>
        {((() => {
          if (!X.state.session) {
            return 'no session...'
          }
          if (X.state.isLoading) {
            return 'loading...'
          }

          return <SessionedPage />
        })())}

        <div className={cn(
          'absolute bottom-0 left-0 w-full h-10 justify-between px-2',
          'flex bg-base-200 border-base-100 border-t-1 items-center',
          { hidden: !session }
        )}>
          <div
            className='dropdown dropdown-top dropdown-center join'
          >
            <div className={cn(
              'join-item badge badge-soft',
              'pr-1 pt-px text-neutral-content'
            )}>
              <svg
                className='h-5 w-5'
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640">
                <path
                  fill="currentColor"
                    d={([
                      "M112 320C112 205.1 205.1 112 320 112C383.1 112 439.6 ",
                      "140.1 477.8 184.5C486.4 194.6 501.6 195.7 511.6 ",
                      "187.1C521.6 178.5 522.8 163.3 514.2 153.3C467.3 ",
                      "98.6 397.7 64 320 64C178.6 64 64 178.6 64 320L64 ",
                      "360C64 373.3 74.7 384 88 384C101.3 384 112 373.3 ",
                      "112 360L112 320zM570.5 267.1C567.8 254.1 555 245.8 ",
                      "542.1 248.6C529.2 251.4 520.8 264.1 523.6 277C526.5 ",
                      "290.9 528.1 305.3 528.1 320.1L528.1 360.1C528.1 ",
                      "373.4 538.8 384.1 552.1 384.1C565.4 384.1 576.1 ",
                      "373.4 576.1 360.1L576.1 320.1C576.1 302 574.2 284.3 ",
                      "570.6 267.2zM320 144C301 144 282.6 147 265.5 ",
                      "152.6C250.3 157.6 246.8 176.3 257.2 188.5C264.3 ",
                      "196.8 276 199.3 286.6 196.4C297.2 193.5 308.4 192 ",
                      "320 192C390.7 192 448 249.3 448 320L448 344.9C448 ",
                      "370.1 446.5 395.2 443.6 420.2C441.9 434.8 453 448 ",
                      "467.8 448C479.6 448 489.7 439.4 491.1 427.7C494.4 ",
                      "400.3 496.1 372.7 496.1 345L496.1 320.1C496.1 222.9 ",
                      "417.3 144.1 320.1 144.1zM214.7 212.7C205.6 202.1 ",
                      "189.4 201.3 180.8 212.3C157.7 242.1 144 279.4 144 ",
                      "320L144 344.9C144 369.1 141.4 393.3 136.2 ",
                      "416.8C132.8 432.4 144.1 447.9 160.1 447.9C170.6 ",
                      "447.9 180 440.9 182.3 430.6C188.7 402.5 192 373.8 ",
                      "192 344.8L192 319.9C192 292.7 200.5 267.5 214.9 ",
                      "246.8C222.1 236.4 222.9 222.2 214.7 212.6zM320 ",
                      "224C267 224 224 267 224 320L224 344.9C224 380.8 ",
                      "219.4 416.4 210.2 451C206.4 465.3 216.9 480 231.7 ",
                      "480C241.2 480 249.6 473.8 252.1 464.6C262.6 425.6 ",
                      "268 385.4 268 344.9L268 320C268 291.3 291.3 268 320 ",
                      "268C348.7 268 372 291.3 372 320L372 344.9C372 381.2 ",
                      "368.5 417.3 361.6 452.8C358.9 466.7 369.3 480 383.4 ",
                      "480C393.6 480 402.4 473 404.4 463C412.1 424.2 416 ",
                      "384.7 416 344.9L416 320C416 267 373 224 320 224zM344 ",
                      "320C344 306.7 333.3 296 320 296C306.7 296 296 306.7 ",
                      "296 320L296 344.9C296 404.8 285 464.2 263.5 ",
                      "520.1L257.6 535.4C252.8 547.8 259 561.7 271.4 ",
                      "566.4C283.8 571.1 297.7 565 302.4 552.6L308.3 ",
                      "537.3C331.9 475.9 344 410.7 344 344.9L344 320z"
                    ]).join('')}/>
              </svg>
            </div>
            <div
              {...C(
                'dropdown-content w-full h-10 bg-accent-content rounded-box z-1',
                'shadow-xl overflow-hidden border-1 border-base-content/25 inset-shadow-primary'
              )}
            >
              <button
                {...C(
                  'btn btn-outline w-full btn-error border-0',
                  'shadow-error hover:shadow-base-300',
                )}
                style={{
                  boxShadow: (
                    'inset 0px 0px 2rem color-mix' +
                      '(in oklab, var(--tw-shadow-color) 20%, transparent)'
                  )
                }}
              >
                logout
              </button>
            </div>
            <div className='join-item w-1 h-full bg-base-100' />
            <button
              onClick={() => {
                window.localStorage.removeItem('loginToken')
                X.setState({ session: null });
              }}
              className='join-item group btn btn-xs btn-soft btn-secondary hover:btn-error pl-1'
            >
              <span className='relative'>
                <span className='group-hover:opacity-0'>
                  {session && session.name}
                </span>
                <span className='absolute top-0 left-0 w-full text-center opacity-0 group-hover:opacity-100'>
                  logout
                </span>
              </span>
            </button>
          </div>
          <div className='w-44 flex items-center justify-center'>
            {X.state.isLoading ? (<div className='skeleton h-5 w-43 rounded-full' />) : (
              <div className='whitespace-nowrap text-sm'>
                <span className='text-primary font-bold'>
                  {recordedCount}
                </span>
                <span className='opacity-67'>
                  &nbsp;recorded of&nbsp;
                </span>
                <span className='text-primary font-bold'>
                  {gameVals.length}
                </span>
                <span className='opacity-67'>
                  &nbsp;indexed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export function App({ loginToken }) {
  const session = getSession(loginToken || '');
  const combosId = (session && session.combosId) || '';
  console.log({ combosId });
  const X = useRef({});
  const [state, _setState] = useState({
    session
  });
  X.current.state = state;
  X.current.setState = (updates) => {
    const nextState = { ...state, ...updates };
    X.current.state = nextState;
    _setState(nextState);
  };
  const setState = (...args) => X.current.setState(...args);

  const hasSession = !!session;
  useEffect(() => {
    if (hasSession) { localStorage.setItem('loginToken', loginToken) }
  }, [hasSession])

  useEffect(
    () => {
      const isValid = !!combosId;
      setState({ sessionerror: null, sessionData: null, isLoading: isValid });
      if (!isValid) { return; }
      fetch(`https://api.jsonsilo.com/public/${combosId}`)
        .then(res => res.json())
        .then((sessionData) => setState({ sessionData, isLoading: false }))
        .catch((sessionError) => setState({ sessionError, isLoading: false }))
    },
    [combosId]
  )

  return (<XCtx.Provider value={X.current}> <Body /> </XCtx.Provider>);
}
