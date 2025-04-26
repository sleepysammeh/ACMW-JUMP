import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Question from './MCQ_Question.jsx';
import Choices from './MCQ_Choices.jsx';
import Submit from './MCQ_Submit.jsx';
import { mcq } from './B_MCQ_Data.js';
import { img, img2 } from './MCQ_Pics2.js';
import Guide from './MCQ_Guidebook.js';
import Pic from './MCQ_Images.js';
import Hint from './MCQ_Hint.js';
import DocumentationModal from './DocumentationModal.jsx';
import './MCQ.css';
import { db, updateDoc, doc, getDoc } from '../../firebase.js'; // Import Firestore functions
import { useUser } from '../../UserContext.js';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
let index = 0;
let score = 0;
let disableSubmitButton = false;
let powerUpCount = 0;
const quizID = 4; 

function B_MCQPage(props) {
  const [question, setQuestion] = useState(mcq.length > 0 && index < mcq.length ? mcq[index].question : '');
  const [choices, setChoices] = useState(mcq.length > 0 && index < mcq.length ? mcq[index].choices : []);
  const [images1, setImages1] = useState(img.length > 0 && index < mcq.length ? img[index].src : '');
  const [images2, setImages2] = useState(img2.length > 0 && index < mcq.length ? img2[index].src2 : '');
  const [hint, setHint] = useState(mcq.length > 0 && index < mcq.length ? mcq[index].hint : '');
  const [showHint, setShowHint] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [time, setTime] = useState(600);
  const [document, setDocument] = useState(true);
  const [showTimerMessage, setShowTimerMessage] = useState(false);
  const [destroyedChoice, setDestroyedChoice] = useState(null);
  const [showHackingEffect, setShowHackingEffect] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(true);
  const [powerups, setPowerups] = useState({
    bomb: true,
    asteroid: true,
    hacker: true,
  });
  const { userId } = useUser(); // Get userId from context
  const [quizPlayed, setQuizPlayed] = useState(false); // State to track if quiz has been played
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const checkQuizPlayed = async () => {
      if (userId) {
        try {
          const userRef = doc(db, 'et4s_main', userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const playedQuizzes = userDoc.data().hasPlayedQuizzes || {};
            setQuizPlayed(playedQuizzes[quizID] || false); // Check if the specific quiz is played
          }
        } catch (error) {
          console.error('Error checking quiz status:', error);
        }
      }
    };

    checkQuizPlayed();
  }, [userId, quizID]);


  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer);
          endQuizRoute();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  const checkAnswer = () => {
    if (disableSubmitButton) {
      return;
    }
    disableSubmitButton = true;

    if (selectedChoice === mcq[index].correctAnswer) {
      score++;
    }
    alert(`Correct Answer is : ${mcq[index].correctAnswer}`);
    handleChange();
  };

  const handleChange = () => {
    index += 1;
    if (index < mcq.length) {
      setQuestion(mcq[index].question);
      setChoices(mcq[index].choices);
      setImages1(img[index].src);
      setImages2(img2[index].src2);
      setHint(mcq[index].hint);
      setSelectedChoice('');
      setShowHint(false);
      setDestroyedChoice(null);
      disableSubmitButton = false;
    } else {
      endQuizRoute();
    }
  };

  const endQuizRoute = async (finalScore) => {
    console.log("score=" + score);
    try {
      if (userId) {
        const userRef = doc(db, 'et4s_main', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentTotalScore = parseInt(userData.totalscore, 10) || 0;
          const xp = parseInt(userData.xp, 10) || 0;
          const quizScores = userData.Quizscore || [];
          const totalQuestions = parseInt(userData.totalQuestions, 10) || 0;
          const hasPlayedQuizzes = userData.hasPlayedQuizzes || {};
  
          const totalCorrect = currentTotalScore + score;
          const XP = (score * 100) - (powerUpCount * 100);
          const newTotalQuestions = totalQuestions + mcq.length;
          const newAccuracy = totalQuestions ? (totalCorrect / newTotalQuestions) * 100 : 0; // Avoid division by zero
  
          quizScores.push(score); // Add the new score to the array
          hasPlayedQuizzes[quizID] = true; // Update the specific quiz ID to true
  
          await updateDoc(userRef, {
            totalscore: (currentTotalScore + score).toString(),
            Quizscore: quizScores,
            xp: xp + XP,
            accuracy: newAccuracy, // Update the accuracy in Firestore
            totalQuestions: newTotalQuestions, // Update total questions in Firestore
            hasPlayedQuizzes: hasPlayedQuizzes // Update the map with the quiz ID
          });
        }
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
    alert(`Quiz Ended! Your Score: ${score}`);

    resetQuiz();
  };

  const toggleHint = () => {
    setShowHint((prevShowHint) => !prevShowHint);
  };

  const resetQuiz = () => {
    index = 0;
    score = 0;
    powerUpCount = 0;
    props.handleEnding();
  };

  const handlePowerUp = () => {
    if (powerups.bomb) {
      setTime((prevTime) => prevTime + 15);
      setShowTimerMessage(true);
      setTimeout(() => setShowTimerMessage(false), 2000);
      setPowerups((prev) => ({ ...prev, bomb: false }));
      powerUpCount++;
    }
  };

  const handleStrikeOut = () => {
    if (powerups.asteroid) {
      const correctAnswer = mcq[index].correctAnswer;
      const incorrectChoices = choices.filter(choice => choice !== correctAnswer);
      const choiceToDestroy = incorrectChoices[Math.floor(Math.random() * incorrectChoices.length)];
      setDestroyedChoice(choiceToDestroy);
      powerUpCount++;
      setTimeout(() => {
        const remainingChoices = choices.filter(choice => choice !== choiceToDestroy);
        setChoices(remainingChoices);
        setDestroyedChoice(null);
      }, 1500);
      setPowerups((prev) => ({ ...prev, asteroid: false }));
    }
  };

  const handleSkipQuestion = () => {
    if (powerups.hacker) {
      setShowHackingEffect(true);
      setTimeout(() => {
        score++;
        handleChange();
        setShowHackingEffect(false);
      }, 2000);
      powerUpCount++;
      setPowerups((prev) => ({ ...prev, hacker: false }));
    }
  };

  const toggleDocumentation = () => {
    setShowDocumentation((prevDocument) => !prevDocument);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (quizPlayed) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
          background: `url('https://images.pexels.com/photos/2303101/pexels-photo-2303101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2') no-repeat center center`,
          backgroundSize: 'cover',
          color: '#fff',
          fontFamily: "'Space Mono', monospace",
          padding: '20px',
        }}
      >  
        <div>
          <h2 style={{
            fontSize: '3rem',
            marginBottom: '20px',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'
          }}>
            You've already completed this mission.
          </h2>
          <p style={{
            fontSize: '1.5rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            textShadow: '1px 1px 5px rgba(0, 0, 0, 0.7)'
          }}>
            You've already completed this mission.
          </p>
          <button
            onClick={() => navigate(location.state?.from || '/')}
            style={{
              marginTop: '30px',
              fontSize: '1.2rem',
              textDecoration: 'none',
              color: '#1e90ff',
              border: '2px solid #1e90ff',
              padding: '10px 20px',
              borderRadius: '5px',
              transition: 'background-color 0.3s, color 0.3s',
              display: 'inline-block',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1e90ff';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#1e90ff';
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="mainContent">
      <div className="Question">
      <div className="mainQuestion">
  <div>
    <span >{Math.min(mcq.length, index + 1)}/{mcq.length}</span>
  </div>
  <div className="justify-between items-center mb-4 text-white">

  <div className="text-left float-left">
    <span>📖Score: {score}</span>
  </div>
  <div className="text-center">
    <span>⌛Time Left: {formatTime(time)}</span>
    <DocumentationModal isOpen={showDocumentation} onClose={toggleDocumentation} />

    <AnimatePresence>
      {showTimerMessage && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0 }}
          className="absolute top-full right-0 text-green-500 font-bold"
        >
          +15 seconds!
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>
<div style={{
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '80%',
  padding: '10px'
}}>
  <motion.button
    onClick={handlePowerUp}
    className="powerups"
    whileHover={{ scale: powerups.bomb ? 1.1 : 1 }}
    whileTap={{ scale: powerups.bomb ? 0.9 : 1 }}
    style={{
      width: '150px',
      height: '60px',
      opacity: powerups.bomb ? 1 : 0.5,
      cursor: powerups.bomb ? 'pointer' : 'not-allowed',
      margin: '5px'
    }}
    id="powerups"
  >
    ⏰
  </motion.button>
  <motion.button
    onClick={handleStrikeOut}
    className="powerups"
    whileHover={{ scale: powerups.asteroid ? 1.1 : 1 }}
    whileTap={{ scale: powerups.asteroid ? 0.9 : 1 }}
    style={{
      width: '150px',
      height: '60px',
      opacity: powerups.asteroid ? 1 : 0.5,
      cursor: powerups.asteroid ? 'pointer' : 'not-allowed',
      margin: '5px'
    }}
    id="powerups"
  >
    💡
  </motion.button>
  <motion.button
    onClick={handleSkipQuestion}
    className="powerups"
    whileHover={{ scale: powerups.hacker ? 1.1 : 1 }}
    whileTap={{ scale: powerups.hacker ? 0.9 : 1 }}
    style={{
      width: '150px',
      height: '60px',
      opacity: powerups.hacker ? 1 : 0.5,
      cursor: powerups.hacker ? 'pointer' : 'not-allowed',
      margin: '5px'
    }}
    id="powerups"
  >
    🛠
  </motion.button>
  <motion.button
    className="powerups"
    onClick={toggleDocumentation}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    style={{
      width: '150px',
      height: '60px',
      margin: '5px'
    }}
    id="powerups"
  >
    ❓
  </motion.button>
</div>

<Question question={question} />
<Choices
  choices={choices}
  onChoiceSelect={handleChoiceSelect}
  destroyedChoice={destroyedChoice}
/>
        <br />
        <br />
        {showHint && <Hint text={hint} />}
        <br />
        </div>
        <Pic images1={images1} images2={images2} />
        <Submit onClick={checkAnswer} disabled={disableSubmitButton} />
      </div>
      
      {showHackingEffect && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'lime',
          fontSize: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div>HACKING IN PROGRESS...THE CORRECT ANSWER IS : {mcq[index].correctAnswer}</div>
          <div style={{ marginTop: '20px' }}>+1 POINT</div>
        </div>
      )}
    </div>
  );
}

export default B_MCQPage;