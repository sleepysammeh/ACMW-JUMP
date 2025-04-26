import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
// import { TouchBackend } from 'react-dnd-touch-backend';
import Question from './dnd_Questions';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, updateDoc, doc, getDoc } from '../../firebase';
import { useUser } from '../../UserContext';
import './dnd_Quiz.css';
import './dnd_styles.css';

let powerUpCount = 0 ;
let index=0;
const questions = [
  {
    id: 1,
    text: 'Which constellation is a dragon and is visible year-round?',
    options: [
      { type: 'image', src: './DND_pics/A_dndimg1a.jpg', alt: 'Andromeda' },
      { type: 'image', src: './DND_pics/A_dndimg1b.jpg', alt: 'Draco' },
      { type: 'image', src: './DND_pics/A_dndimg1c.jpg', alt: 'Leo' },
      { type: 'image', src: './DND_pics/A_dndimg1d.jpg', alt: 'Orion' },
      { type: 'image', src: './DND_pics/A_dndimg1e.jpg', alt: 'Sagittarius' }
    ],
    answer: 'Draco'
  },
  { 
    id: 2,
    text: 'Which constellation is one of the most famous animal zodiacs?',
    options: [
      { type: 'image', src: './DND_pics/A_dndimg1a.jpg', alt: 'Andromeda' },
      { type: 'image', src: './DND_pics/A_dndimg1b.jpg', alt: 'Draco' },
      { type: 'image', src: './DND_pics/A_dndimg1c.jpg', alt: 'Leo' },
      { type: 'image', src: './DND_pics/A_dndimg1d.jpg', alt: 'Orion' },
      { type: 'image', src: './DND_pics/A_dndimg1e.jpg', alt: 'Sagittarius' }
    ],
    answer: 'Leo'
  },
  { 
    id: 3,
    text: 'Which constellation has the closest galaxy to ours?',
    options: [
      { type: 'image', src: './DND_pics/A_dndimg1a.jpg', alt: 'Andromeda' },
      { type: 'image', src: './DND_pics/A_dndimg1b.jpg', alt: 'Draco' },
      { type: 'image', src: './DND_pics/A_dndimg1c.jpg', alt: 'Leo' },
      { type: 'image', src: './DND_pics/A_dndimg1d.jpg', alt: 'Orion' },
      { type: 'image', src: './DND_pics/A_dndimg1e.jpg', alt: 'Sagittarius' }
    ],
    answer: 'Andromeda'
  },
  { 
    id: 4,
    text: 'Which constellation has the center of the Milky-Way and is an archer?',
    options: [
      { type: 'image', src: './DND_pics/A_dndimg1a.jpg', alt: 'Andromeda' },
      { type: 'image', src: './DND_pics/A_dndimg1b.jpg', alt: 'Draco' },
      { type: 'image', src: './DND_pics/A_dndimg1c.jpg', alt: 'Leo' },
      { type: 'image', src: './DND_pics/A_dndimg1d.jpg', alt: 'Orion' },
      { type: 'image', src: './DND_pics/A_dndimg1e.jpg', alt: 'Sagittarius' }
    ],
    answer: 'Sagittarius'
  },
  {
    id: 5,
    text: 'Which cosntellation is also called "The Hunter"?',
    options: [
      { type: 'image', src: './DND_pics/A_dndimg1a.jpg', alt: 'Andromeda' },
      { type: 'image', src: './DND_pics/A_dndimg1b.jpg', alt: 'Draco' },
      { type: 'image', src: './DND_pics/A_dndimg1c.jpg', alt: 'Leo' },
      { type: 'image', src: './DND_pics/A_dndimg1d.jpg', alt: 'Orion' },
      { type: 'image', src: './DND_pics/A_dndimg1e.jpg', alt: 'Sagittarius' }
    ],
    answer: 'Orion'
  }
];

let score = 0;
const quizID = 1;
const B_DndPage = (props) => {
  const { userId } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // Set initial time (e.g., 300 seconds for 5 minutes)
  const [quizPlayed, setQuizPlayed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to get the current location
  const [dialogOpen, setDialogOpen] = useState(true);
  const [hackUsed , setHackUsed]= useState(false);


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
    if (quizPlayed) return; // Stop timer if quiz is already played

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      endQuiz(score);
    }
  }, [timeLeft, quizPlayed]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSubmission = (isCorrect) => {
    if (isCorrect) score++;
    if(index<questions.length){
    alert(`correct answer is : ${questions[index].answer}`);}
    index++;
    if (index < questions.length) {
      setCurrentQuestionIndex(index);
    } else {
      endQuizRoute(score);
    }
  };

  const endQuizRoute = async (finalScore) => {
    if (index < questions.length) {
      setCurrentQuestionIndex(index);
    } else {
      endQuiz(score);
      document.getElementById("submit").disabled = true;
    }
  };

  const endQuiz = async (finalScore) => {
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
          const hasPlayedQuizzes = userData.hasPlayedQuizzes || {};
          const totalQuestions = parseInt(userData.totalQuestions, 10) || 0;
          const totalCorrect = currentTotalScore + score;
          const XP = (score * 100) - (powerUpCount * 100);
          const newTotalQuestions = totalQuestions + questions.length;
          const newAccuracy = (newTotalQuestions > 0) ? (totalCorrect / newTotalQuestions) * 100 : 0;
  
          quizScores.push(finalScore); // Add the new score to the array
          hasPlayedQuizzes[quizID] = true; // Update the specific quiz ID to true
          index = 0;
          await updateDoc(userRef, {
            totalscore: (currentTotalScore + finalScore).toString(),
            Quizscore: quizScores,
            xp: xp + XP,
            accuracy: newAccuracy,
            totalQuestions: newTotalQuestions,
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
  

  const resetQuiz = () => {
    score = 0;
    props.handleEnding();
  };

  const handlePowerUp = () => {
    powerUpCount++;
    const correctAnswer = questions[currentQuestionIndex].answer;
    const currentOptions = questions[currentQuestionIndex].options;
    const incorrectOptions = currentOptions.filter(option => {
      if (typeof option === 'object') {
        return option.alt !== correctAnswer;
      } else {
        return option !== correctAnswer;
      }
    });
    
    if (incorrectOptions.length > 0) {
      const remainingOptions = currentOptions.filter(option => {
        if (typeof option === 'object') {
          return option.alt === correctAnswer || option.alt !== incorrectOptions[0].alt;
        } else {
          return option === correctAnswer || option !== incorrectOptions[0];
        }
      });

      questions[currentQuestionIndex].options = remainingOptions;
    }
  };

  if (quizPlayed) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        background: `url('https://images.pexels.com/photos/2303101/pexels-photo-2303101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2') no-repeat center center`,
        backgroundSize: 'cover',
        color: '#fff',
        fontFamily: `'Space Mono', monospace`,
        padding: '20px'
      }}>
        <div>
          <h2 style={{
            fontSize: '3rem',
            marginBottom: '20px',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'
          }}>
            You've cannot attempt this mission again.
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
    <div className="quiz">
      <h3>{Math.min(questions.length, index + 1)}/{questions.length}</h3>
        <p>📖 Score: {score}</p>
        <div style={{ position: 'relative' }}>
          <p>⌛ Time Left: {formatTime(timeLeft)}</p>
      </div>
      <Question
        key={currentQuestionIndex}
        question={questions[currentQuestionIndex]}
        onSubmit={handleAnswerSubmission}
        hackUsed={hackUsed}
        setHackUsed={setHackUsed}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}     
      />
      {/* Add similar button here if needed */}
    </div>
  );
};

export default B_DndPage;