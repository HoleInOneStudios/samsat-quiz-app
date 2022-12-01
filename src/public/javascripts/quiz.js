// Process the raw data from sheets to a quiz
const RAW_SHEET_DATA = JSON.parse($('#sheet-data').text());
const SHEET_DATA = [];

// Create questions in the quiz
for (var i = 0; i < RAW_SHEET_DATA.length; i++) {
    var q = {};
    // Set the question
    q.question = RAW_SHEET_DATA[i].Question;

    q.answers = [];
    // Set the answers
    for (var j = 0; j < 4; j++) {
        if (RAW_SHEET_DATA[i][(j + 1).toString()] != '') {
            q.answers.push(RAW_SHEET_DATA[i][(j + 1).toString()]);
        }
    }

    // Set the correct Answers
    q.correctAnswers = [];
    answerArray = RAW_SHEET_DATA[i]["Correct"].toString().split(', ');
    for (var j = 0; j < q.answers.length; j++) {
        q.correctAnswers.push(false);
        for (var k = 0; k < answerArray.length; k++) {
            if (j + 1 == answerArray[k]) {
                q.correctAnswers[j] = true;
            }
        }
    }

    // Set the hint
    q.hint = RAW_SHEET_DATA[i].Hint;

    // Set the image
    q.bgImage = RAW_SHEET_DATA[i].BackgroundImage;
    q.hImage = RAW_SHEET_DATA[i].HintImage;

    // push to the array
    SHEET_DATA.push(q);
}

// Get DOM elements
const START = $('quiz-start').get(0);

const MAIN = $('quiz-main').get(0);
const QUESTION = $('quiz-question').get(0);
const ANSWERS = $('quiz-answer');

const HINT_TOGGLE = $('quiz-hint-toggle').get(0);
const HINT_TEXT = $('quiz-hint-text').get(0);

const QUIZ_STATUS = $('quiz-current-question').get(0);
const QUIZ_SCORE = $('quiz-score').get(0);
const QUIZ_TRIES = $('quiz-tries').get(0);

const AUDIO_TOGGLE = $('quiz-audio-toggle').get(0);

const FINISH = $('quiz-finish').get(0);

const QUIZ_RESULTS = $('quiz-results').get(0);

const LOGO = $('quiz-logo').get(0);

// Audio DOM
const CORRECT = $('#correct_Audio').get(0);
const INCORRECT = $('#incorrect_Audio').get(0);

// Session Status Update 
let SCORE = 0;

// tries
let MAX_TRIES = 0;
let TRIES = 0;

// Set the current question
let CURRENT_QUESTION = 0;

// Session array
const SESSION = [];
// Session
for (var i = 0; i < SHEET_DATA.length; i++) {
    SESSION.push({
        selections: [],
        correct: false
    })
}

// audio boolean
let AUDIO = true;

// Set background images
START.style.backgroundImage = SHEET_DATA[0].bgImage ? `url('./img/${SHEET_DATA[0].bgImage}')` : `url('./public/images/backgrounds/placeholder.jpg')`;
MAIN.style.backgroundImage = SHEET_DATA[0].bgImage ? `url('./img/${SHEET_DATA[0].bgImage}')` : `url('./public/images/backgrounds/placeholder.jpg')`;
FINISH.style.backgroundImage = SHEET_DATA[0].bgImage ? `url('./img/${SHEET_DATA[0].bgImage}')` : `url('./public/images/backgrounds/placeholder.jpg')`;

// Set logo
LOGO.innerHTML = `<img src="./img/logo.png" alt="Logo">`;

// States
const QUIZ_STATE = {
    START: 0,
    MAIN: 1,
    FINISH: 2
}

// Set the current state
let CURRENT_STATE = QUIZ_STATE.START;
updateDOMState();

// Set Hint Image
function setHint() {
    HINT_TOGGLE.innerHTML = SHEET_DATA[CURRENT_QUESTION].hImage ? `<img src="./img/${SHEET_DATA[0].hImage}" alt="Hint Image">` : `<img src="./public/images/hint_people/Hint-Person-Placeholder.jpg" alt="Hint Image">`;
    HINT_TEXT.innerHTML = SHEET_DATA[CURRENT_QUESTION].hint;
}
function toggleHint() {
    HINT_TEXT.classList.toggle('hidden');
}
function disableHint() {
    HINT_TEXT.classList.toggle('hidden', true);
}

// update DOM based on state
function updateDOMState() {
    switch (CURRENT_STATE) {
        case QUIZ_STATE.START:
            START.style.display = 'flex';
            MAIN.style.display = 'none';
            FINISH.style.display = 'none';
            break;
        case QUIZ_STATE.MAIN:
            START.style.display = 'none';
            MAIN.style.display = 'flex';
            FINISH.style.display = 'none';
            break;
        case QUIZ_STATE.FINISH:
            START.style.display = 'none';
            MAIN.style.display = 'none';
            FINISH.style.display = 'flex';
            break;
    }
}

// Set state functions
function setStateStart() {
    CURRENT_STATE = QUIZ_STATE.START;
    CURRENT_QUESTION = 0;
    SCORE = 0;

    updateDOMState();
}

function setStateMain() {
    CURRENT_STATE = QUIZ_STATE.MAIN;
    resetSession();
    disableHint();
    setHint();
    loadQuestion();
    updateStatus();
    updateDOMState();
}

function setStateFinish() {
    CURRENT_STATE = QUIZ_STATE.FINISH;
    finishDOM();
    updateDOMState();
}

// Reset SESSION
function resetSession() {
    for (var i = 0; i < SESSION.length; i++) {
        SESSION[i].selections = [];
        SESSION[i].correct = false;
    }
}

// Next Question
function nextQuestion() {
    if (CURRENT_QUESTION < SHEET_DATA.length - 1) {
        CURRENT_QUESTION++;
    } else {
        setStateFinish();
    }

    loadQuestion();
    disableHint();
    setHint();
    updateStatus();
}

//finish DOM
function finishDOM() {
    QUIZ_RESULTS.innerHTML =
        `<h2>${SCORE / SHEET_DATA.length * 100 > 70 ? 'Congratulations!' : 'Better Luck Next Time!'}</h2>
         <p>You have completed the quiz!</p>
         <p>Your score is: ${parseInt(SCORE / SHEET_DATA.length * 100)}%</p>`;
}

// Status
function updateStatus() {
    QUIZ_STATUS.innerHTML = `${CURRENT_QUESTION + 1}/${SHEET_DATA.length}`;
    QUIZ_SCORE.innerHTML = `${parseInt(SCORE / SHEET_DATA.length * 100)}%`;
    QUIZ_TRIES.innerHTML = `${TRIES}/${MAX_TRIES} Tries`;
}

// load question
function loadQuestion() {
    // Set the question
    QUESTION.innerHTML = SHEET_DATA[CURRENT_QUESTION].question;

    // Set the answers
    for (var i = 0; i < ANSWERS.length; i++) {
        if (SHEET_DATA[CURRENT_QUESTION].answers[i]) {
            ANSWERS[i].classList.toggle('correct', false);
            ANSWERS[i].classList.toggle('incorrect', false);
            ANSWERS[i].innerHTML = SHEET_DATA[CURRENT_QUESTION].answers[i];
            ANSWERS[i].classList.toggle('hidden', false);
        } else {
            ANSWERS[i].classList.toggle('hidden', true);
        }
    }

    // set Tries
    MAX_TRIES = 0;
    for (var i = 0; i < SHEET_DATA[CURRENT_QUESTION].answers.length; i++) {
        if (SHEET_DATA[CURRENT_QUESTION].answers[i]) {
            MAX_TRIES++;
        }
    }
    MAX_TRIES--;
    TRIES = MAX_TRIES;

    console.log(MAX_TRIES);
}

// answer
function answerEvent(answerIndex) {
    if (TRIES > 0 && !SESSION[CURRENT_QUESTION].selections.includes(answerIndex) && !SESSION[CURRENT_QUESTION].correct) {
        if (SHEET_DATA[CURRENT_QUESTION].correctAnswers[answerIndex]) {
            if (AUDIO) {
                CORRECT.currentTime = 0;
                CORRECT.play();
            }
            SESSION[CURRENT_QUESTION].correct = true;
            SCORE++;
            ANSWERS[answerIndex].classList.toggle('correct', true);
        }
        else {
            if (AUDIO) {
                INCORRECT.currentTime = 0;
                INCORRECT.play();
            }
            ANSWERS[answerIndex].classList.toggle('incorrect', true);
        }
        SESSION[CURRENT_QUESTION].selections.push(answerIndex);
        TRIES--;

        if (TRIES <= 0) {
            // reveal correct answer
            for (var i = 0; i < SHEET_DATA[CURRENT_QUESTION].correctAnswers.length; i++) {
                if (SHEET_DATA[CURRENT_QUESTION].correctAnswers[i]) {
                    ANSWERS[i].classList.toggle('correct', true);
                }
            }
        }

        updateStatus();
    }
}

// audio controls
function toggleAudio() {
    AUDIO = !AUDIO;

    AUDIO_TOGGLE.innerText = AUDIO ? 'volume_up' : 'volume_off';
}

// User timeout after 60 seconds of inactivity
function debounce(callback, timeout, _this) {
    var timer;
    return function (e) {
        var _that = this;
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(function () {
            callback.call(_this || _that, e);
        }, timeout);
    }
}

// User timeout after 60 seconds of inactivity
var userAction = debounce(function (e) {
    console.log("silence");
    setStateStart();
}, 60 * 1000);

// User timeout after 60 seconds of inactivity
document.body.onload = () => {
    document.addEventListener("mousemove", userAction, false);
    document.addEventListener("click", userAction, false);
    document.addEventListener("scroll", userAction, false);
    document.addEventListener("keypress", userAction, false);
}