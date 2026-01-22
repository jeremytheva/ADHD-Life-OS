import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiUser, FiBriefcase, FiHeart, FiSmile, FiAlertCircle, FiCheck } = FiIcons;

const ProfileSelector = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();

  const profiles = [
    {
      email: 'adult@example.com',
      name: 'Adult User',
      description: 'General ADHD management',
      icon: FiUser,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      email: 'work@example.com',
      name: 'Workplace User',
      description: 'Professional environment focus',
      icon: FiBriefcase,
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      email: 'parent@example.com',
      name: 'Parent User',
      description: 'Family & childcare routines',
      icon: FiHeart,
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      email: 'teen@example.com',
      name: 'Teen User',
      description: 'Student life & homework',
      icon: FiSmile,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const handleProfileSelect = async (email) => {
    setError('');
    setLoading(true);

    try {
      await signIn(email, 'password123');
    } catch (err) {
      setError(`Failed to switch to ${email}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentUserEmail = user?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-gray-900 mb-3"
          >
            ADHD Life-OS
          </motion.h1>
          <p className="text-xl text-gray-600 mb-2">Testing Mode - No Backend Required</p>
          <p className="text-sm text-gray-500">Select a profile to explore different user scenarios</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 max-w-2xl mx-auto"
          >
            <SafeIcon icon={FiAlertCircle} className="flex-shrink-0 text-xl" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {profiles.map((profile, index) => {
            const isActive = currentUserEmail === profile.email;
            
            return (
              <motion.button
                key={profile.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleProfileSelect(profile.email)}
                disabled={loading || isActive}
                className={`
                  relative p-6 rounded-2xl text-left transition-all duration-300
                  ${isActive 
                    ? 'bg-white shadow-xl ring-2 ring-offset-2 ring-' + profile.color + '-500' 
                    : 'bg-white hover:shadow-lg hover:scale-105 shadow-md'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  group
                `}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-2 -right-2 bg-gradient-to-br ${profile.gradient} text-white rounded-full p-2 shadow-lg`}
                  >
                    <SafeIcon icon={FiCheck} className="text-lg" />
                  </motion.div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`
                    p-4 rounded-xl bg-gradient-to-br ${profile.gradient} 
                    group-hover:scale-110 transition-transform duration-300
                    shadow-lg
                  `}>
                    <SafeIcon icon={profile.icon} className="text-2xl text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {profile.description}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {profile.email}
                    </p>
                  </div>
                </div>

                {loading && (
                  <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-md max-w-2xl mx-auto"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <SafeIcon icon={FiAlertCircle} className="text-blue-500" />
            Testing Mode Information
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ <strong>No backend required</strong> - Works entirely in your browser</p>
            <p>• Each profile has a unique user ID for testing</p>
            <p>• Switch between profiles instantly</p>
            <p>• Authentication state persists using localStorage</p>
            <p>• Data will be stored when Supabase is configured</p>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Mock Authentication - Testing Mode Only
        </p>
      </motion.div>
    </div>
  );
};

export default ProfileSelector;