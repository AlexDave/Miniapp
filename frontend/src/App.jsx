import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import './App.css';

// Компонент для списка курсов
function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div>
      <h2>Курсы</h2>
      <ul>
        {courses && courses.length > 0 ? (
          courses.map(course => (
            <li key={course.id}>
              <Link to={`/course/${course.id}`}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
              </Link>
            </li>
          ))
        ) : (
          <p>Курсы не найдены или загрузка...</p>
        )}
      </ul>
    </div>
  );
  
}

// Компонент для отображения информации о курсе
function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке курса:', error);
      }
    }

    fetchCourse();
  }, [id]);

  const handleAddTrackToTracks = async (track) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/tracks`, {
        track,
        courseId: course.id,
      });
      alert('Трек добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении трека:', error);
    }
  };

  return (
    <div>
      {course ? (
        <>
          <h2>{course.title}</h2>
          <iframe
            width="560"
            height="315"
            src={course.videoUrl}
            title={course.title}
            frameBorder="0"
            allowFullScreen
          ></iframe>
          <p>{course.content}</p>
  
          <div>
            <h3>Треки курса</h3>
            <ul>
              {course.tracks && course.tracks.length > 0 ? (
                course.tracks.map(track => (
                  <li key={track.id}>
                    <h4>{track.title}</h4>
                    <p>{track.description}</p>
                    <button onClick={() => handleAddTrackToTracks(track)}>
                      Добавить трек в список
                    </button>
                  </li>
                ))
              ) : (
                <p>Треки не найдены или загрузка...</p>
              )}
            </ul>
          </div>
        </>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  );
  
}

// Компонент для отображения списка треков
function Tracks() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await axios.get('http://localhost:5000/api/tracks');
        setTracks(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке треков:', error);
      }
    }

    fetchTracks();
  }, []);

  const updateProgress = async (trackId, progress) => {
    try {
      const completed = progress >= 100; // Отметить выполненным, если прогресс достиг 100%
      await axios.put(`http://localhost:5000/api/tracks/${trackId}`, { progress, completed });

      // Обновляем список треков после изменения
      const updatedTracks = await axios.get('http://localhost:5000/api/tracks');
      setTracks(updatedTracks.data);
    } catch (error) {
      console.error('Ошибка при обновлении прогресса трека:', error);
    }
  };

  return (
    <div>
      <h2>Мои треки</h2>
      <ul>
        {tracks && tracks.length > 0 ? (
          tracks.map(track => (
            <li key={track.id} className={track.completed ? 'completed' : ''}>
              <h4>{track.title}</h4>
              <progress value={track.progress} max="100"></progress>
              <p>{track.progress}%</p>
  
              {!track.completed ? (
                <>
                  <button onClick={() => updateProgress(track.id, track.progress + 10)}>
                    Увеличить прогресс
                  </button>
                  <p>{track.progress < 100 ? 'Трек в процессе' : 'Трек выполнен!'}</p>
                </>
              ) : (
                <p>Трек выполнен!</p>
              )}
            </li>
          ))
        ) : (
          <p>Треки не найдены или загрузка...</p>
        )}
      </ul>
    </div>
  );
  
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Добро пожаловать в Mini App</h1>
          <nav>
            <Link to="/courses">📚 Курсы</Link>
            <Link to="/tracks">📅 Треки</Link>
            <Link to="/chat">💬 Чат</Link>
            <Link to="/profile">⚙️ Профиль</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Courses />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/chat" element={<div>Чат с кинологом</div>} />
            <Route path="/profile" element={<div>Профиль</div>} />
            <Route path="*" element={<div>Страница не найдена</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
