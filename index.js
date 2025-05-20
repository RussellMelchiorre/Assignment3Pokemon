// holds all pokemon and game stats
let pokeList = [];
let game = {};

// reset everything
function resetGame() {
  game = {
    first: null,
    second: null,
    locked: false,
    clicks: 0,
    matches: 0,
    total: 0,
    timer: null,
    timeLeft: 0,
    usedPower: false
  };
}

//get by id shortcut
function get(id) {
  return document.getElementById(id);
}

// show current stats
function showStats() {
  get('clicks').textContent = game.clicks;
  get('matched').textContent = game.matches;
  get('total').textContent = game.total;
  get('left').textContent = game.total - game.matches;
  get('time').textContent = game.timeLeft;
}

// shuffle pokemon
function shuffle(arr) {
  arr.sort(() => Math.random() - 0.5);
}


// unflip two cards
function unflip(card1, card2) {
  setTimeout(() => {
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
    game.first = null;
    game.second = null;
    game.locked = false;
  }, 600);
}

// start timer
function startTimer() {
  if (game.timer) return;

  game.timer = setInterval(() => {
    game.timeLeft--;
    showStats();

    if (game.timeLeft <= 0) {
      clearInterval(game.timer);
      get('message').textContent = 'Game Over!';
      document.querySelectorAll('.card').forEach(card => {
        card.onclick = null;
      });
    }
  }, 1000);
}

//set and manage click logic for each card
function setupClicks() {
  document.querySelectorAll('.card').forEach(card => {
    card.onclick = function () {
      if (game.locked || this.classList.contains('flipped')) return;

      if (!game.timer) {
        startTimer();
      }

      this.classList.add('flipped');
      game.clicks++;
      showStats();

      if (!game.first) {
        game.first = this;
      } else {
        game.second = this;
        game.locked = true;

        if (game.first.getAttribute('data-id') === game.second.getAttribute('data-id')) {
          game.matches++;
          game.first.onclick = null;
          game.second.onclick = null;
          game.first = null;
          game.second = null;
          game.locked = false;
          showStats();

          if (game.matches === game.total) {
            clearInterval(game.timer);
            get('message').textContent = 'Congrats! You Win!';
          }
        } else {
          unflip(game.first, game.second);
        }
      }
    };
  });
}

// grab image
function fetchImg(url, cb) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      let img = data.sprites.other['official-artwork'].front_default;
      cb(img);
    });
}

// start a game
function newGame() {
  clearInterval(game.timer);
  resetGame();
  get('message').textContent = '';

  let mode = get('difficulty').value;
  let rows = 2, cols = 3, time = 60;

  if (mode === 'medium') {
    rows = 3; cols = 4; time = 30;
  } else if (mode === 'hard') {
    rows = 4; cols = 5; time = 70;
  }

  game.total = (rows * cols) / 2;
  game.timeLeft = time;
  showStats();

  let picks = pokeList.slice();
  shuffle(picks);
  picks = picks.slice(0, game.total);

  let ready = [];
  let loaded = 0;

  picks.forEach((poke, i) => {
    fetchImg(poke.url, img => {
      ready.push({ img: img, id: i });
      loaded++;

      if (loaded === game.total) {
         buildGrid(ready, mode);
         setupClicks(); 
}

    });
  });
}

// build card display
function buildGrid(data, mode) {
let deck = [];

data.forEach(item => {
  deck.push({ img: item.img, id: item.id });
  deck.push({ img: item.img, id: item.id });
});

shuffle(deck);


  shuffle(deck);

  let grid = get('grid');
  grid.className = 'grid ' + mode;
  grid.innerHTML = '';

  deck.forEach(card => {
    let cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-id', card.id);

    let back = document.createElement('div');
    back.className = 'back';

    let front = document.createElement('div');
    front.className = 'front';

    let img = document.createElement('img');
    img.src = card.img;
    img.width = 80;
    img.height = 80;

    front.appendChild(img);
    cardDiv.appendChild(back);
    cardDiv.appendChild(front);
    grid.appendChild(cardDiv);
  });
}


//powerup that can be used once per game
function usePower() {
  if (game.usedPower) return;
  game.usedPower = true;debugger
  get('powerup').disabled = true;
  let cards = document.querySelectorAll('.card');

  let unmatched = [];
  cards.forEach(card => {
    if (card.onclick !== null) {
      card.classList.add('flipped');
      unmatched.push(card);
    }
  });

  setTimeout(() => {
    unmatched.forEach(card => card.classList.remove('flipped'));
  }, 1000);
}


//change theme
function toggleTheme() {
  document.body.classList.toggle('bg-light');
  document.body.classList.toggle('bg-dark');
  document.body.classList.toggle('text-light');
  document.body.classList.toggle('text-dark');
}

//setup when page loads
document.addEventListener('DOMContentLoaded', () => {
 fetch('https://pokeapi.co/api/v2/pokemon?limit=1')
  .then(res => res.json())
  .then(info => {
    let count = info.count;
    return fetch(`https://pokeapi.co/api/v2/pokemon?limit=${count}`);
  })
  .then(res => res.json())
  .then(data => {
    pokeList = data.results;
    get('message').textContent = 'Press Start to begin!';
  });


  get('start').onclick = () => {
    get('powerup').disabled = false;
    newGame();
  };

  get('reset').onclick = () => {
    get('powerup').disabled = true;
    newGame();
  };

  get('powerup').onclick = usePower;
  get('themeToggle').onclick = toggleTheme;
});
