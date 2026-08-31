import React from 'react';

const Dashboard = ({ user }) => {
  const stats = [
    { label: 'Weight', value: `${user.weight} kg`, icon: '⚖️' },
    { label: 'Height', value: `${user.height} cm`, icon: '📏' },
    { label: 'Age', value: `${user.age} years`, icon: '🎂' }
  ];

  const bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
  stats.push({ label: 'BMI', value: bmi, icon: '💪' });

  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Hello, {user.username}! 👋</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500 transition-colors"
          >
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
            <p className="text-2xl mt-2">{stat.icon}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Quick Stats</h2>
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-gray-300 mb-2">Keep tracking your progress regular and achieve your fitness goals! 💯</p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mt-4">
            <li>Log your daily workouts</li>
            <li>Monitor your weight changes</li>
            <li>Follow your diet plan</li>
            <li>Stay hydrated and consistent</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;