import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import { TabType } from '@/types/index'
import SnapshotCard from '@/components/SnapshotCard'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('contributions')
  const { snapshots, likedIds, bookmarkedIds, toggleLike, toggleBookmark } = useAppStore()

  const myContributions = snapshots
    .filter(s => s.contributorId === 'u_current' || s.contributorId === 'u1')
    .map(s => ({
      ...s,
      isLiked: likedIds.has(s.id),
      isBookmarked: bookmarkedIds.has(s.id)
    }))

  const myBookmarks = snapshots
    .filter(s => bookmarkedIds.has(s.id))
    .map(s => ({
      ...s,
      isLiked: likedIds.has(s.id),
      isBookmarked: true
    }))

  const tabLabels: { key: TabType; label: string }[] = [
    { key: 'contributions', label: '我的贡献' },
    { key: 'bookmarks', label: '我的收藏' },
    { key: 'subscriptions', label: '订阅更新' }
  ]

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const handleReviewClick = () => {
    Taro.navigateTo({ url: '/pages/review/index' })
  }

  const handleTopicClick = () => {
    Taro.navigateTo({ url: '/pages/topic/index' })
  }

  const currentList = activeTab === 'contributions'
    ? myContributions
    : activeTab === 'bookmarks'
    ? myBookmarks
    : []

  return (
    <View className={styles.container}>
      <View className={styles.profileHeader}>
        <View className={styles.avatar}><Text>👤</Text></View>
        <View className={styles.profileInfo}>
          <Text className={styles.nickname}>社区守护者</Text>
          <Text className={styles.profileDesc}>为社区记忆贡献一份力量</Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{myContributions.length}</Text>
          <Text className={styles.statLabel}>贡献</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{myBookmarks.length}</Text>
          <Text className={styles.statLabel}>收藏</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>3</Text>
          <Text className={styles.statLabel}>订阅</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>2</Text>
          <Text className={styles.statLabel}>审核</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabLabels.map((tab) => (
          <View
            key={tab.key}
            className={styles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={classnames(styles.tabText, activeTab === tab.key && styles.tabActive)}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View className={styles.tabIndicator} />}
          </View>
        ))}
      </View>

      {activeTab === 'subscriptions' ? (
        <View className={styles.listWrap}>
          <View className={styles.actionCard} onClick={handleTopicClick}>
            <Text className={styles.actionIcon}>📖</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>阳光花园社区</Text>
              <Text className={styles.actionDesc}>最新快照：2024-03-15</Text>
            </View>
            <Text className={styles.actionArrow}>›</Text>
          </View>
          <View className={styles.actionCard} onClick={handleTopicClick}>
            <Text className={styles.actionIcon}>📖</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>锦绣家园</Text>
              <Text className={styles.actionDesc}>最新快照：2024-06-10</Text>
            </View>
            <Text className={styles.actionArrow}>›</Text>
          </View>
          <View className={styles.actionCard} onClick={handleTopicClick}>
            <Text className={styles.actionIcon}>📖</Text>
            <View className={styles.actionInfo}>
              <Text className={styles.actionTitle}>银杏苑社区</Text>
              <Text className={styles.actionDesc}>最新快照：2024-04-05</Text>
            </View>
            <Text className={styles.actionArrow}>›</Text>
          </View>
        </View>
      ) : currentList.length > 0 ? (
        <View className={styles.listWrap}>
          {currentList.map((snapshot) => (
            <SnapshotCard
              key={snapshot.id}
              snapshot={snapshot}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
              onShare={handleShare}
            />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>暂无内容</Text>
        </View>
      )}
    </View>
  )
}

export default MinePage
