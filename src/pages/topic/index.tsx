import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { mockTopics } from '@/data/topics'
import { mockCommunities } from '@/data/communities'
import { useAppStore } from '@/store/useAppStore'
import PosterCard from '@/components/PosterCard'
import SnapshotCard from '@/components/SnapshotCard'
import styles from './index.module.scss'

const TopicPage: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [communityName, setCommunityName] = useState<string>('')

  const { toggleLike, toggleBookmark, toggleSubscribe, isSubscribed, getSnapshotsByCommunity } = useAppStore()

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.communityName) {
      setCommunityName(decodeURIComponent(params.communityName))
    }
  }, [])

  const selectedTopic = mockTopics.find(t => t.id === selectedTopicId)

  const communitySnapshots = communityName ? getSnapshotsByCommunity(communityName) : []
  const communityInfo = communityName
    ? mockCommunities.find(c => c.name === communityName)
    : null

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId)
  }

  const handleGeneratePoster = () => {
    if (selectedTopic) {
      Taro.showToast({ title: '纪念海报已生成', icon: 'success' })
      console.info('[Topic] Poster generated for:', selectedTopic.id)
    }
  }

  const handleSubscribe = (communityId: string) => {
    toggleSubscribe(communityId)
    const sub = !isSubscribed(communityId)
    Taro.showToast({ title: sub ? '已订阅' : '已取消订阅', icon: 'none' })
  }

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const announcements = [
    '阳光花园社区2024年度工作总结',
    '翠湖社区端午活动报名通知',
    '锦绣家园社区志愿者招募公告',
    '银杏苑社区春节慰问发放通知',
    '龙腾社区环境卫生整治行动公告'
  ]

  if (communityName && communityInfo) {
    return (
      <View className={styles.container}>
        <ScrollView scrollY style={{ height: '100vh' }}>
          <View className={styles.communityHeader}>
            <Text className={styles.communityTitle}>{communityName}</Text>
            <View className={styles.communityMeta}>
              <Text className={styles.communityMetaText}>{communityInfo.district}</Text>
              <Text className={styles.communityMetaText}>{communitySnapshots.length}个快照</Text>
            </View>
            <View
              className={classnames(styles.subBtn, isSubscribed(communityInfo.id) && styles.subActive)}
              onClick={() => handleSubscribe(communityInfo.id)}
            >
              <Text className={classnames(styles.subBtnText, isSubscribed(communityInfo.id) && styles.subBtnTextActive)}>
                {isSubscribed(communityInfo.id) ? '已订阅' : '+ 订阅社区更新'}
              </Text>
            </View>
          </View>

          <View className={styles.communitySnapshotList}>
            {communitySnapshots.length > 0 ? (
              communitySnapshots.map((snapshot) => (
                <SnapshotCard
                  key={snapshot.id}
                  snapshot={snapshot}
                  onLike={toggleLike}
                  onBookmark={toggleBookmark}
                  onShare={handleShare}
                />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📭</Text>
                <Text className={styles.emptyText}>该社区暂无快照</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    )
  }

  if (selectedTopic) {
    return (
      <View className={styles.container}>
        <ScrollView scrollY style={{ height: '100vh' }}>
          <View className={styles.posterSection}>
            <Text className={styles.posterTitle}>纪念海报</Text>
            <PosterCard
              title={selectedTopic.title}
              communityName="社区专题"
              date={selectedTopic.createdAt}
              imageUrl={selectedTopic.coverUrl}
              description={selectedTopic.description}
            />
            <View className={styles.generateBtn} onClick={handleGeneratePoster}>
              <Text style={{ color: '#fff', fontSize: '28rpx', fontWeight: 500 }}>生成纪念海报</Text>
            </View>
          </View>

          <View className={styles.announcementSection}>
            <Text className={styles.announcementTitle}>历史公告</Text>
            {announcements.map((item, idx) => (
              <View key={idx} className={styles.announcementItem}>
                <View className={styles.announcementDot} />
                <Text className={styles.announcementText}>{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.topicList}>
          {mockTopics.map((topic) => (
            <View
              key={topic.id}
              className={styles.topicCard}
              onClick={() => handleTopicClick(topic.id)}
            >
              <Image className={styles.topicImage} src={topic.coverUrl} mode="aspectFill" />
              <View className={styles.topicContent}>
                <Text className={styles.topicTitle}>{topic.title}</Text>
                <Text className={styles.topicDesc}>{topic.description}</Text>
                <View className={styles.topicMeta}>
                  <Text className={styles.topicDate}>{topic.createdAt}</Text>
                  <View className={styles.topicStats}>
                    <Text className={styles.topicStat}>{topic.snapshotIds.length}个快照</Text>
                    <Text className={styles.topicStat}>{topic.announcementCount}条公告</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default TopicPage
