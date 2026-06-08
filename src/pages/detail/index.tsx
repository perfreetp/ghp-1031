import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore, getCommunityById } from '@/store/useAppStore'
import styles from './index.module.scss'

const categoryLabels: Record<string, string> = {
  official: '官网',
  notice: '公告',
  activity: '活动',
  other: '其他'
}

const statusLabels: Record<string, { text: string; color: string }> = {
  pending: { text: '待审核', color: '#FAAD14' },
  approved: { text: '已通过', color: '#52C41A' },
  rejected: { text: '已驳回', color: '#F5222D' }
}

const DetailPage: React.FC = () => {
  const [snapshotId, setSnapshotId] = useState('')
  const {
    getSnapshotById,
    toggleLike,
    toggleBookmark,
    claimSnapshot,
    toggleSubscribe,
    isSubscribed
  } = useAppStore()

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      setSnapshotId(decodeURIComponent(params.id))
    }
  }, [])

  const snapshot = snapshotId ? getSnapshotById(snapshotId) : undefined
  const community = snapshot ? getCommunityById(snapshot.communityName) : undefined

  const communityInfo = (() => {
    if (!snapshot) return undefined
    const allCommunities = require('@/data/communities').mockCommunities
    return allCommunities.find(c => c.name === snapshot.communityName)
  })()

  const handleLike = () => {
    if (snapshot) toggleLike(snapshot.id)
  }

  const handleBookmark = () => {
    if (snapshot) toggleBookmark(snapshot.id)
  }

  const handleClaim = () => {
    if (!snapshot) return
    claimSnapshot(snapshot.id)
    Taro.showToast({ title: '认领成功', icon: 'success' })
  }

  const handleCopyUrl = () => {
    if (snapshot?.url) {
      Taro.setClipboardData({ data: snapshot.url })
      Taro.showToast({ title: '链接已复制', icon: 'none' })
    }
  }

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const handleGoCommunity = () => {
    if (communityInfo) {
      Taro.navigateTo({ url: `/pages/topic/index?id=${communityInfo.id}` })
    }
  }

  const handleSubscribe = () => {
    if (!communityInfo) return
    toggleSubscribe(communityInfo.id)
    const sub = !isSubscribed(communityInfo.id)
    Taro.showToast({ title: sub ? '已订阅' : '已取消订阅', icon: 'none' })
  }

  if (!snapshot) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>快照不存在</Text>
        </View>
      </View>
    )
  }

  const claimedByMe = snapshot.isClaimed && snapshot.claimedBy === 'u_current'
  const claimedByOther = snapshot.isClaimed && snapshot.claimedBy !== 'u_current'
  const canClaim = !snapshot.isClaimed && snapshot.status === 'approved'

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <Image className={styles.heroImage} src={snapshot.imageUrl} mode="aspectFill" />

        <View className={styles.body}>
          <View className={styles.categoryTag}>
            <Text className={styles.categoryText}>{categoryLabels[snapshot.category]}</Text>
          </View>

          <Text className={styles.title}>{snapshot.title}</Text>

          <View className={styles.statusRow}>
            <View className={styles.statusBadge} style={{ background: `${statusLabels[snapshot.status].color}20` }}>
              <Text className={styles.statusText} style={{ color: statusLabels[snapshot.status].color }}>
                {statusLabels[snapshot.status].text}
              </Text>
            </View>
            <Text className={styles.collectDate}>采集日期：{snapshot.collectDate}</Text>
          </View>

          <View className={styles.tags}>
            {snapshot.tags.map((tag, idx) => (
              <View key={idx} className={styles.tag}>
                <Text className={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text className={styles.desc}>{snapshot.description}</Text>

          {snapshot.url && (
            <View className={styles.urlRow} onClick={handleCopyUrl}>
              <Text className={styles.urlLabel}>原网址</Text>
              <Text className={styles.urlValue}>{snapshot.url}</Text>
              <Text className={styles.urlAction}>复制</Text>
            </View>
          )}

          <View className={styles.infoSection}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>所属社区</Text>
              {communityInfo ? (
                <View className={styles.communityEntry} onClick={handleGoCommunity}>
                  <Image className={styles.communityAvatar} src={communityInfo.coverUrl} mode="aspectFill" />
                  <Text className={styles.communityName}>{communityInfo.name}</Text>
                  <Text className={styles.communityArrow}>›</Text>
                </View>
              ) : (
                <Text className={styles.infoValue}>{snapshot.communityName}</Text>
              )}
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>所在街区</Text>
              <Text className={styles.infoValue}>{snapshot.district}</Text>
            </View>
            {snapshot.contributorName && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>贡献者</Text>
                <Text className={styles.infoValue}>
                  {claimedByMe ? '我' : snapshot.contributorName}
                </Text>
              </View>
            )}
          </View>

          <View className={styles.actions}>
            <View className={styles.actionBtn} onClick={handleLike}>
              <Text className={classnames(styles.actionIcon, snapshot.isLiked && styles.liked)}>
                {snapshot.isLiked ? '♥' : '♡'}
              </Text>
              <Text className={styles.actionCount}>{snapshot.likes}</Text>
            </View>
            <View className={styles.actionBtn} onClick={handleBookmark}>
              <Text className={classnames(styles.actionIcon, snapshot.isBookmarked && styles.bookmarked)}>
                {snapshot.isBookmarked ? '★' : '☆'}
              </Text>
            </View>
            <View className={styles.actionBtn} onClick={handleShare}>
              <Text className={styles.actionIcon}>↗</Text>
            </View>
          </View>

          {canClaim && (
            <View className={styles.claimBtn} onClick={handleClaim}>
              <Text className={styles.claimBtnText}>认领贡献</Text>
            </View>
          )}
          {claimedByMe && (
            <View className={styles.claimedTag}>
              <Text className={styles.claimedTagText}>已认领</Text>
            </View>
          )}
          {claimedByOther && snapshot.contributorName && (
            <View className={styles.othersClaimedTag}>
              <Text className={styles.othersClaimedTagText}>贡献者：{snapshot.contributorName}</Text>
            </View>
          )}

          {communityInfo && (
            <View
              className={classnames(styles.subBtn, isSubscribed(communityInfo.id) && styles.subActive)}
              onClick={handleSubscribe}
            >
              <Text className={classnames(styles.subBtnText, isSubscribed(communityInfo.id) && styles.subBtnTextActive)}>
                {isSubscribed(communityInfo.id) ? '✓ 已订阅此社区' : '+ 订阅社区更新'}
              </Text>
            </View>
          )}

          {communityInfo && (
            <View className={styles.communityLink} onClick={handleGoCommunity}>
              <Text className={styles.communityLinkText}>查看「{communityInfo.name}」社区时间线 ›</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default DetailPage
