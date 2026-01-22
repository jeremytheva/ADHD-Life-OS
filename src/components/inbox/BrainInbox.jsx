import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { inboxService } from '../../services/inboxService'

const { FiInbox, FiPlus, FiCheck, FiArrowRight, FiTrash2, FiEdit3, FiTag, FiZap } = FiIcons

const BrainInbox = () => {
  const [mode, setMode] = useState('capture') // 'capture' or 'organize'
  const [items, setItems] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    if (mode === 'capture' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [mode])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await inboxService.getInboxItems()
      setItems(data)
    } catch (error) {
      console.error('Error loading inbox items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!currentInput.trim()) return

    try {
      const newItem = await inboxService.createInboxItem({
        content: currentInput.trim(),
        status: 'captured'
      })
      setItems(prev => [newItem, ...prev])
      setCurrentInput('')
      
      // Keep focus on input for rapid entry
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleDeleteItem = async (id) => {
    try {
      await inboxService.deleteInboxItem(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleStartEdit = (item) => {
    setEditingId(item.id)
    setEditText(item.content)
  }

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return

    try {
      const updated = await inboxService.updateInboxItem(id, {
        content: editText.trim()
      })
      setItems(prev => prev.map(item => item.id === id ? updated : item))
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleCategoryChange = async (id, category) => {
    try {
      const updated = await inboxService.updateInboxItem(id, { category })
      setItems(prev => prev.map(item => item.id === id ? updated : item))
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleConvertToTask = async (item) => {
    try {
      await inboxService.convertToTask(item.id)
      setItems(prev => prev.filter(i => i.id !== item.id))
    } catch (error) {
      console.error('Error converting to task:', error)
    }
  }

  const uncategorizedItems = items.filter(item => !item.category)
  const categorizedItems = items.filter(item => item.category)

  const categories = [
    { value: 'work', label: 'Work', color: 'blue', icon: '💼' },
    { value: 'home', label: 'Home', color: 'green', icon: '🏠' },
    { value: 'urgent', label: 'Urgent', color: 'red', icon: '🚨' },
    { value: 'personal', label: 'Personal', color: 'purple', icon: '✨' },
    { value: 'ideas', label: 'Ideas', color: 'yellow', icon: '💡' },
    { value: 'later', label: 'Later', color: 'slate', icon: '📅' }
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading your inbox...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiInbox} className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Brain Inbox</h1>
            <p className="text-slate-600">
              {mode === 'capture' 
                ? "Let's get everything out of your head! 🧠✨"
                : "Great! Now let's organize these thoughts 📋"
              }
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('capture')}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors
              ${mode === 'capture'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <SafeIcon icon={FiInbox} className="w-4 h-4" />
              <span>Capture Mode</span>
            </div>
          </button>
          <button
            onClick={() => setMode('organize')}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors
              ${mode === 'organize'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <SafeIcon icon={FiTag} className="w-4 h-4" />
              <span>Organize Mode</span>
            </div>
          </button>
        </div>

        {/* Stats */}
        {items.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="px-3 py-1 bg-white rounded-full">
              <span className="text-purple-600 font-medium">{items.length}</span>
              <span className="text-slate-600"> total items</span>
            </div>
            {uncategorizedItems.length > 0 && (
              <div className="px-3 py-1 bg-amber-100 rounded-full">
                <span className="text-amber-700 font-medium">{uncategorizedItems.length}</span>
                <span className="text-amber-600"> to organize</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Capture Mode */}
      {mode === 'capture' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Encouragement */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-800 text-center font-medium">
              💭 Don't worry about organizing yet – just jot down everything that comes to mind!
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAddItem} className="bg-white rounded-lg border-2 border-purple-300 p-4 shadow-md">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type anything... tasks, ideas, reminders, worries..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                autoFocus
              />
              <button
                type="submit"
                disabled={!currentInput.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
                <span className="font-medium">Add</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              💡 Pro tip: Press Enter to quickly add multiple items
            </p>
          </form>

          {/* Captured Items List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">
                  Your Brain Dump ({items.length} items)
                </h3>
                {items.length >= 3 && (
                  <div className="text-sm text-green-600 font-medium">
                    ✨ Awesome! Keep going!
                  </div>
                )}
              </div>

              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      
                      {editingId === item.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditText('')
                            }}
                            className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="text-slate-900">{item.content}</p>
                            {item.category && (
                              <div className="mt-2">
                                <span className={`
                                  px-2 py-1 rounded-full text-xs font-medium
                                  ${item.category === 'work' ? 'bg-blue-100 text-blue-700' : ''}
                                  ${item.category === 'home' ? 'bg-green-100 text-green-700' : ''}
                                  ${item.category === 'urgent' ? 'bg-red-100 text-red-700' : ''}
                                  ${item.category === 'personal' ? 'bg-purple-100 text-purple-700' : ''}
                                  ${item.category === 'ideas' ? 'bg-yellow-100 text-yellow-700' : ''}
                                  ${item.category === 'later' ? 'bg-slate-100 text-slate-700' : ''}
                                `}>
                                  {categories.find(c => c.value === item.category)?.icon} {item.category}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Encouragement to organize */}
              {items.length >= 5 && uncategorizedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200"
                >
                  <p className="text-green-800 text-center font-medium mb-3">
                    🎉 Awesome! Now we have your whole list!
                  </p>
                  <button
                    onClick={() => setMode('organize')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Ready to organize?</span>
                    <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiInbox} className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Your inbox is empty
              </h3>
              <p className="text-slate-600 mb-4">
                Start by typing the first thing that comes to mind! 💭
              </p>
              <div className="max-w-md mx-auto text-left space-y-2 text-sm text-slate-600">
                <p>✨ Quick ideas to get started:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tasks you've been putting off</li>
                  <li>Things you're worried about forgetting</li>
                  <li>Ideas you want to remember</li>
                  <li>Appointments to schedule</li>
                  <li>Random thoughts taking up brain space</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Organize Mode */}
      {mode === 'organize' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-800 text-center font-medium">
              📋 Now let's group related items together! Pick a category for each one.
            </p>
          </div>

          {/* Uncategorized Items */}
          {uncategorizedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-slate-900">
                To Organize ({uncategorizedItems.length} items)
              </h3>

              {uncategorizedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border-2 border-amber-300 p-4"
                >
                  <div className="mb-3">
                    <p className="text-slate-900 font-medium">{item.content}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategoryChange(item.id, cat.value)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all
                          bg-${cat.color}-100 text-${cat.color}-700 hover:bg-${cat.color}-200
                          flex items-center gap-2
                        `}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Categorized Items */}
          {categorizedItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">
                  Organized ({categorizedItems.length} items)
                </h3>
                <div className="text-sm text-green-600 font-medium">
                  ✅ Great job categorizing!
                </div>
              </div>

              {categories.map(cat => {
                const catItems = categorizedItems.filter(item => item.category === cat.value)
                if (catItems.length === 0) return null

                return (
                  <div key={cat.value} className="space-y-2">
                    <h4 className="text-md font-medium text-slate-700 flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label} ({catItems.length})</span>
                    </h4>

                    {catItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white rounded-lg border border-slate-200 p-4 ml-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-slate-900">{item.content}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleConvertToTask(item)}
                              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
                              title="Convert to task"
                            >
                              <SafeIcon icon={FiZap} className="w-3 h-3" />
                              <span>Task</span>
                            </button>
                            <button
                              onClick={() => handleCategoryChange(item.id, null)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Remove category"
                            >
                              <SafeIcon icon={FiTag} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {/* All Organized! */}
          {uncategorizedItems.length === 0 && categorizedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200 text-center"
            >
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Awesome work! Everything is organized!
              </h3>
              <p className="text-green-800 mb-4">
                You've successfully cleared your mental clutter and organized your thoughts. 
                Now you can convert these into actionable tasks!
              </p>
              <div className="text-sm text-green-700">
                💡 Tip: Click the "Task" button on any item to turn it into a full task
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-600 mb-4">
                No items to organize yet!
              </p>
              <button
                onClick={() => setMode('capture')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start Capturing
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default BrainInbox