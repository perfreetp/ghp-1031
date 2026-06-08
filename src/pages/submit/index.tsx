import React, { useState } from 'react'
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store/useAppStore'
import styles from './index.module.scss'

const TAG_OPTIONS = ['官网', '公告', '活动', '节日', '防疫', '志愿者', '运动会', '阅读', '其他']
const DISTRICT_OPTIONS = [
  '朝阳区望京街道', '海淀区中关村街道', '丰台区方庄街道',
  '东城区和平里街道', '西城区金融街街道', '石景山区八角街道',
  '通州区梨园街道', '大兴区亦庄街道'
]

const SubmitPage: React.FC = () => {
  const { addSnapshot } = useAppStore()
  const [url, setUrl] = useState('')
  const [communityName, setCommunityName] = useState('')
  const [district, setDistrict] = useState('')
  const [collectDate, setCollectDate] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        setPhotoUrl(res.tempFilePaths[0])
        console.info('[Submit] Photo selected:', res.tempFilePaths[0])
      },
      fail: (err) => {
        console.error('[Submit] Photo selection failed:', err)
      }
    })
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleDistrictPick = () => {
    Taro.showActionSheet({
      itemList: DISTRICT_OPTIONS,
      success: (res) => {
        setDistrict(DISTRICT_OPTIONS[res.tapIndex])
      }
    })
  }

  const handleDatePick = () => {
    Taro.showModal({
      title: '采集日期',
      editable: true,
      placeholderText: '请输入日期，如 2024-01-15',
      success: (res) => {
        if (res.confirm && res.content) {
          setCollectDate(res.content.trim())
        }
      }
    })
  }

  const handleSubmit = () => {
    if (!url.trim() && !photoUrl) {
      Taro.showToast({ title: '请粘贴链接或拍照上传', icon: 'none' })
      return
    }
    if (!communityName.trim()) {
      Taro.showToast({ title: '请填写社区名称', icon: 'none' })
      return
    }
    if (!district) {
      Taro.showToast({ title: '请选择街区位置', icon: 'none' })
      return
    }

    const newSnapshot = {
      id: `s_${Date.now()}`,
      title: communityName + (selectedTags.length > 0 ? ` - ${selectedTags[0]}` : ' 快照'),
      url: url || 'https://example.com',
      imageUrl: photoUrl || 'https://picsum.photos/id/787/750/500',
      communityName,
      district,
      collectDate: collectDate || new Date().toISOString().split('T')[0],
      tags: selectedTags,
      description,
      likes: 0,
      isLiked: false,
      isBookmarked: false,
      category: 'other' as const,
      status: 'pending' as const,
      contributorId: 'u_current',
      contributorName: '我',
      createdAt: new Date().toISOString()
    }

    addSnapshot(newSnapshot)
    console.info('[Submit] Snapshot submitted:', newSnapshot.id)

    Taro.showToast({ title: '提交成功，等待审核', icon: 'success' })

    setUrl('')
    setCommunityName('')
    setDistrict('')
    setCollectDate('')
    setSelectedTags([])
    setDescription('')
    setPhotoUrl('')
  }

  return (
    <View className={styles.container}>
      <View className={styles.card}>
        <Text className={styles.cardTitle}>网址信息</Text>

        <View className={styles.formGroup}>
          <Text className={styles.label}>粘贴链接<Text className={styles.required}>*</Text></Text>
          <Input
            className={styles.input}
            placeholder="请粘贴社区旧网址"
            value={url}
            onInput={(e) => setUrl(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>拍照上传</Text>
          <View className={styles.uploadArea}>
            {photoUrl ? (
              <Image className={styles.photoPreview} src={photoUrl} mode="aspectFill" onClick={handleTakePhoto} />
            ) : (
              <View className={styles.uploadBtn} onClick={handleTakePhoto}>
                <Text className={styles.uploadIcon}>📷</Text>
                <Text className={styles.uploadText}>拍照/相册</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>社区信息</Text>

        <View className={styles.formGroup}>
          <Text className={styles.label}>社区名称<Text className={styles.required}>*</Text></Text>
          <Input
            className={styles.input}
            placeholder="请填写社区名称"
            value={communityName}
            onInput={(e) => setCommunityName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>街区位置<Text className={styles.required}>*</Text></Text>
          <View className={styles.pickerValue} onClick={handleDistrictPick}>
            <Text className={district ? '' : styles.pickerPlaceholder}>
              {district || '请选择街区位置'}
            </Text>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>采集日期</Text>
          <View className={styles.pickerValue} onClick={handleDatePick}>
            <Text className={collectDate ? '' : styles.pickerPlaceholder}>
              {collectDate || '请选择采集日期'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>标签与说明</Text>

        <View className={styles.formGroup}>
          <Text className={styles.label}>选择标签</Text>
          <View className={styles.tagSelect}>
            {TAG_OPTIONS.map((tag) => (
              <View
                key={tag}
                className={`${styles.tagOption} ${selectedTags.includes(tag) ? styles.tagOptionActive : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                <Text className={`${styles.tagOptionText} ${selectedTags.includes(tag) ? styles.tagOptionTextActive : ''}`}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>补充说明</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请补充文字说明，如网页背景、重要内容等"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>
      </View>

      <View className={styles.submitBtn}>
        <Button className={styles.submitBtnInner} onClick={handleSubmit}>
          提交审核
        </Button>
      </View>
    </View>
  )
}

export default SubmitPage
