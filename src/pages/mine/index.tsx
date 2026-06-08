import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore, getCommunityById } from '@/store/useAppStore'
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

  const handleCommunityClick = (communityId: string) => {
    Taro.navigateTo({ url: `/pages/topic/index?id=${communityId}` })
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
          <ScrollView scrollY className={styles.listWrap} style={{ height: 'calc(100vh - 440rpx)' }}>
            {subscribedCommunities.map((community) => (
              <View
                key={community.id}
                className={styles.subCard}
                onClick={() => handleCommunityClick(community.id)}
              >
                <View className={styles.subCardHeader}>
                  <Text className={styles.subCardName}>{community.name}</Text>
                  <Text className={styles.subCardArrow}>›</Text>
                </View>
                <View className={styles.subCardMeta}>
                  <Text className={styles.subCardMetaText}>{community.district}</Text>
                  <Text className={styles.subCardMetaText}>{community.snapshotCount}个快照</Text>
                  {community.latestDate && (
                    <Text className={styles.subCardMetaText}>最新：{community.latestDate}</Text>
                  )}
                </View>
                {community.recentlyApproved.length > 0 && (
                  <View className={styles.subCardUpdates}>
                    <Text className={styles.subCardUpdatesLabel}>最近通过</Text>
                    {community.recentlyApproved.slice(0, 2).map((s) => (
                      <View key={s.id} className={styles.subCardUpdateItem}>
                        <Text className={styles.subCardUpdateDot}>·</Text>
                        <Text className={styles.subCardUpdateText}>{s.title}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无订阅社区</Text>
            <Text className={styles.emptyHint}>在地图索引或社区专题中订阅</Text>
          </View>
        )
      ) : activeTab === 'contributions' ? (
        myContributions.length > 0 ? (
          <ScrollView scrollY className={styles.listWrap} style={{ height: 'calc(100vh - 440rpx)' }}>
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
          </ScrollView>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无贡献</Text>
            <Text className={styles.emptyHint}>提交快照或认领贡献来开始</Text>
          </View>
        )
      ) : myBookmarks.length > 0 ? (
        <ScrollView scrollY className={styles.listWrap} style={{ height: 'calc(100vh - 440rpx)' }}>
          {myBookmarks.map((snapshot) => (
            <SnapshotCard
              key={snapshot.id}
              snapshot={snapshot}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
              onShare={handleShare}
            />
          ))}
        </ScrollView>
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
