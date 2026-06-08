import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import { TabType } from '@/types/index'
import SnapshotCard from '@/components/SnapshotCard'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('contributions')
  const [subFilterKeyword, setSubFilterKeyword] = useState('')
  const [subFilterType, setSubFilterType] = useState<'all' | 'added' | 'approved'>('all')

  const {
    toggleLike,
    toggleBookmark,
    toggleSubscribe,
    isSubscribed,
    markSnapshotRead,
    markAllSubscriptionRead,
    getMyContributions,
    getMyBookmarks,
    getSubscribedCommunities,
    getSubscriptionSummary
  } = useAppStore()

  const myContributions = getMyContributions()
  const myBookmarks = getMyBookmarks()
  const subscribedCommunities = getSubscribedCommunities()
  const subscriptionSummary = getSubscriptionSummary()

  const tabLabels: { key: TabType; label: string; count: number }[] = [
    { key: 'contributions', label: '我的贡献', count: myContributions.length },
    { key: 'bookmarks', label: '我的收藏', count: myBookmarks.length },
    { key: 'subscriptions', label: '订阅更新', count: subscribedCommunities.length }
  ]

  const filteredSubCommunities = useMemo(() => {
    let result = subscribedCommunities
    if (subFilterKeyword) {
      const kw = subFilterKeyword.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(kw))
    }
    if (subFilterType !== 'all') {
      if (subFilterType === 'added') {
        result = result.filter(c => c.recentlyAdded.length > 0)
      } else if (subFilterType === 'approved') {
        result = result.filter(c => c.recentlyApproved.length > 0)
      }
    }
    return result
  }, [subscribedCommunities, subFilterKeyword, subFilterType])

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const handleCommunityClick = (communityId: string) => {
    Taro.navigateTo({ url: `/pages/topic/index?id=${communityId}` })
  }

  const handleSnapshotClick = (id: string) => {
    markSnapshotRead(id)
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  const handleSummaryClick = () => {
    Taro.navigateTo({ url: '/pages/updates/index?filter=unread' })
  }

  const handleUnsubscribe = (communityId: string, e?) => {
    if (e) e.stopPropagation()
    toggleSubscribe(communityId)
    Taro.showToast({ title: '已取消订阅', icon: 'none' })
  }

  const handleMarkAllRead = () => {
    markAllSubscriptionRead()
    Taro.showToast({ title: '全部已读', icon: 'success' })
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

      {subscriptionSummary.unreadUpdateCount > 0 && (
        <View className={styles.summaryBanner} onClick={handleSummaryClick}>
          <Text className={styles.summaryIcon}>🔔</Text>
          <Text className={styles.summaryText}>
            {subscriptionSummary.unreadUpdateCount}条未读更新
          </Text>
          <Text className={styles.summaryArrow}>查看 ›</Text>
        </View>
      )}

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
          <ScrollView scrollY className={styles.listWrap} style={{ height: 'calc(100vh - 500rpx)' }}>
            {subscriptionSummary.unreadUpdateCount > 0 && (
              <View className={styles.markAllRow} onClick={handleMarkAllRead}>
                <Text className={styles.markAllRowText}>全部标为已读</Text>
              </View>
            )}

            <View className={styles.subFilter}>
              <Input
                className={styles.subFilterInput}
                placeholder="搜索社区名"
                placeholderClass="subFilterPlaceholder"
                value={subFilterKeyword}
                onInput={(e) => setSubFilterKeyword(e.detail.value)}
              />
              <View className={styles.subFilterTabs}>
                {(['all', 'added', 'approved'] as const).map((type) => (
                  <View
                    key={type}
                    className={classnames(styles.subFilterTab, subFilterType === type && styles.subFilterTabActive)}
                    onClick={() => setSubFilterType(type)}
                  >
                    <Text className={classnames(styles.subFilterTabText, subFilterType === type && styles.subFilterTabTextActive)}>
                      {type === 'all' ? '全部' : type === 'added' ? '有新增' : '有通过'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {filteredSubCommunities.length > 0 ? filteredSubCommunities.map((community) => (
              <View
                key={community.id}
                className={styles.subCard}
                onClick={() => handleCommunityClick(community.id)}
              >
                <View className={styles.subCardHeader}>
                  <View className={styles.subCardTitleWrap}>
                    {community.unreadCount > 0 && <View className={styles.unreadDot} />}
                    <Text className={styles.subCardName}>{community.name}</Text>
                  </View>
                  <View className={styles.subCardActions}>
                    <View
                      className={styles.unsubscribeBtn}
                      onClick={(e) => handleUnsubscribe(community.id, e)}
                    >
                      <Text className={styles.unsubscribeBtnText}>取消订阅</Text>
                    </View>
                    <Text className={styles.subCardArrow}>›</Text>
                  </View>
                </View>
                <View className={styles.subCardMeta}>
                  <Text className={styles.subCardMetaText}>{community.district}</Text>
                  {community.noSnapshots ? (
                    <Text className={styles.subCardMetaText}>暂无快照</Text>
                  ) : (
                    <>
                      <Text className={styles.subCardMetaText}>{community.snapshotCount}个快照</Text>
                      {community.latestDate && <Text className={styles.subCardMetaText}>最新：{community.latestDate}</Text>}
                    </>
                  )}
                </View>

                {community.recentlyAdded.length > 0 && (
                  <View className={styles.subCardUpdates}>
                    <Text className={styles.subCardUpdatesLabel}>最近新增</Text>
                    {community.recentlyAdded.slice(0, 2).map((s) => (
                      <View
                        key={s.id}
                        className={styles.subCardUpdateItem}
                        onClick={(e) => { e.stopPropagation(); handleSnapshotClick(s.id) }}
                      >
                        <Text className={styles.subCardUpdateDot}>·</Text>
                        <Text className={styles.subCardUpdateText}>{s.title}</Text>
                        <Text className={styles.subCardUpdateStatus}>待审核</Text>
                      </View>
                    ))}
                  </View>
                )}

                {community.recentlyApproved.length > 0 && (
                  <View className={styles.subCardUpdates}>
                    <Text className={styles.subCardUpdatesLabelApproved}>最近通过</Text>
                    {community.recentlyApproved.slice(0, 2).map((s) => (
                      <View
                        key={s.id}
                        className={styles.subCardUpdateItem}
                        onClick={(e) => { e.stopPropagation(); handleSnapshotClick(s.id) }}
                      >
                        <Text className={styles.subCardUpdateDotApproved}>·</Text>
                        <Text className={styles.subCardUpdateText}>{s.title}</Text>
                        <Text className={styles.subCardUpdateStatusApproved}>已通过</Text>
                      </View>
                    ))}
                  </View>
                )}

                {community.recentlyAdded.length === 0 && community.recentlyApproved.length === 0 && !community.noSnapshots && (
                  <View className={styles.subCardNoUpdate}>
                    <Text className={styles.subCardNoUpdateText}>暂无近期更新</Text>
                  </View>
                )}
              </View>
            )) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📭</Text>
                <Text className={styles.emptyText}>无匹配的订阅社区</Text>
              </View>
            )}
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
