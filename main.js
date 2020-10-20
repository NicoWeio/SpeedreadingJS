var userWPM = 120;
var wordIndex = 0;
var words = [];

function getText() {
  return "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
}

function split_into_words(text) {
  return text.split(' ');
}

function wpm() {
  // TODO implement slow start here…
  return userWPM;
}

function sleep_duration() {
  // 1000/(wpm()/60)
  return (60 * 1000) / wpm();
}

function time_remaining() {
  return sleep_duration() * (words.length - wordIndex) / 1000;
}

function clear() {
  process.stdout.write("\r\033[K"); // erase line
  process.stdout.write("\r\033[A"); // cursor up
  process.stdout.write("\r\033[K"); // erase line
  process.stdout.write("\r\033[A"); // cursor up
}

function display(word, info) {
  clear();
  const paddingCaret = 10;
  let paddingWord = paddingCaret - (word.length / 2) + 1;

  let pointer = ' '.repeat(paddingCaret) + "⌄" + "\n"
  process.stdout.write("\033[31;1m" + pointer + "\033[0m");
  process.stdout.write(' '.repeat(paddingWord) + word);
  process.stdout.write("\n");
  process.stdout.write(info);
}

async function main() {
  init_keyboard();
  process.stdout.write("\033[?25l"); //disable cursor
  console.log("–\n–");
  words = split_into_words(getText());

  while (wordIndex < words.length) {
    let word = words[wordIndex];
    display(word, `${wordIndex+1}/${words.length} | WPM: ${wpm()} | Remaining: ${Math.floor(time_remaining())}s`);
    await sleep(sleep_duration());
    wordIndex++;
  }
  quit(true); //TODO
}

function init_keyboard() {
  if (!process.stdin.isTTY) {
    console.warn("No TTY – keyboard shortcuts won't work.");
    return;
  }

  // without this, we would only get streams once enter is pressed
  process.stdin.setRawMode(true);

  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  process.stdin.resume();

  // i don't want binary, do you?
  process.stdin.setEncoding('utf8');

  // on any data into stdin
  process.stdin.on('data', function(key) {
    // ctrl-c ( end of text )
    if (key === '\u0003') {
      quit(true);
    }

    const KEYS = {
      "\u001b[A": 'up',
      "\u001b[B": 'down',
      // "\u001b[C": '?',
      // "\u001b[D": '?',
    };
    let keyCommand = KEYS[key];
    if (keyCommand) {
      onKeyPressed(keyCommand);
    } else {
      console.log(JSON.stringify(key));
    }
  });
}

function onKeyPressed(key) {
  switch (key) {
    case 'up':
      {
        userWPM += 10;
        break;
      }
    case 'down':
      {
        userWPM -= 10;
        break;
      }
  }
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function quit(force) {
  process.stdout.write("\n");
  process.stdout.write("\033[?25h"); //re-enable cursor
  if (force) {
    process.exit();
  }
}

main();
