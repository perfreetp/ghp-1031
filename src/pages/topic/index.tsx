import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { mockTopics } from '@/data/topics'
import { useAppStore, getCommunityById, getCommunityByName, getAllCommunities } from '@/store/useAppStore'
import PosterCard from '@/components/PosterCard'
import styles from './index.module.scss'

const categoryLabels: Record<string, string> = {
  official: '官网',
  notice: '公告',
  activity: '活动',
  other: '其他'
}

interface TimelineGroup {
  year: string
  months: { month: string; snapshots: ReturnType<ReturnType<typeof useAppStore>['getSnapshotsByCommunity']>; }[]
}

function buildTimeline(snapshots: ReturnType<ReturnType<typeof useAppStore>['getSnapshotsByCommunity']>): TimelineGroup[] {
  const map = new Map<string, Map<string, typeof snapshots>>()
  snapshots.forEach(s => {
    const year = s.collectDate.slice(0, 4)
    const month = s.collectDate.slice(5, 7)
    if (!map.has(year)) map.set(year, new Map())
    const yearMap = map.get(year)!
    if (!yearMap.has(month)) yearMap.set(month, [])
    yearMap.get(month)!.push(s)
  })
  const result: TimelineGroup[] = []
  const sortedYears = [...map.keys()].sort((a, b) => b.localeCompare(a))
  sortedYears.forEach(year => {
    const yearMap = map.get(year)!
    const months: TimelineGroup['months'] = []
    const sortedMonths = [...yearMap.keys()].sort((a, b) => b.localeCompare(a))
    sortedMonths.forEach(month => {
      months.push({ month, snapshots: yearMap.get(month)! })
    })
    result.push({ year, months })
  })
  return result
}

const TopicPage: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [communityId, setCommunityId] = useState<string>('')
  const [detailSnapshotId, setDetailSnapshotId] = useState<string | null>(null)

  const {
    toggleLike,
    toggleBookmark,
    toggleSubscribe,
    isSubscribed,
    getSnapshotsByCommunity,
    claimSnapshot,
    getSnapshotById
  } = useAppStore()

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.communityName) {
      const name = decodeURIComponent(params.communityName)
      const c = getCommunityByName(name)
      if (c) setCommunityId(c.id)
    } else if (params?.id) {
      setCommunityId(params.id)
    }
  }, [])

  const selectedTopic = mockTopics.find(t => t.id === selectedTopicId)
  const community = communityId ? getCommunityById(communityId) : undefined
  const communitySnapshots = community ? getSnapshotsByCommunity(community.name) : []
  const timeline = useMemo(() => buildTimeline(communitySnapshots), [communitySnapshots.length])
  const detailSnapshot = detailSnapshotId ? getSnapshotById(detailSnapshotId) : undefined

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId)
  }

  const handleGeneratePoster = () => {
    if (selectedTopic) {
      Taro.showToast({ title: '纪念海报已生成', icon: 'success' })
    }
  }

  const handleSubscribe = (cId: string) => {
    toggleSubscribe(cId)
    const sub = !isSubscribed(cId)
    Taro.showToast({ title: sub ? '已订阅' : '已取消订阅', icon: 'none' })
  }

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const handleClaim = (id: string) => {
    claimSnapshot(id)
    Taro.showToast({ title: '认领成功', icon: 'success' })
  }

  const handleSnapshotClick = (id: string) => {
    setDetailSnapshotId(id)
  }

  const handleCloseDetail = () => {
    setDetailSnapshotId(null)
  }

  const announcements = [
    '阳光花园社区2024年度工作总结',
    '翠湖社区端午活动报名通知',
    '锦绣家园社区志愿者招募公告',
    '银杏苑社区春节慰问发放通知',
    '龙腾社区环境卫生整治行动公告'
  ]

  if (communityId && community) {
    return (
      <View className={styles.container}>
        <ScrollView scrollY style={{ height: '100vh' }}>
          <View className={styles.communityHeader}>
            <Text className={styles.communityTitle}>{community.name}</Text>
            <View className={styles.communityMeta}>
              <Text className={styles.communityMetaText}>{community.district}</Text>
              <Text className={styles.communityMetaText}>{communitySnapshots.length}个快照</Text>
              {communitySnapshots.length > 0 && (
                <Text className={styles.communityMetaText}>最新：{communitySnapshots[0].collectDate}</Text>
              )}
            </View>
            <View
              className={classnames(styles.subBtn, isSubscribed(community.id) && styles.subActive)}
              onClick={() => handleSubscribe(community.id)}
            >
              <Text className={classnames(styles.subBtnText, isSubscribed(community.id) && styles.subBtnTextActive)}>
                {isSubscribed(community.id) ? '✓ 已订阅' : '+ 订阅社区更新'}
              </Text>
            </View>
          </View>

          <View className={styles.timelineWrap}>
            {timeline.length > 0 ? (
              timeline.map((group) => (
                <View key={group.year} className={styles.timelineYear}>
                  <View className={styles.yearHeader}>
                    <View className={styles.yearDot} />
                    <Text className={styles.yearText}>{group.year}年</Text>
                  </View>
                  {group.months.map((m) => (
                    <View key={m.month} className={styles.timelineMonth}>
                      <View className={styles.monthLine} />
                      <View className={styles.monthContent}>
                        <Text className={styles.monthLabel}>{parseInt(m.month)}月</Text>
                        <View className={styles.monthSnapshots}>
                          {m.snapshots.map((snapshot) => (
                            <View
                              key={snapshot.id}
                              className={styles.timelineCard}
                              onClick={() => handleSnapshotClick(snapshot.id)}
                            >
                              <Image className={styles.timelineCardImage} src={snapshot.imageUrl} mode="aspectFill" />
                              <View className={styles.timelineCardContent}>
                                <View className={styles.timelineCardCategory}>
                                  <Text className={styles.timelineCardCategoryText}>{categoryLabels[snapshot.category]}</Text>
                                </View>
                                <Text className={styles.timelineCardTitle}>{snapshot.title}</Text>
                                <Text className={styles.timelineCardDate}>{snapshot.collectDate}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📭</Text>
                <Text className={styles.emptyText}>该社区暂无快照</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {detailSnapshot && (
          <View className={styles.detailOverlay} onClick={handleCloseDetail}>
            <View className={styles.detailCard} onClick={(e) => e.stopPropagation()}>
              <View className={styles.detailClose} onClick={handleCloseDetail}>
                <Text className={styles.detailCloseText}>✕</Text>
              </View>
              <Image className={styles.detailImage} src={detailSnapshot.imageUrl} mode="aspectFill" />
              <ScrollView scrollY className={styles.detailContent}>
                <View className={styles.detailCategoryTag}>
                  <Text className={styles.detailCategoryText}>{categoryLabels[detailSnapshot.category]}</Text>
                </View>
                <Text className={styles.detailTitle}>{detailSnapshot.title}</Text>
                <Text className={styles.detailCommunity}>{detailSnapshot.communityName} · {detailSnapshot.district}</Text>

                <View className={styles.detailTags}>
                  {detailSnapshot.tags.map((tag, idx) => (
                    <View key={idx} className={styles.detailTag}>
                      <Text className={styles.detailTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Text className={styles.detailDesc}>{detailSnapshot.description}</Text>

                {detailSnapshot.url && (
                  <View className={styles.detailUrl} onClick={() => {
                    Taro.setClipboardData({ data: detailSnapshot.url })
                    Taro.showToast({ title: '链接已复制', icon: 'none' })
                  }}>
                    <Text className={styles.detailUrlLabel}>原网址：</Text>
                    <Text className={styles.detailUrlText}>{detailSnapshot.url}</Text>
                  </View>
                )}

                <View className={styles.detailInfo}>
                  <Text className={styles.detailDate}>采集日期：{detailSnapshot.collectDate}</Text>
                  {detailSnapshot.contributorName && (
                    <Text className={styles.detailContributor}>
                      贡献者：{detailSnapshot.claimedBy === 'u_current' ? '我' : detailSnapshot.contributorName}
                    </Text>
                  )}
                </View>

                <View className={styles.detailActions}>
                  <View className={styles.detailActionBtn} onClick={() => toggleLike(detailSnapshot.id)}>
                    <Text className={classnames(styles.detailActionIcon, detailSnapshot.isLiked && styles.detailLiked)}>
                      {detailSnapshot.isLiked ? '♥' : '♡'}
                    </Text>
                    <Text className={styles.detailActionCount}>{detailSnapshot.likes}</Text>
                  </View>
                  <View className={styles.detailActionBtn} onClick={() => toggleBookmark(detailSnapshot.id)}>
                    <Text className={classnames(styles.detailActionIcon, detailSnapshot.isBookmarked && styles.detailBookmarked)}>
                      {detailSnapshot.isBookmarked ? '★' : '☆'}
                    </Text>
                  </View>
                  <View className={styles.detailActionBtn} onClick={() => handleShare(detailSnapshot.id)}>
                    <Text className={styles.detailActionIcon}>↗</Text>
                  </View>
                </View>

                {!detailSnapshot.isClaimed && detailSnapshot.status === 'approved' && (
                  <View className={styles.detailClaimBtn} onClick={() => handleClaim(detailSnapshot.id)}>
                    <Text className={styles.detailClaimBtnText}>认领贡献</Text>
                  </View>
                )}
                {detailSnapshot.isClaimed && detailSnapshot.claimedBy === 'u_current' && (
                  <View className={styles.detailClaimedTag}>
                    <Text className={styles.detailClaimedTagText}>已认领</Text>
                  </View>
                )}
                {detailSnapshot.isClaimed && detailSnapshot.claimedBy !== 'u_current' && detailSnapshot.contributorName && (
                  <View className={styles.detailClaimedTag}>
                    <Text className={styles.detailClaimedTagText}>贡献者：{detailSnapshot.contributorName}</Text>
                  </View>
                )}

                {community && (
                  <View
                    className={classnames(styles.detailSubBtn, isSubscribed(community.id) && styles.detailSubActive)}
                    onClick={() => handleSubscribe(community.id)}
                  >
                    <Text className={classnames(styles.detailSubBtnText, isSubscribed(community.id) && styles.detailSubBtnTextActive)}>
                      {isSubscribed(community.id) ? '✓ 已订阅此社区' : '+ 订阅社区更新'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
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
