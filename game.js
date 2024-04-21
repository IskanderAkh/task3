const Table = require('cli-table');
const crypto = require('crypto');

class RandomGenerator {
    static generateKey(length) {
        return crypto.randomBytes(Math.ceil(length / 8)).toString('hex');
    }
}

class HMACGenerator {
    static generateHMAC(key, message) {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(message);
        return hmac.digest('hex');
    }
}

class Rules {
    constructor(choices) {
        this.choices = choices;
        this.table = this.generateTable(choices);
    }

    generateTable(choices) {
        const table = [['\\', ...choices]];
        for (let i = 0; i < choices.length; i++) {
            const row = [choices[i]];
            for (let j = 0; j < choices.length; j++) {
                if (i === j) {
                    row.push('Draw');
                } else if ((j - i + choices.length) % choices.length <= choices.length / 2) {
                    row.push('Win');
                } else {
                    row.push('Lose');
                }
            }
            table.push(row);
        }
        return table;
    }

    getWinner(player1, player2) {
        const idx1 = this.choices.indexOf(player1);
        const idx2 = this.choices.indexOf(player2);
        const length = this.choices.length;
        if (idx1 === idx2) {
            return "It's a draw!";
        } else if ((idx2 - idx1 + length) % length <= length / 2) {
            return 'Computer wins!';
        } else {
            return 'Player 1 wins!';
        }
    }
}

class Menu {
    constructor(choices) {
        this.choices = choices;
    }

    showMenu() {
        console.log('Available moves:');
        this.choices.forEach((choice, index) => {
            console.log(`${index + 1} - ${choice}`);
        });
        console.log('0 - exit');
        console.log('? - help');
    }

    showHelp(rules) {
        console.log('Rules:');
        const tableRows = rules.table.map((row, index) => [index === 0 ? 'v PC\\User >' : rules.choices[index - 1], ...row.slice(1)]);

        let table = new Table({

            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                'right': '║', 'right-mid': '╢', 'middle': '│'
            }
        });
        tableRows.forEach(row => table.push(row));
        console.log(table.toString());
    }

    getUserInput() {
        const readline = require('readline-sync');
        return readline.question('Enter your move: ');
    }
}

if (process.argv.length < 4 || process.argv.length % 2 === 0) {
    console.log("Please provide an odd number of unique choices (>= 3) as command-line arguments.");
    console.log("Example: node game.js rock paper scissors lizard Spock");
    process.exit(1);
} else {
    const choices = process.argv.slice(2);
    let randomKey, player1Move, computerMove, hmac;

    const rules = new Rules(choices);
    const menu = new Menu(choices);

    menu.showMenu();
    let userInput;
    do {
        randomKey = RandomGenerator.generateKey(256);
        computerMove = choices[Math.floor(Math.random() * choices.length)];
        hmac = HMACGenerator.generateHMAC(randomKey, computerMove);
        console.log(`HMAC: ${hmac}`);

        userInput = menu.getUserInput();
        if (userInput === '?') {
            menu.showHelp(rules);
        } else if (!isNaN(userInput) && userInput >= 1 && userInput <= choices.length) {
            player1Move = choices[userInput - 1];
            console.log(`Your move: ${player1Move}`);
            console.log(`Computer move: ${computerMove}`);
            const result = rules.getWinner(player1Move, computerMove);
            if (result === "Player 1 wins!") {
                console.log(result);
            } else if (result === "Computer wins!") {
                console.log(result);
            } else {
                console.log("It's a draw!");
            }
            console.log(`HMAC key: ${randomKey}`);
        } else if (userInput !== '0') {
            console.log('Invalid input! Please enter a valid move or type "?" for help.');
        }
    } while (userInput !== '0');
}

