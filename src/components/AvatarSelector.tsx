import React, { useState } from 'react';
import { Camera, Crown, Lock, Award, TrendingUp, Medal } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarChange: (avatar: string) => void;
  userAchievements?: string[];
  premiumStatus?: 'none' | 'discount_25' | 'discount_50' | 'free_monthly';
}

// Default avatar for all free users
const defaultAvatar = '👤';

// Unlocked after 7-day discipline streak
const streakAvatars = {
  male: ['👨‍💼', '👨‍🚀', '👨‍💻', '👨‍🎯', '👨‍⚡'],
  female: ['👩‍💼', '👩‍🚀', '👩‍💻', '👩‍🎯', '👩‍⚡']
};

// Premium avatars for paying users
const premiumAvatars = [
  '🧑‍🎨', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍🌾', '👩‍🌾'
];

export default function AvatarSelector({ 
  selectedAvatar, 
  onAvatarChange, 
  userAchievements = [],
  premiumStatus = 'none'
}: AvatarSelectorProps) {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  
  const hasStreakAchievement = userAchievements.includes('week_streak');
  const hasGrowthMaster = userAchievements.includes('growth_master');
  const hasDisciplineKing = userAchievements.includes('discipline_king');
  const hasChampion = userAchievements.includes('champion');
  const isPremium = premiumStatus !== 'none';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onAvatarChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Avatar</h3>
        <p className="text-sm text-gray-600">
          Unlock more avatars by achieving milestones
        </p>
      </div>

      {/* Current Avatar Display */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl border-4 border-blue-200 relative">
            {selectedAvatar.startsWith('data:') ? (
              <img src={selectedAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              selectedAvatar
            )}
            
            {/* Achievement Badges */}
            {hasGrowthMaster && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
            )}
            {hasDisciplineKing && (
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
            {hasChampion && (
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Medal className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Status Display */}
      {premiumStatus !== 'none' && (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              {premiumStatus === 'free_monthly' && 'Champion - Free Monthly Access'}
              {premiumStatus === 'discount_50' && 'Discipline King - 50% Discount'}
              {premiumStatus === 'discount_25' && 'Growth Master - 25% Discount'}
            </span>
          </div>
        </div>
      )}

      {/* Premium Custom Upload */}
      {isPremium && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Premium Upload</span>
            </div>
          </div>
          <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
            <Camera className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Upload Custom Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Default Avatar (Always Available) */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <span>Default Avatar</span>
        </h4>
        <div className="flex justify-center">
          <button
            onClick={() => onAvatarChange(defaultAvatar)}
            className={`w-16 h-16 rounded-xl text-2xl flex items-center justify-center transition-all ${
              selectedAvatar === defaultAvatar
                ? 'bg-blue-100 border-2 border-blue-500 scale-110'
                : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            {defaultAvatar}
          </button>
        </div>
      </div>

      {/* Streak Achievement Avatars */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">7-Day Streak Avatars</h4>
          {hasStreakAchievement ? (
            <Award className="h-4 w-4 text-green-500" />
          ) : (
            <Lock className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          )}
        </div>
        
        {hasStreakAchievement ? (
          <>
            <div className="flex justify-center gap-4 mb-3">
              <button
                onClick={() => setSelectedGender('male')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedGender === 'male'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setSelectedGender('female')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedGender === 'female'
                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Female
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {streakAvatars[selectedGender].map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => onAvatarChange(avatar)}
                  className={`w-16 h-16 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-blue-100 border-2 border-blue-500 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Lock className="h-8 w-8 text-gray-500 dark:text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Maintain a 7-day discipline streak to unlock these avatars
            </p>
          </div>
        )}
      </div>

      {/* Premium Avatars */}
      {isPremium && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-600" />
            <h4 className="font-medium text-gray-900">Premium Collection</h4>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {premiumAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => onAvatarChange(avatar)}
                className={`w-12 h-12 rounded-lg text-xl flex items-center justify-center transition-all ${
                  selectedAvatar === avatar
                    ? 'bg-purple-100 border-2 border-purple-500 scale-110'
                    : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Avatar Unlock Progress</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {hasStreakAchievement ? (
                <Award className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              )}
              7-Day Streak Avatars
            </span>
            <span className={hasStreakAchievement ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {hasStreakAchievement ? 'Unlocked' : 'Locked'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {hasGrowthMaster ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              )}
              Growth Master Badge + 25% Discount
            </span>
            <span className={hasGrowthMaster ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {hasGrowthMaster ? 'Earned' : 'Locked'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {hasDisciplineKing ? (
                <Crown className="h-4 w-4 text-purple-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              )}
              Discipline King Badge + 50% Discount
            </span>
            <span className={hasDisciplineKing ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              {hasDisciplineKing ? 'Earned' : 'Locked'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {hasChampion ? (
                <Medal className="h-4 w-4 text-yellow-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              )}
              Champion Badge + Free Monthly Access
            </span>
            <span className={hasChampion ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
              {hasChampion ? 'Earned' : 'Locked'}
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt for Non-Premium Users */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="text-center">
            <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Want Premium Avatars?</h4>
            <p className="text-sm text-gray-600 mb-3">
              {premiumStatus === 'discount_50' && 'You have a 50% discount available!'}
              {premiumStatus === 'discount_25' && 'You have a 25% discount available!'}
              {premiumStatus === 'none' && 'Upgrade for custom photos and exclusive avatars'}
            </p>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                premiumStatus === 'discount_50' 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : premiumStatus === 'discount_25'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {premiumStatus === 'discount_50' && 'Upgrade with 50% Off'}
              {premiumStatus === 'discount_25' && 'Upgrade with 25% Off'}
              {premiumStatus === 'none' && 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}