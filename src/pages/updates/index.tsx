import React, { useState, useMemo, useEffect, useRef } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore, UpdateItem } from '@/store/useAppStore'
import styles from './index.module.scss'

type FilterType = 'all' | 'added' | 'approved'
type ReadFilter = 'all' | 'unread' | 'read'

const UpdatesPage: React.FC = () => {
  const {
    getSubscriptionUpdates,
    markSnapshotRead,
    markAllSubscriptionRead,
    getSubscriptionSummary,
    toggleSubscribe,
    isSubscribed
  } = useAppStore()

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [readFilter, setReadFilter] = useState<ReadFilter>('unread')
  const [keyword, setKeyword] = useState('')
  const scrollTop = useRef(0)

  const updates = getSubscriptionUpdates()
  const summary = getSubscriptionSummary()

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.filter === 'unread') {
      setReadFilter('unread')
    }
  }, [])

  const filteredUpdates = useMemo(() => {
    let result = updates
    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(u => u.communityName.toLowerCase().includes(kw) || u.title.toLowerCase().includes(kw))
    }
    if (filterType !== 'all') {
      result = result.filter(u => u.type === filterType)
    }
    if (readFilter === 'unread') {
      result = result.filter(u => !u.isRead)
    } else if (readFilter === 'read') {
      result = result.filter(u => u.isRead)
    }
    return result
  }, [updates, keyword, filterType, readFilter])

  const handleUpdateClick = (update: UpdateItem) => {
    markSnapshotRead(update.snapshotId)
    Taro.navigateTo({ url: `/pages/detail/index?id=${update.snapshotId}` })
  }

  const handleMarkAllRead = () => {
    markAllSubscriptionRead()
    Taro.showToast({ title: '全部已读', icon: 'success' })
  }

  const handleUnsubscribe = (communityId: string, e?) => {
    if (e) e.stopPropagation()
    toggleSubscribe(communityId)
    Taro.showToast({ title: '已取消订阅', icon: 'none' })
  }

  const handleScroll = (e) => {
    scrollTop.current = e.detail.scrollTop
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.headerTitle}>订阅动态</Text>
          {summary.unreadUpdateCount > 0 && (
            <View className={styles.markAllBtn} onClick={handleMarkAllRead}>
              <Text className={styles.markAllText}>全部已读</Text>
            </View>
          )}
        </View>
        {summary.unreadUpdateCount > 0 && (
          <Text className={styles.unreadHint}>{summary.unreadUpdateCount}条未读</Text>
        )}
      </View>

      <View className={styles.filterBar}>
        <Input
          className={styles.filterInput}
          placeholder="搜索社区名或快照标题"
          placeholderClass="filterPlaceholder"
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
        <View className={styles.filterTabs}>
          {(['all', 'added', 'approved'] as const).map((type) => (
            <View
              key={type}
              className={classnames(styles.filterTab, filterType === type && styles.filterTabActive)}
              onClick={() => setFilterType(type)}
            >
              <Text className={classnames(styles.filterTabText, filterType === type && styles.filterTabTextActive)}>
                {type === 'all' ? '全部' : type === 'added' ? '新增' : '通过'}
              </Text>
            </View>
          ))}
        </View>
        <View className={styles.filterTabs}>
          {(['unread', 'all', 'read'] as const).map((type) => (
            <View
              key={type}
              className={classnames(styles.filterTab, readFilter === type && styles.filterTabActive)}
              onClick={() => setReadFilter(type)}
            >
              <Text className={classnames(styles.filterTabText, readFilter === type && styles.filterTabTextActive)}>
                {type === 'unread' ? '未读' : type === 'all' ? '全部' : '已读'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        scrollY
        className={styles.listWrap}
        onScroll={handleScroll}
        style={{ height: 'calc(100vh - 320rpx)' }}
      >
        {filteredUpdates.length > 0 ? (
          filteredUpdates.map((update) => (
            <View
              key={update.id}
              className={classnames(styles.updateItem, !update.isRead && styles.updateItemUnread)}
              onClick={() => handleUpdateClick(update)}
            >
              {!update.isRead && <View className={styles.unreadDot} />}
              <View className={styles.updateContent}>
                <View className={styles.updateHeader}>
                  <View className={classnames(styles.typeTag, update.type === 'added' ? styles.typeAdded : styles.typeApproved)}>
                    <Text className={styles.typeTagText}>{update.type === 'added' ? '新增' : '通过'}</Text>
                  </View>
                  <Text className={styles.updateCommunity}>{update.communityName}</Text>
                  <View
                    className={styles.unsubscribeBtn}
                    onClick={(e) => handleUnsubscribe(update.communityId, e)}
                  >
                    <Text className={styles.unsubscribeBtnText}>取消订阅</Text>
                  </View>
                </View>
                <Text className={styles.updateTitle}>{update.title}</Text>
                <Text className={styles.updateDate}>{new Date(update.date).toLocaleDateString()}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              {readFilter === 'unread' ? '没有未读更新' : '暂无订阅更新'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default UpdatesPage
