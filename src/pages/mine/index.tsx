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
  const {
    toggleLike,
    toggleBookmark,
    getMyContributions,
    getMyBookmarks,
    getSubscribedCommunities
  } = useAppStore()

  const myContributions = getMyContributions()
  const myBookmarks = getMyBookmarks()
  const subscribedCommunities = getSubscribedCommunities()

  const tabLabels: { key: TabType; label: string; count: number }[] = [
    { key: 'contributions', label: '我的贡献', count: myContributions.length },
    { key: 'bookmarks', label: '我的收藏', count: myBookmarks.length },
    { key: 'subscriptions', label: '订阅更新', count: subscribedCommunities.length }
  ]

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const handleTopicClick = (communityName: string) => {
    Taro.navigateTo({ url: `/pages/topic/index?communityName=${encodeURIComponent(communityName)}` })
  }

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
          <Text className={styles.statNumber}>{subscribedCommunities.length}</Text>
          <Text className={styles.statLabel}>订阅</Text>
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
        subscribedCommunities.length > 0 ? (
          <View className={styles.listWrap}>
            {subscribedCommunities.map((community) => (
              <View
                key={community.id}
                className={styles.actionCard}
                onClick={() => handleTopicClick(community.name)}
              >
                <Text className={styles.actionIcon}>📖</Text>
                <View className={styles.actionInfo}>
                  <Text className={styles.actionTitle}>{community.name}</Text>
                  <Text className={styles.actionDesc}>最新快照：{community.latestDate}</Text>
                </View>
                <Text className={styles.actionArrow}>›</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>�</Text>
            <Text className={styles.emptyText}>暂无订阅社区</Text>
            <Text className={styles.emptyHint}>在地图索引或社区专题中订阅</Text>
          </View>
        )
      ) : activeTab === 'contributions' ? (
        myContributions.length > 0 ? (
          <View className={styles.listWrap}>
            {myContributions.map((snapshot) => (
              <SnapshotCard
                key={snapshot.id}
                snapshot={snapshot}
                onLike={toggleLike}
                onBookmark={toggleBookmark}
                onShare={handleShare}
                showStatus={true}
              />
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无贡献</Text>
            <Text className={styles.emptyHint}>提交快照或认领贡献来开始</Text>
          </View>
        )
      ) : myBookmarks.length > 0 ? (
        <View className={styles.listWrap}>
          {myBookmarks.map((snapshot) => (
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
          <Text className={styles.emptyText}>暂无收藏</Text>
        </View>
      )}
    </View>
  )
}

export default MinePage
