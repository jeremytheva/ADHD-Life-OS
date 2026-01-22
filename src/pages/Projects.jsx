import React from 'react'
import { motion } from 'framer-motion'
import ProjectsList from '../components/projects/ProjectsList'

const Projects = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <ProjectsList />
      </motion.div>
    </div>
  )
}

export default Projects