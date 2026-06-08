import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { Snapshot } from '@/types/index'
import styles from './index.module.scss'

interface SnapshotCardProps {
  snapshot: Snapshot
  onLike?: (id: string) => void
  onBookmark?: (id: string) => void
  onShare?: (id: string) => void
  onClaim?: (id: string) => void
  showClaim?: boolean
  showStatus?: boolean
}

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

const SnapshotCard: React.FC<SnapshotCardProps> = ({
  snapshot,
  onLike,
  onBookmark,
  onShare,
  onClaim,
  showClaim = false,
  showStatus = false
}) => {
  const handleLike = (e) => {
    e.stopPropagation()
    onLike?.(snapshot.id)
  }

  const handleBookmark = (e) => {
    e.stopPropagation()
    onBookmark?.(snapshot.id)
  }

  const handleShare = (e) => {
    e.stopPropagation()
    onShare?.(snapshot.id)
  }

  const handleClaim = (e) => {
    e.stopPropagation()
    onClaim?.(snapshot.id)
  }

  const canClaim = showClaim && !snapshot.isClaimed && snapshot.status === 'approved'

  return (
    <View className={styles.card}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={snapshot.imageUrl}
          mode="aspectFill"
        />
        <View className={classnames(styles.categoryTag, styles[snapshot.category])}>
          <Text className={styles.categoryText}>{categoryLabels[snapshot.category]}</Text>
        </View>
      </View>
      <View className={styles.content}>
        <Text className={styles.title}>{snapshot.title}</Text>
        <Text className={styles.community}>{snapshot.communityName} · {snapshot.district}</Text>
        <View className={styles.tags}>
          {snapshot.tags.map((tag, idx) => (
            <View key={idx} className={styles.tag}>
              <Text className={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text className={styles.desc}>{snapshot.description}</Text>

        {showStatus && (
          <View className={styles.statusRow}>
            <View className={styles.statusBadge} style={{ background: `${statusLabels[snapshot.status].color}20` }}>
              <Text className={styles.statusText} style={{ color: statusLabels[snapshot.status].color }}>
                {statusLabels[snapshot.status].text}
              </Text>
            </View>
            {snapshot.contributorName && (
              <Text className={styles.contributor}>贡献者：{snapshot.contributorName}</Text>
            )}
          </View>
        )}

        <View className={styles.footer}>
          <Text className={styles.date}>{snapshot.collectDate}</Text>
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
        </View>

        {canClaim && (
          <View className={styles.claimBtn} onClick={handleClaim}>
            <Text className={styles.claimBtnText}>认领贡献</Text>
          </View>
        )}

        {showClaim && snapshot.isClaimed && snapshot.claimedBy === 'u_current' && (
          <View className={styles.claimedTag}>
            <Text className={styles.claimedTagText}>已认领</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default SnapshotCard
