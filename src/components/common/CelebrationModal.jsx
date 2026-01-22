import React from 'react'
import { motion } from 'framer-motion'

const CelebrationModal = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-20 right-6 z-[70] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl max-w-sm"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.2, 1.2, 1.2, 1]
          }}
          transition={{ duration: 0.5 }}
          className="text-3xl"
        >
          ✨
        </motion.div>
        <p className="font-medium">{message}</p>
      </div>
    </motion.div>
  )
}

export default CelebrationModal