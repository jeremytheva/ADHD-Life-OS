import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { gamificationService } from '../../services/gamificationService'

const { FiX, FiShoppingCart, FiCheck, FiLock, FiStar, FiZap, FiGift } = FiIcons

const RewardShop = ({ onClose }) => {
  const [rewards, setRewards] = useState([])
  const [currency, setCurrency] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [purchaseSuccess, setPurchaseSuccess] = useState(null)

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = () => {
    const availableRewards = gamificationService.getAvailableRewards()
    const currencyData = gamificationService.getCurrency()
    setRewards(availableRewards)
    setCurrency(currencyData)
  }

  const handlePurchase = (rewardId) => {
    const result = gamificationService.purchaseReward(rewardId)
    
    if (result.success) {
      setPurchaseSuccess(result)
      loadRewards()
      
      setTimeout(() => {
        setPurchaseSuccess(null)
      }, 3000)
    } else {
      alert(result.message)
    }
  }

  const categories = [
    { id: 'all', label: 'All', icon: FiShoppingCart },
    { id: 'appearance', label: 'Appearance', icon: FiStar },
    { id: 'boost', label: 'Boosts', icon: FiZap },
    { id: 'break', label: 'Breaks', icon: FiGift }
  ]

  const filteredRewards = selectedCategory === 'all'
    ? rewards
    : rewards.filter(r => r.category === selectedCategory)

  if (!currency) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiShoppingCart} className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Reward Shop</h2>
                <p className="text-yellow-100">Spend your hard-earned coins!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Currency Display */}
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-100 mb-1">Your Balance</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  💰 {currency.coins} coins
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-yellow-100">Lifetime Earned</div>
                <div className="text-lg font-medium">{currency.lifetime_coins_earned}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-3 transition-colors ${
                selectedCategory === cat.id
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SafeIcon icon={cat.icon} className="w-4 h-4" />
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg border-2 p-4 ${
                  reward.purchased
                    ? 'bg-green-50 border-green-300'
                    : reward.affordable
                    ? 'bg-white border-slate-200 hover:border-yellow-400 hover:shadow-lg'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                } transition-all`}
              >
                {/* Reward Icon */}
                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">{reward.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-1">{reward.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">{reward.description}</p>
                </div>

                {/* Cost & Purchase */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-yellow-600 font-bold">
                    💰 {reward.cost}
                  </div>
                  
                  {reward.purchased ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <SafeIcon icon={FiCheck} className="w-4 h-4" />
                      Owned
                    </div>
                  ) : reward.affordable ? (
                    <button
                      onClick={() => handlePurchase(reward.id)}
                      className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                    >
                      Buy Now
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <SafeIcon icon={FiLock} className="w-4 h-4" />
                      Locked
                    </div>
                  )}
                </div>

                {/* Not Affordable Warning */}
                {!reward.affordable && !reward.purchased && (
                  <div className="mt-2 text-xs text-slate-500 text-center">
                    Need {reward.cost - currency.coins} more coins
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No rewards in this category</p>
            </div>
          )}
        </div>

        {/* Purchase Success Notification */}
        <AnimatePresence>
          {purchaseSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl z-[70]"
            >
              <div className="flex items-center gap-3">
                <SafeIcon icon={FiCheck} className="w-6 h-6" />
                <div>
                  <div className="font-bold">{purchaseSuccess.message}</div>
                  <div className="text-sm text-green-100">
                    {purchaseSuccess.remaining_coins} coins remaining
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default RewardShop