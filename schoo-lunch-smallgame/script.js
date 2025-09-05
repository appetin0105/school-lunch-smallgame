const EMOJIS = [
  "🍎","🍌","🍇","🍉","🍓","🍒","🥝","🥭","🍍","🥑",
  "🥕","🥔","🥦","🥬","🌽","🍅","🧄","🧅","🍄","🥚",
  "🧀","🥛","🍞","🥖","🥯","🍚","🍱","🍣","🍜","🥟",
  "🍗","🍤","🍕","🍔","🍟","🌮","🥗","🧇","🥞","🍩"
]; 

const MODE_TIME = { 8: 60, 12: 90, 20: 180 };
let pairs = 8, totalPairs = 8;
let deck = [];
let firstCard = null;
let lockBoard = false;
let matchedPairs = 0, moves = 0, timeLeft = 0, timer = null;

const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const modeBtns = document.querySelectorAll(".mode-btn");
const timeText = document.getElementById("timeText");
const matchedText = document.getElementById("matchedText");
const totalPairsText = document.getElementById("totalPairsText");
const movesText = document.getElementById("movesText");
const timeBarFill = document.getElementById("timeBarFill");
const toast = document.getElementById("toast");

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function showToast(msg, ms = 1500){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), ms);
}
function setGridColumns(pairs){
  const nCards = pairs * 2;
  let cols = Math.round(Math.sqrt(nCards));
  if (nCards === 16) cols = 4;
  else if (nCards === 24) cols = 6;
  else if (nCards === 40) cols = 5;
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}
function createDeck(pairs){
  const items = shuffle(EMOJIS.slice()).slice(0, pairs);
  return shuffle([...items, ...items]).map((emoji, idx)=>({
    id: `c${idx}-${emoji}`, value: emoji, matched: false
  }));
}
function renderBoard(){
  board.innerHTML = "";
  setGridColumns(pairs);
  deck.forEach(card=>{
    const el = document.createElement("button");
    el.className = "card";
    el.dataset.id = card.id;
    el.dataset.value = card.value;
    el.innerHTML = `
      <div class="card-inner">
        <div class="face back">？</div>
        <div class="face front">${card.value}</div>
      </div>`;
    el.addEventListener("click", onFlip);
    board.appendChild(el);
  });
}
function resetState(){
  firstCard = null; lockBoard = false;
  matchedPairs = 0; moves = 0; updateStats();
  clearInterval(timer); timer = null;
  timeBarFill.style.width = "0%";
}
function startGame(){
  totalPairs = pairs; deck = createDeck(pairs);
  resetState(); renderBoard();
  totalPairsText.textContent = totalPairs;
  timeLeft = MODE_TIME[pairs]; timeText.textContent = `${timeLeft}s`;
  startTimer(); startBtn.disabled = true; restartBtn.disabled = false;
  modeBtns.forEach(b=> b.disabled = true);
}
function restartGame(){ startGame(); showToast("已重新開始！"); }
function startTimer(){
  const total = MODE_TIME[pairs];
  clearInterval(timer);
  timer = setInterval(()=>{
    timeLeft--; timeText.textContent = `${timeLeft}s`;
    timeBarFill.style.width = `${((total - timeLeft)/total)*100}%`;
    if(timeLeft <= 0){
      clearInterval(timer); lockAll(true);
      showToast("時間到～下次再挑戰！", 2000);
      startBtn.disabled = false; modeBtns.forEach(b=> b.disabled = false);
    }
  }, 1000);
}
function updateStats(){ matchedText.textContent = matchedPairs; movesText.textContent = moves; }
function lockAll(state){
  document.querySelectorAll(".card").forEach(c=>{
    if(state) c.classList.add("locked"); else c.classList.remove("locked");
  });
}
function onFlip(e){
  if(lockBoard || timeLeft <= 0) return;
  const cardEl = e.currentTarget;
  if(cardEl.classList.contains("flipped")) return;
  cardEl.classList.add("flipped");
  if(!firstCard){ firstCard = cardEl; return; }
  moves++; updateStats();
  if(cardEl.dataset.value === firstCard.dataset.value){
    cardEl.classList.add("matched","locked");
    firstCard.classList.add("matched","locked");
    matchedPairs++; updateStats(); firstCard = null;
    if(matchedPairs === totalPairs){
      clearInterval(timer);
      showToast(`恭喜！完成於 ${MODE_TIME[pairs]-timeLeft}s，步數 ${moves}`, 2600);
      startBtn.disabled = false; modeBtns.forEach(b=> b.disabled = false);
    }
  }else{
    lockBoard = true;
    setTimeout(()=>{
      cardEl.classList.remove("flipped");
      firstCard.classList.remove("flipped");
      firstCard = null; lockBoard = false;
    }, 700);
  }
}
modeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    modeBtns.forEach(b=> b.classList.remove("active"));
    btn.classList.add("active"); pairs = Number(btn.dataset.pairs);
    totalPairsText.textContent = pairs; timeText.textContent = `${MODE_TIME[pairs]}s`;
    deck = createDeck(pairs); resetState(); renderBoard();
    restartBtn.disabled = true; startBtn.disabled = false;
  });
});
document.querySelector('.mode-btn[data-pairs="8"]').classList.add("active");
deck = createDeck(pairs); renderBoard();
totalPairsText.textContent = pairs; timeText.textContent = `${MODE_TIME[pairs]}s`;
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
