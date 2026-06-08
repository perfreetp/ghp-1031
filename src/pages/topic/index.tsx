import React, { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockTopics } from '@/data/topics'
import PosterCard from '@/components/PosterCard'
import styles from './index.module.scss'

const TopicPage: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  const selectedTopic = mockTopics.find(t => t.id === selectedTopicId)

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId)
  }

  const handleGeneratePoster = () => {
    if (selectedTopic) {
      Taro.showToast({ title: '纪念海报已生成', icon: 'success' })
      console.info('[Topic] Poster generated for:', selectedTopic.id)
    }
  }

  const announcements = [
    '阳光花园社区2024年度工作总结',
    '翠湖社区端午活动报名通知',
    '锦绣家园社区志愿者招募公告',
    '银杏苑社区春节慰问发放通知',
    '龙腾社区环境卫生整治行动公告'
  ]

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
