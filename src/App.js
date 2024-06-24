import React, { useState } from 'react';
import _ from 'lodash';
import { Hand } from 'pokersolver';
import './styles.css'; // Import the CSS file

// Function to create a standard deck of 52 cards
function createDeck() {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
  const deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }

  return deck;
}

// Function to map card values and suits to image paths
function getCardImage(card) {
  const suitSymbols = {
    'Hearts': 'H',
    'Diamonds': 'D',
    'Clubs': 'C',
    'Spades': 'S',
  };
  const valueSymbols = {
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'Jack': 'J',
    'Queen': 'Q',
    'King': 'K',
    'Ace': 'A',
  };
  return `/cards/${valueSymbols[card.value]}${suitSymbols[card.suit]}.png`;
}

function App() {
  const [deck, setDeck] = useState(createDeck);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [boardCards, setBoardCards] = useState([]);
  const [showDealerCards, setShowDealerCards] = useState(false);
  const [showPlayerCards, setShowPlayerCards] = useState(false);
  const [flopShown, setFlopShown] = useState(false);
  const [turnShown, setTurnShown] = useState(false);
  const [result, setResult] = useState('');
  const [playerMoney, setPlayerMoney] = useState(500);
  const [currentPot, setCurrentPot] = useState(0);
  const [hasBet60, setHasBet60] = useState(false);
  const [hasBet40, setHasBet40] = useState(false);

  const shuffleAndDeal = () => {
    const shuffledDeck = _.shuffle(deck);
    setDeck(shuffledDeck);
    setDealerCards([shuffledDeck[0], shuffledDeck[1]]);
    setPlayerCards([shuffledDeck[2], shuffledDeck[3]]);
    setBoardCards(shuffledDeck.slice(4, 9));
    setShowDealerCards(false);
    setShowPlayerCards(false);
    setFlopShown(false);
    setTurnShown(false);
    setResult('');
    setCurrentPot(40);
    setPlayerMoney(playerMoney - 20);
    setHasBet60(false);
    setHasBet40(false);
  };

  const bet60 = () => {
    setCurrentPot((prevPot) => {
      const newPot = prevPot + 120; // Add 120 to the pot (60 from player + 60 from dealer)
      setPlayerMoney(playerMoney - 60);
      setHasBet60(true);
      revealAllCards(newPot);
      return newPot;
    });
  };

  const bet40 = () => {
    setCurrentPot((prevPot) => {
      const newPot = prevPot + 80; // Add 80 to the pot (40 from player + 40 from dealer)
      setPlayerMoney(playerMoney - 40);
      setHasBet40(true);
      revealAllCards(newPot);
      return newPot;
    });
  };

  const bet20 = () => {
    setCurrentPot((prevPot) => {
      const newPot = prevPot + 40; // Add 40 to the pot (20 from player + 20 from dealer)
      setPlayerMoney(playerMoney - 20);
      revealAllCards(newPot);
      return newPot;
    });
  };

  const revealAllCards = (pot) => {
    setFlopShown(true);
    setTurnShown(true);
    setShowDealerCards(true);
    determineWinner(pot);
  };

  const pass = () => {
    if (!flopShown) {
      setFlopShown(true);
    } else if (!turnShown) {
      setTurnShown(true);
    } else {
      setResult('You folded. Dealer wins!');
      setShowDealerCards(true);
    }
  };

  const determineWinner = (pot) => {
    const valueMap = {
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': 'T',
      'Jack': 'J',
      'Queen': 'Q',
      'King': 'K',
      'Ace': 'A',
    };
  
    const dealerHand = Hand.solve([...dealerCards, ...boardCards].map(card => `${valueMap[card.value]}${card.suit[0]}`));
    const playerHand = Hand.solve([...playerCards, ...boardCards].map(card => `${valueMap[card.value]}${card.suit[0]}`));
    const winner = Hand.winners([dealerHand, playerHand]);
  
    let resultMessage = `Dealer's best hand: ${dealerHand.descr}\nPlayer's best hand: ${playerHand.descr}\n\n`;
  
    if (winner.length > 1) {
      resultMessage += 'It\'s a tie!';
      setPlayerMoney((prevMoney) => prevMoney + pot / 2); // Return the player's bet
    } else if (winner[0] === dealerHand) {
      resultMessage += 'Dealer wins!';
    } else {
      resultMessage += 'Player wins!';
      setPlayerMoney((prevMoney) => prevMoney + pot); // Add the entire pot to the player's money
    }
  
    setResult(resultMessage);
  };

  return (
    <div>
      <h1>Poker Game</h1>
      <button onClick={shuffleAndDeal}>New Game</button>
      <p>Player Money: ${playerMoney}</p>
      <p>Current Pot: ${currentPot}</p>

      <h2>Dealer</h2>
      <div className="cards-container">
        <ul>
          {dealerCards.map((card, index) => (
            <li key={index}>
              {showDealerCards ? (
                <img src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} />
              ) : (
                <div className="hidden-card">Hidden</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <h2>Board</h2>
      <div className="cards-container">
        <ul>
          {boardCards.map((card, index) => (
            <li key={index}>
              {(flopShown && index < 3) || turnShown ? (
                <img src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} />
              ) : (
                <div className="hidden-card">Hidden</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <h2>Player</h2>
      <button onClick={() => setShowPlayerCards(!showPlayerCards)}>Show/Hide Player Cards</button>
      <div className="cards-container">
        <ul>
          {playerCards.map((card, index) => (
            <li key={index}>
              {showPlayerCards ? (
                <img src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} />
              ) : (
                <div className="hidden-card">Hidden</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={pass}>Pass</button>
      {!hasBet60 && !flopShown && <button onClick={bet60}>Bet 60</button>}
      {!hasBet40 && flopShown && !turnShown && <button onClick={bet40}>Bet 40</button>}
      {turnShown && !hasBet60 && !hasBet40 && <button onClick={bet20}>Bet 20</button>}

      <pre>{result}</pre>
    </div>
  );
}

export default App;