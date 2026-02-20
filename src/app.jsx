import 'lite-youtube-embed';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import { useState, useRef, useContext, useEffect } from 'preact/hooks'
import { createContext, createElement } from 'preact';
import * as Slp from '@slippi/slippi-js';
import cn from 'classnames';

function C(...args) { return { className: cn(...args) }; }

const Stages = {};
function defStage(id, name, shortName, cn) { Stages[id] = { id, name, shortName, cn }; }
defStage(Slp.Stage.FOUNTAIN_OF_DREAMS, "Fountain Of Dreams", "FoD", "badge-primary");
defStage(Slp.Stage.POKEMON_STADIUM, "Pokemon Stadium", "PS", "badge-success");
defStage(Slp.Stage.YOSHIS_STORY, "Yoshi's Story", "YS", "badge-warning");
defStage(Slp.Stage.BATTLEFIELD, "Battlefield", "BF", "badge-error");
defStage(Slp.Stage.FINAL_DESTINATION, "Final Destination", "FD", "badge-secondary");
defStage(Slp.Stage.DREAMLAND, "Dreamland", "DL", "badge-info");

const Characters = {};
function defChar(id, name, iconName, cns) { Characters[id] = { id, name, iconName, cns }; }
defChar(Slp.Character.MARTH, "Marth", "MARTH", [
  "badge-neutral", "badge-neutral", "badge-neutral", "badge-warning", "badge-neutral", "badge-neutral"
]);
defChar(Slp.Character.FALCO, "Falco", "FALCO", [
  "badge-accent", "badge-neutral", "badge-neutral", "badge-neutral", "badge-neutral", "badge-neutral"
]);
defChar(Slp.Character.YOSHI, "Yoshi", "YOSHI", [
  "badge-success", "badge-neutral", "badge-neutral", "badge-neutral", "badge-neutral", "badge-neutral"
]);

/*
function SHA(msg) { return sha256(msg).toString(); }

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
  const X = useX();
  const elRef = useRef(null);
  async function onInterval() {
    const sessionData = X.state.sessionData || {};
    const { combos = {} } = (sessionData || {});
    const activeCombo = combos[X.activeComboId];
    const player = await elRef.current.getYTPlayer();
    const tStart = (activeCombo.startFrame / 60);
    const tEnd = 3 + ((activeCombo.startFrame + activeCombo.frames) / 60);
    const playerState = player.getPlayerState();
    if (playerState > 2) { return; }
    if (playerState !== 1) {
      player.seekTo(tStart);
      player.playVideo();
    }
    const currentTime = player.getCurrentTime();
    if (currentTime < tStart || currentTime > tEnd) {
      player.seekTo(tStart);
      player.playVideo();
    }
  }
  useEffect(() => {
    const intervalId = setInterval(onInterval, 500);
    return () => { clearInterval(intervalId); };
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

function cellCn(...rest) {
  const base = cn(
    'flex justify-center whitespace-nowrap items-center h-full bg-inherit',
    'border-b-1 border-gray-700',
  );
  return cn(base, ...rest);
}

function CharacterIcon(props) {
  const char = Characters[props.charId];
  return (
    <div className='tooltip' data-tip={char.name}>
      <div className={cn('badge badge-soft', char.cns[props.color])}>
        <img className='h-4 w-4' src={`/character_icons/${char.iconName}.png`} />
      </div>
    </div>
  );
}

function TableRow(props) {
  return (
    <div
      {...(props.id ? { id: props.id } : {})}
      onClick={props.onClick || (() => {})}
      className={cn(
        'min-w-165',
        'flex h-12 items-center gap-0',
        { 'cursor-pointer hover:bg-gray-900': !!props.onClick },
        { 'bg-gray-700 hover:bg-gray-700': props.isActive },
        props.className || '',
      )}
    >
      <div className={cellCn('flex-1')} />
      <div className={cellCn('min-w-50 w-50')}>
        {props.cells[0]}
      </div>
      <div className={cellCn('min-w-18 w-15')}>
        {props.cells[1]}
      </div>
      <div className={cellCn('min-w-15 w-15')}>
        {props.cells[2]}
      </div>
      <div className={cellCn('min-w-22 w-12')}>
        {props.cells[3]}
      </div>
      <div className={cellCn('min-w-20 w-15')}>
        {props.cells[4]}
      </div>
      <div className={cellCn('min-w-20 w-45')}>
        {props.cells[5]}
      </div>
      <div className={cellCn('min-w-15 w-15')}>
        {props.cells[6]}
      </div>
      <div className={cellCn('min-w-20 w-15')}>
        {props.cells[7]}
      </div>
      <div className={cellCn('min-w-35 w-15')}>
        {props.cells[8]}
      </div>
      <div className={cellCn('flex-1')} />
    </div>
  );
}

function skelRow() {
  return (
    <TableRow
      cells={[
        (<div className='skeleton rounded-box h-4 w-[80%]' />),
        (<div className='skeleton rounded-box h-4 w-[80%]' />),
        (<div className='skeleton rounded-box h-4 w-10' />),
        (<div className='skeleton rounded-box h-4 w-12' />),
        (<div className='skeleton rounded-box h-4 w-10' />),
        (<div className='skeleton rounded-box h-4 w-10' />),
        (<div className='skeleton rounded-box h-4 w-10' />),
        (<div className='skeleton rounded-box h-4 w-10' />),
        (<div className='skeleton rounded-box h-4 w-[80%]' />),
      ]}
    />
  );
}

function getRootFontSize() {
  const rawFS = window.getComputedStyle(document.documentElement).fontSize;
  return parseFloat(rawFS);
}
function remToPx(rem) { return getRootFontSize() * rem; }

function SessionedPage() {
  const X = useX();
  const sessionData = X.state.sessionData || {};
  const { sortedComboIds = [], games = {}, combos = {} } = (sessionData || {});
  const activeCombos = sortedComboIds.map(id => combos[id]);
  const activeCombo = combos[X.activeComboId];
  const activeGame = activeCombo && games[activeCombo.gameId];
  const ytId = activeGame && activeGame.ytId;

  function onNewActiveComboId() {
    if (!X.activeComboId) { return; }
    const rowId = `comboRow-${X.activeComboId}`;
    const rootEl = document.getElementById('combo-scroll-root');
    const rowEl = document.getElementById(rowId);
    if (!rootEl || !rowEl) { return; }
    const rootRect = rootEl.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    const trueTop = rowRect.top - rootRect.top;
    if (trueTop < 0 || (trueTop + rowRect.height) > rootRect.height) {
      rootEl.scrollTo({
        top: rootEl.scrollTop + trueTop - remToPx(4),
        behavior: 'smooth',
      })
    }
  }
  useEffect(onNewActiveComboId, [X.activeComboId]);

  function Game(c) { return games[c && c.gameId]; }
  function Stage(c) { return Stages[Game(c).stageId]; }
  function hlKills(c, t) {
    return (
      <span className={c.didKill ? 'font-bold' : 'italic opacity-60'}>
        {t}
      </span>
    );
  }

  return (
    <>
      <div className='flex-0 bg-base-300'>
        <div className='bg-black/20 border-gray-700 border-b-2 overflow-hidden' >
          <div
            className='h-[40vh] w-full flex justify-center'
          >
            <div
              className='aspect-[876/720] h-full bg-primary-content relative'
            >
              {!ytId ? null : (
                <YoutubeClip
                  ytId={ytId}
                  className="h-full w-full relative z-2"
                />
              )}
              <div className='absolute top-[25%] w-full h-full shadow-xl flex justify-center z-1'>
                <span className='loading loading-ring absolute h-[50%] w-auto aspect-1' />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex-1 flex flex-col relative'>
        <div id="combo-scroll-root" className={cn(
          'absolute top-0 left-0 w-full h-full',
          sortedComboIds.length ? 'overflow-scroll' : 'overflow-hidden',
        )}>
        <div className='sticky bg-base-200 top-0 z-10'>
          <TableRow
            className='shadow-xl bg-base-200'
            cells={[
                'Filename',
                'Me',
                '',
                'Stage',
                'Opponent',
                'Damage',
                'Time',
                '# Hits',
                'Opening Type',
              ]}
          />
        </div>
        {activeCombos.length ? null : (
          <>
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
            {skelRow()}
          </>
        )}
        {activeCombos.map((c, ind) => (
              <TableRow
                key={c.id}
                id={`comboRow-${c.id}`}
                isActive={X.activeComboId === c.id}
                onClick={() => X.setState({ activeComboInd: ind })}
                cells={[
                  (
                    <div className='badge badge-sm badge-info badge-soft'>
                      {Game(c).filename}
                    </div>
                  ),
                  (
                    <div className='badge badge-sm badge-primary badge-soft'>
                      {Game(c).me.cc}
                    </div>
                  ),
                  (
                    <CharacterIcon
                      charId={Game(c).me.characterId}
                      color={Game(c).me.characterColor}
                    />
                  ),
                  (
                    <div className='tooltip' data-tip={Stage(c).name}>
                      <div className={cn('badge badge-outline', Stage(c).cn)}>
                        {Stage(c).shortName}
                      </div>
                    </div>
                  ),
                  (
                    <CharacterIcon
                      charId={Game(c).op.characterId}
                      color={Game(c).op.characterColor}
                    />
                  ),
                  hlKills(c, `${Math.round(c.damage)}%`),
                  hlKills(c, `${(c.frames / 60).toFixed(2)}s`),
                  hlKills(c, `${c.moves.length}`),
                  // hlKills(c, `${c.openingType}`),
                  hlKills(c, `${c.openingType}`),
                ]}
              />
        ))}
        </div>
      </div>
    </>
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
        <div className='min-h-[100vh] flex flex-col'>
          <SessionedPage />
          <div className={cn(
            'flex-0 w-full justify-between p-2 shadow-xl',
            'flex bg-base-200 border-gray-700 border-t-2 items-center',
            { hidden: !session }
          )}>
            <div
              className='join'
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
              <div className='join-item w-1 h-full bg-base-100' />
              <button
                onClick={() => {
                  window.localStorage.removeItem('loginToken')
                  X.setState({ session: null, sessionData: null });
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
      <input
        id="sessionModal"
        type="checkbox"
        className="modal-toggle"
        checked={!session}
      />
      <div className='modal' role='dialog'>
        <div className='modal-box'>
          <h3 className='text-lg font-bold'> No Active Session </h3>
          Logging in currently requires special url. Ask mitch for it.
        </div>
      </div>
    </div>
  );
}

function cleanData(data) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sel = decodeURIComponent(urlParams.get('sel') || '');
  data.sortedComboIds.reverse();
  const games = data.games;
  function isOnYt(id) { return Boolean(games[id] && games[id].ytId); }
  function isComboActive(comboId) {
    const c = data.combos[comboId];
    if (!c) { return false; }
    if (c.moves.length < 2) { return false; }
    if (!isOnYt(c.gameId)) { return false; }
    const game = games[c.gameId];
    // TODO fix lol
    if (game.op.characterId !== Slp.Character.YOSHI) { return false; }
    return true;
  }
  data.sortedComboIds = data.sortedComboIds.filter(isComboActive);
  let activeComboInd = 0;
  data.sortedComboIds.forEach((comboId, ind) => {
    data.combos[comboId].id = comboId;
    if (comboId !== sel) { return; }
    activeComboInd = ind;
  });
  return {
    sessionData: data,
    isLoading: false,
    activeComboInd,
  };
}

export function App({ loginToken }) {
  const session = getSession(loginToken || '');
  const combosId = (session && session.combosId) || '';
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

  const sessionData = X.current.state.sessionData || {};
  const { combos = {}, sortedComboIds = [] } = sessionData;
  function comboIndToId(ind) { return (combos[sortedComboIds[ind]] || {}).id; }
  const activeComboId = (
    comboIndToId(X.current.state.activeComboInd) || comboIndToId(0)
  );
  X.current.activeComboId = activeComboId;

  useEffect(
    () => {
      if (!activeComboId) { return }
      const url = new URL(window.location);
      url.searchParams.set('sel', activeComboId);
      window.history.replaceState({}, '', url);
    },
    [activeComboId]
  );

  const hasSession = !!session;
  useEffect(() => {
    if (hasSession) { localStorage.setItem('loginToken', loginToken) }
  }, [hasSession])

  useEffect(() => {
    document.addEventListener('keydown', (event) => {
      const delta = (() => {
        if (event.key === 'ArrowUp') { return -1; }
        if (event.key === 'ArrowDown') { return 1; }
        return 0;
      })();
      if (!delta) { return; }
      event.preventDefault();
      event.stopPropagation();
      const sessionData = X.current.state.sessionData || {};
      const { sortedComboIds = [] } = sessionData;
      const max = sortedComboIds.length - 1;
      const currInd = X.current.state.activeComboInd || 0;
      X.current.setState(
        { activeComboInd: Math.max(0, Math.min(max, currInd + delta)) }
      );
    });
  }, []);

  useEffect(
    () => {
      const isValid = !!combosId;
      setState({ sessionerror: null, sessionData: null, isLoading: isValid });
      if (!isValid) { return; }
      fetch(`https://api.jsonsilo.com/public/${combosId}`)
        .then(res => res.json())
        .then(cleanData)
        .then(setState)
        .catch((sessionError) => setState({ sessionError, isLoading: false }))
    },
    [combosId]
  )

  return (<XCtx.Provider value={X.current}> <Body /> </XCtx.Provider>);
}
