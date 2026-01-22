import React from 'react'
import { motion } from 'framer-motion'
import HomeModeTaskContainer from '../components/housework/HomeModeTaskContainer'

const Housework = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <HomeModeTaskContainer />
      </motion.div>
    </div>
  )
}

export default Housework