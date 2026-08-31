import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/exercises`);
        setExercises(response.data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch exercises');
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        Loading exercises...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Exercises 💪</h2>
      {exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div 
              key={ex._id || ex.name} 
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-cyan-500 transition-colors"
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-2">{ex.name}</h3>
              <p className="text-gray-300 text-sm mb-2">{ex.description}</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider">{ex.category}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">No exercises found. Add some in MongoDB!</p>
      )}
    </div>
  );
}

export default ExerciseList;