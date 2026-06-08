import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import { CategoryType } from '@/types/index'
import styles from './index.module.scss'

interface TagFilterProps {
  selected: CategoryType
  onChange: (category: CategoryType) => void
}

const tagOptions: { value: CategoryType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'official', label: '官网' },
  { value: 'notice', label: '公告' },
  { value: 'activity', label: '活动' },
  { value: 'other', label: '其他' }
]

const TagFilter: React.FC<TagFilterProps> = ({ selected, onChange }) => {
  return (
    <ScrollView scrollX className={styles.container} enhanced showScrollbar={false}>
      <View className={styles.tagList}>
        {tagOptions.map((opt) => (
          <View
            key={opt.value}
            className={classnames(styles.tag, selected === opt.value && styles.active)}
            onClick={() => onChange(opt.value)}
          >
            <Text className={classnames(styles.tagText, selected === opt.value && styles.activeText)}>
              {opt.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default TagFilter
