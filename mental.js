const {
  BrowserWindow,
  dialog
} = require('electron').remote;

const fs = require("fs");
const N = 10;
let num_of_solved = 0;
let solved = false;
let mentalCanvas = null;
let buttonCenter = null;
let startBtn = null;
let footerArea = null;
let array = null;
let ans = null;

let currentPath = '';
let editor = null;

window.addEventListener('DOMContentLoaded', onLoad);

/**
 * sum
 */
var sum = function(arr) {
  var sum = 0;
  arr.forEach(function(elem) {
    sum += elem;
  });
  return sum;
}

function randrange(a, b) {
  return Math.floor(Math.random() * (b - a) + a)
}


function randomSize(m) {
  for (var i = 0; i < m; i++) {
    array.push(randrange(10000, 99999));
  }
}

function randomN() {
  randomSize(N)
}

function naive_implement(seed, reminder) {
  console.log("seed:" + seed + ", reminder: " + reminder);
  var value = 0;
  for (var i = 0; i < N; i++) {
    if (i < N - 1) {
      duration = Math.floor(reminder / N);
      if (Math.random() < 0.5) {
        value = duration - randrange(10000, duration / 4);
        while (value < 1000 || value > duration * 3 / 2) {
          value = duration - randrange(10000, duration / 4);
        }
      } else {
        value = duration + randrange(10000, duration / 5);
        while (value < 1000 || value > duration * 3 / 2) {
          value = duration + randrange(10000, duration / 5);
        }
      }
    } else {
      value = reminder - sum(array)
    }
    array.push(value)
    console.log("i=" + i + ": duration " + duration + ", value " + value);
    console.log(sum(array));
  }
}

function random_implement(seed, reminder) {
  var value = 0;
  for (var i = 0; i < N; i++) {
    if (i < N - 1) {
      value = randrange(10000, 99999);
    } else {
      value = reminder - sum(array)
    }
    array.push(value)
    console.log("i=" + i + ": value " + value);
    console.log(sum(array));
  }
}

function naive_retry(seed, reminder) {
  naive_implement(seed, reminder);
  function isLessMore5dim(x) { return x < 10000 || x > 99999; }
  while (array.filter(isLessMore5dim).length > 0) {
    array = [];
    console.log("RETRY");
    naive_implement(seed, reminder);
  }
}

function random_retry(seed, reminder) {
  random_implement(seed, reminder);
  function isLessMore5dim(x) { return x < 10000 || x > 99999; }
  while (array.filter(isLessMore5dim).length > 0) {
    array = [];
    console.log("RETRY");
    random_implement(seed, reminder);
  }
}

function buildProblem(config) {
  array = [];
  if (!config.play) {
    randomN();
  } else {
    seeds = config.seed
    if (num_of_solved >= seeds.length) {
      randomN();
    } else {
      seed = 100 * seeds[num_of_solved];
      var reminder = seed + randrange(10, 99)
      // naive_retry(seed, reminder);
      random_retry(seed, reminder);
    }
  }
  ans = sum(array);
  console.log(num_of_solved);
  console.log(array);
}

/**
 * Webページ読み込み時の処理
 */
function onLoad() {
  // 入力関連領域, 入力領域, フッター領域
  footerArea = document.getElementById('footer_fixed');
  startBtn = document.getElementById('btnLoad');
  mentalCanvas = document.getElementById('mentalcanvas');
  buttonCenter = document.getElementById('buttoncenter');

  // read config and problem setting
  var config = require('./config.json');
  buildProblem(config);

  // 「読み込む」ボタンの制御
  document.querySelector('#btnLoad').addEventListener('click', () => {
    startBtn.textContent = '.....';
    startBtn.style.visibility = 'hidden';
    if (!solved) {
      mentalCanvas.textContent = '';
      startMental();
    } else {
      mentalCanvas.textContent = ans;
      startBtn.textContent = 'Again?';
      startBtn.style.visibility = 'visible';
      num_of_solved += 1;
      solved = false;

      // generate problem again
      buildProblem(config);
    }
  });
}


function startMental() {
  // generate data
  var audio = new Audio('decision2.mp3');
  var wtime = 1000
  var counter = 0;

  //  wait 1 sec
  var count = 0;
  var timer = setInterval(function() {
    mentalCanvas.textContent = array[count];
    if (count >= N) {
      mentalCanvas.textContent = '?';
      startBtn.textContent = 'Answer';
      startBtn.style.visibility = 'visible';
      clearInterval(timer);
      return;
    }
    audio.play();

    // clear
    var intimer = setInterval(function() {
      mentalCanvas.textContent = '';
      clearInterval(intimer);
    }, wtime / 2);
    audio.currentTime = 0;
    count++;
  }, wtime);
  solved = true;
}
