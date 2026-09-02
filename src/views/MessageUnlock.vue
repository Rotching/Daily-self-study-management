<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import StudySidebar from '@/components/StudySidebar.vue'

const seedMessages = [
  { id: 1, type: '学生寄语', quote: '愿你合上书本的时候，比翻开时多一点从容，多一点底气。', author: '写给认真生活的你', date: '2026-07-06', completion: 85, unlocked: true, favorite: true, note: '', privacy: 'private' },
  { id: 2, type: '成长寄语', quote: '你留下的每一滴汗水，都在悄悄浇灌未来的花朵。', author: '来自七月的自己', date: '2026-07-08', completion: 100, unlocked: true, favorite: false, note: '', privacy: 'private' },
  { id: 3, type: '学生寄语', quote: '慢慢来，不要着急。所有认真种下的种子，都会在时间里发芽。', author: '日常自习管理平台', date: '2026-07-10', completion: 90, unlocked: true, favorite: false, note: '', privacy: 'friends' },
  { id: 4, type: '成长寄语', quote: '今天向前的一小步，也在悄悄改变明天的你。', author: '写给未来的我', date: '2026-07-12', completion: 85, unlocked: true, favorite: true, note: '', privacy: 'private' },
  { id: 5, type: '学生寄语', quote: '坚持不是永远紧绷，而是休息以后，仍愿意回来继续。', author: '自律同行者', date: '2026-07-13', completion: 100, unlocked: true, favorite: false, note: '', privacy: 'friends' },
  { id: 6, type: '成长寄语', quote: '', author: '', date: '2026-08-28', completion: 0, unlocked: false, favorite: false, note: '', privacy: 'private' }
]

const messages = ref(seedMessages.map((message) => ({ ...message })))
const viewMode = ref('collection')
const activeMessageId = ref(null)
const filterMonth = ref('all')
const filterYear = ref('2026')
const unlockModalOpen = ref(false)
const unlockSuccessOpen = ref(false)
const shareModalOpen = ref(false)
const notice = reactive({ open: false, title: '', text: '' })
const formError = ref('')
const noteDraft = ref('')

const unlockForm = reactive({
  quote: '',
  author: '',
  type: '成长寄语'
})

const activeMessage = computed(() => messages.value.find((message) => message.id === activeMessageId.value))

const monthOptions = computed(() => {
  const values = new Set(messages.value.filter((message) => message.unlocked).map((message) => message.date.slice(5, 7)))
  return [...values].sort()
})

const yearOptions = computed(() => {
  const values = new Set(messages.value.filter((message) => message.unlocked).map((message) => message.date.slice(0, 4)))
  return [...values].sort().reverse()
})

const filteredMessages = computed(() => messages.value.filter((message) => {
  if (!message.unlocked) return filterMonth.value === 'all'
  const matchMonth = filterMonth.value === 'all' || message.date.slice(5, 7) === filterMonth.value
  const matchYear = filterYear.value === 'all' || message.date.slice(0, 4) === filterYear.value
  return matchMonth && matchYear
}))

const persistMessages = () => localStorage.setItem('growth-messages', JSON.stringify(messages.value))

const openUnlock = () => {
  unlockForm.quote = ''
  unlockForm.author = ''
  unlockForm.type = '成长寄语'
  formError.value = ''
  unlockModalOpen.value = true
}

const submitUnlock = () => {
  const quote = unlockForm.quote.trim()
  const author = unlockForm.author.trim()
  if (quote.length < 8) {
    formError.value = '寄语内容至少需要 8 个字'
    return
  }
  if (!author) {
    formError.value = '请留下寄语署名'
    return
  }

  const today = new Date()
  const date = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`
  const lockedIndex = messages.value.findIndex((message) => !message.unlocked)
  const newMessage = {
    id: lockedIndex >= 0 ? messages.value[lockedIndex].id : Date.now(),
    type: unlockForm.type,
    quote,
    author,
    date,
    completion: 100,
    unlocked: true,
    favorite: false,
    note: '',
    privacy: 'private'
  }

  if (lockedIndex >= 0) messages.value.splice(lockedIndex, 1, newMessage)
  else messages.value.unshift(newMessage)
  persistMessages()
  unlockModalOpen.value = false
  unlockSuccessOpen.value = true
}

const closeUnlockSuccess = (continueUnlocking = false) => {
  unlockSuccessOpen.value = false
  if (continueUnlocking) openUnlock()
}

const openDetail = (message) => {
  if (!message.unlocked) {
    openUnlock()
    return
  }
  activeMessageId.value = message.id
  noteDraft.value = message.note ?? ''
  viewMode.value = 'detail'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const backToCollection = () => {
  viewMode.value = 'collection'
  activeMessageId.value = null
  shareModalOpen.value = false
}

const toggleFavorite = () => {
  if (!activeMessage.value) return
  activeMessage.value.favorite = !activeMessage.value.favorite
  persistMessages()
}

const saveNote = () => {
  if (!activeMessage.value) return
  activeMessage.value.note = noteDraft.value.trim()
  persistMessages()
  showNotice('寄语备注已保存', '以后再次读到这张寄语卡片时，也能看见此刻的心情。')
}

const updatePrivacy = (privacy) => {
  if (!activeMessage.value) return
  activeMessage.value.privacy = privacy
  persistMessages()
}

const showNotice = (title, text) => {
  notice.title = title
  notice.text = text
  notice.open = true
}

const shareMessage = async (platform) => {
  if (!activeMessage.value) return
  if (platform === '复制链接') {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/message-unlock?message=${activeMessage.value.id}`)
    } catch {
      // Clipboard permissions vary by browser; the visual flow still completes locally.
    }
  }
  shareModalOpen.value = false
  showNotice('寄语卡片已成功分享', platform === '复制链接' ? '分享链接已经复制，可以发送给想鼓励的人。' : `已生成适合分享到${platform}的寄语卡片。`)
}

const wrapCanvasText = (context, text, maxWidth) => {
  const lines = []
  let current = ''
  for (const character of text) {
    const candidate = current + character
    if (context.measureText(candidate).width > maxWidth && current) {
      lines.push(current)
      current = character
    } else current = candidate
  }
  if (current) lines.push(current)
  return lines
}

const saveAsImage = () => {
  if (!activeMessage.value) return
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 820
  const context = canvas.getContext('2d')
  context.fillStyle = '#f8f3ea'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#739f8c'
  context.lineWidth = 4
  context.strokeRect(60, 60, 1080, 700)
  context.fillStyle = '#739f8c'
  context.font = '32px sans-serif'
  context.fillText('日常自习管理平台 · 成长寄语', 110, 135)
  context.fillStyle = '#5b534d'
  context.font = '48px serif'
  const lines = wrapCanvasText(context, `“${activeMessage.value.quote}”`, 900)
  lines.slice(0, 5).forEach((line, index) => context.fillText(line, 150, 280 + index * 76))
  context.fillStyle = '#739f8c'
  context.font = '28px sans-serif'
  context.textAlign = 'right'
  context.fillText(`—— ${activeMessage.value.author}`, 1040, 650)
  context.font = '22px sans-serif'
  context.fillText(`${activeMessage.value.date} · 完成度 ${activeMessage.value.completion}%`, 1040, 710)
  canvas.toBlob((blob) => {
    if (!blob) {
      showNotice('图片生成失败', '当前浏览器暂时无法生成寄语图片，请稍后重试。')
      return
    }
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.download = `成长寄语-${activeMessage.value.date}.png`
    link.href = url
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    showNotice('寄语卡片已保存至相册', '图片已经生成并下载，可以留作纪念或分享给朋友。')
  }, 'image/png')
}

const closeOnEscape = (event) => {
  if (event.key !== 'Escape') return
  if (notice.open) notice.open = false
  else if (shareModalOpen.value) shareModalOpen.value = false
  else if (unlockSuccessOpen.value) unlockSuccessOpen.value = false
  else if (unlockModalOpen.value) unlockModalOpen.value = false
  else if (viewMode.value === 'detail') backToCollection()
}

onMounted(() => {
  const saved = localStorage.getItem('growth-messages')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) messages.value = parsed
    } catch {
      localStorage.removeItem('growth-messages')
    }
  }
  window.addEventListener('keydown', closeOnEscape)
})
onUnmounted(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <div class="message-page">
    <StudySidebar active="message" />
    <main class="message-main">
      <template v-if="viewMode === 'collection'">
        <header class="page-header">
          <div>
            <p class="eyebrow">成长给予的温柔回响</p>
            <h1>我的成长寄语集</h1>
            <p class="subtitle">这些被认真保存的句子，也在见证你成为更好的自己</p>
          </div>
          <div class="header-actions">
            <button class="unlock-button" type="button" @click="openUnlock">＋ 解锁寄语</button>
            <div class="filters">
              <select v-model="filterMonth" aria-label="筛选月份">
                <option value="all">全部月份</option>
                <option v-for="month in monthOptions" :key="month" :value="month">{{ Number(month) }}月</option>
              </select>
              <select v-model="filterYear" aria-label="筛选年份">
                <option value="all">全部年份</option>
                <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}年</option>
              </select>
            </div>
          </div>
        </header>
        <div class="rule"></div>

        <section class="message-grid" aria-label="成长寄语卡片">
          <button v-for="message in filteredMessages" :key="message.id" class="message-card" :class="[{ locked: !message.unlocked }, message.type === '成长寄语' ? 'growth' : 'student']" type="button" @click="openDetail(message)">
            <template v-if="message.unlocked">
              <div class="card-top"><span>{{ message.type }}</span><small>已解锁</small></div>
              <blockquote>“{{ message.quote }}”</blockquote>
              <div class="card-foot"><time>{{ message.date }}</time><span :class="{ active: message.favorite }">{{ message.favorite ? '★' : '☆' }}</span></div>
            </template>
            <template v-else>
              <span class="lock-icon" aria-hidden="true"></span>
              <strong>完成今日目标后解锁</strong>
              <small>点击查看解锁方式</small>
            </template>
          </button>
        </section>

        <p v-if="!filteredMessages.length" class="empty-filter">当前筛选条件下还没有寄语。</p>
        <footer class="collection-foot">今日自律解锁 · 写给你的成长寄语</footer>
      </template>

      <template v-else-if="activeMessage">
        <header class="page-header detail-heading">
          <div>
            <p class="eyebrow">成长寄语详情</p>
            <h1>我的成长寄语集</h1>
            <p class="subtitle">这份温柔提醒，值得在需要的时候重新读一遍</p>
          </div>
          <button class="back-button" type="button" @click="backToCollection">返回寄语集</button>
        </header>
        <div class="rule"></div>

        <section class="detail-layout">
          <article class="quote-card" :class="activeMessage.type === '成长寄语' ? 'growth' : 'student'">
            <div class="quote-top">
              <span>{{ activeMessage.type }}</span>
              <button type="button" :aria-label="activeMessage.favorite ? '取消收藏' : '收藏'" @click="toggleFavorite">{{ activeMessage.favorite ? '★ 已收藏' : '☆ 收藏' }}</button>
            </div>
            <blockquote>“{{ activeMessage.quote }}”</blockquote>
            <cite>—— {{ activeMessage.author }}</cite>
            <div class="quote-meta">
              <div><span>解锁时间</span><strong>{{ activeMessage.date }}</strong></div>
              <div><span>解锁条件</span><strong>当日任务完成度 · {{ activeMessage.completion }}%</strong></div>
            </div>
            <div class="quote-actions">
              <button class="heart-button" type="button" @click="toggleFavorite">{{ activeMessage.favorite ? '♥ 已收藏' : '♡ 收藏' }}</button>
              <button type="button" @click="saveAsImage">保存为图片</button>
              <button type="button" @click="shareModalOpen = true">分享</button>
            </div>
          </article>

          <aside class="detail-side">
            <section class="note-panel">
              <h2>寄语备注</h2>
              <textarea v-model="noteDraft" maxlength="160" placeholder="写下看到这句话时的心情"></textarea>
              <button type="button" @click="saveNote">保存备注</button>
            </section>
            <section class="privacy-panel">
              <h2>隐私状态</h2>
              <label><input :checked="activeMessage.privacy === 'private'" type="radio" name="privacy" @change="updatePrivacy('private')" />仅自己可见</label>
              <label><input :checked="activeMessage.privacy === 'friends'" type="radio" name="privacy" @change="updatePrivacy('friends')" />允许好友查看</label>
              <label><input :checked="activeMessage.privacy === 'public'" type="radio" name="privacy" @change="updatePrivacy('public')" />分享时公开此卡片</label>
            </section>
          </aside>
        </section>
      </template>
    </main>

    <div v-if="unlockModalOpen" class="modal-backdrop" @click.self="unlockModalOpen = false">
      <form class="form-modal" @submit.prevent="submitUnlock">
        <button class="modal-close" type="button" aria-label="关闭" @click="unlockModalOpen = false">×</button>
        <h2>解锁你的自律寄语</h2>
        <label><span>寄语内容</span><textarea v-model="unlockForm.quote" maxlength="120" placeholder="写下一句想在未来重新读到的话"></textarea></label>
        <label><span>署名（真实姓名、网名或昵称）</span><input v-model="unlockForm.author" maxlength="24" placeholder="例如：七月的自己" /></label>
        <fieldset><legend>寄语类型</legend><label><input v-model="unlockForm.type" value="成长寄语" type="radio" />成长寄语</label><label><input v-model="unlockForm.type" value="学生寄语" type="radio" />学生寄语</label></fieldset>
        <p class="form-tip">寄语会保存在你的个人寄语集中。你可以随时修改备注、收藏状态和分享范围。</p>
        <p class="form-error" aria-live="polite">{{ formError }}</p>
        <div class="modal-actions"><button class="secondary" type="button" @click="unlockModalOpen = false">取消</button><button class="primary" type="submit">确认解锁</button></div>
      </form>
    </div>

    <div v-if="unlockSuccessOpen" class="modal-backdrop" @click.self="closeUnlockSuccess(false)">
      <section class="result-modal" role="dialog" aria-modal="true">
        <div class="success-icon" aria-hidden="true"></div><h2>寄语已解锁送达</h2><p>这句话已经收进你的成长寄语集，愿它在需要时给你一点力量。</p>
        <div class="modal-actions"><button class="secondary" type="button" @click="closeUnlockSuccess(true)">继续解锁</button><button class="primary" type="button" @click="closeUnlockSuccess(false)">返回寄语集</button></div>
      </section>
    </div>

    <div v-if="shareModalOpen" class="modal-backdrop" @click.self="shareModalOpen = false">
      <section class="share-modal" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="关闭" @click="shareModalOpen = false">×</button><h2>寄语分享</h2>
        <div class="share-grid">
          <button v-for="item in [{name:'QQ',code:'Q'},{name:'微博',code:'微'},{name:'朋友圈',code:'圈'},{name:'微信',code:'微'},{name:'复制链接',code:'链'},{name:'保存图片',code:'图'}]" :key="item.name" type="button" @click="item.name === '保存图片' ? (shareModalOpen = false, saveAsImage()) : shareMessage(item.name)"><span>{{ item.code }}</span>{{ item.name }}</button>
        </div>
      </section>
    </div>

    <div v-if="notice.open" class="modal-backdrop" @click.self="notice.open = false">
      <section class="result-modal compact" role="dialog" aria-modal="true"><div class="success-icon" aria-hidden="true"></div><h2>{{ notice.title }}</h2><p>{{ notice.text }}</p><button class="primary single" type="button" @click="notice.open = false">知道了</button></section>
    </div>
  </div>
</template>

<style scoped>
.message-page{--green:#739f8c;--green-strong:#5d8f7a;--green-soft:#e5f2ec;--sand:#e6d4b5;--sand-soft:#faf5ec;--text:#5a514a;--muted:#978a80;min-height:100vh;display:flex;background:#f7f5f0;color:var(--text)}.message-main{flex:1;min-width:0;min-height:100vh;padding:var(--app-page-padding-y) var(--app-page-padding-x) 40px;background:#fff}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:28px}.eyebrow{margin:0 0 10px;color:var(--green);font-size:13px}.page-header h1{margin:0 0 12px;color:rgba(0,0,0,.7);font-size:var(--app-title-size);font-weight:400}.subtitle{margin:0;color:rgba(4,112,44,.5);font-size:16px}.header-actions{display:flex;align-items:flex-end;gap:14px}.unlock-button,.back-button{height:var(--app-control-height);border:1px solid var(--green);border-radius:var(--app-radius);padding:0 18px;background:var(--green);color:#fff;font:inherit;cursor:pointer}.back-button{background:#fff;color:var(--green)}.filters{display:flex;gap:8px}.filters select{height:var(--app-control-height);border:1px solid #bdd5ca;border-radius:var(--app-radius);padding:0 28px 0 10px;background:#fff;color:var(--text);font:inherit}.rule{height:1px;margin:26px 0 30px;background:var(--sand)}
.message-grid{display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:24px}.message-card{min-height:190px;border:1.5px solid var(--sand);border-radius:9px;padding:22px;display:flex;flex-direction:column;background:#fff;color:var(--text);font:inherit;text-align:left;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}.message-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(91,80,72,.1)}.message-card.growth{border-color:var(--green);background:#fbfefd}.card-top,.card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px}.card-top span{padding:5px 10px;border-radius:999px;background:var(--sand-soft);color:#8d7653;font-size:12px}.growth .card-top span{background:var(--green-soft);color:var(--green-strong)}.card-top small,.card-foot{color:var(--muted);font-size:11px}.message-card blockquote{flex:1;margin:25px 0 20px;color:#4e4843;font-family:serif;font-size:17px;font-weight:600;line-height:1.8}.card-foot span{color:#c4b69a;font-size:18px}.card-foot span.active{color:#d5ad12}.message-card.locked{align-items:center;justify-content:center;gap:10px;border-color:#d7d7d7;background:#f5f5f5;color:#aaa;text-align:center}.lock-icon{width:28px;height:24px;border:2px solid #bbb;border-radius:5px;position:relative}.lock-icon:before{content:'';position:absolute;left:5px;top:-16px;width:14px;height:16px;border:2px solid #bbb;border-bottom:0;border-radius:10px 10px 0 0}.message-card.locked strong{font-size:14px}.message-card.locked small{font-size:11px}.empty-filter,.collection-foot{text-align:center;color:var(--muted)}.empty-filter{padding:80px 20px}.collection-foot{margin-top:42px;font-size:13px;letter-spacing:4px}
.detail-layout{display:grid;grid-template-columns:minmax(480px,1fr) minmax(240px,320px);gap:28px}.quote-card{min-height:520px;border:1.5px solid var(--sand);border-radius:9px;padding:34px;display:flex;flex-direction:column;background:#fffdf9}.quote-card.growth{border-color:var(--green);background:#fbfefd}.quote-top{display:flex;justify-content:space-between;align-items:center}.quote-top>span{padding:6px 12px;border-radius:999px;background:var(--sand-soft);color:#8d7653;font-size:12px}.growth .quote-top>span{background:var(--green-soft);color:var(--green-strong)}.quote-top button{border:0;background:transparent;color:var(--text);font:inherit;cursor:pointer}.quote-card blockquote{margin:auto 5%;color:#4e4843;font-family:serif;font-size:clamp(25px,3vw,37px);font-weight:600;line-height:1.9;text-align:center}.quote-card cite{color:var(--green);font-size:14px;text-align:right}.quote-meta{margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.quote-meta>div{padding:16px;border-radius:7px;background:rgba(248,243,234,.75);display:grid;gap:7px}.quote-meta span{color:var(--muted);font-size:11px}.quote-meta strong{font-size:13px;font-weight:500}.quote-actions{margin-top:24px;display:flex;justify-content:flex-end;gap:10px}.quote-actions button{height:34px;border:1px solid #b9cfc5;border-radius:999px;padding:0 14px;background:#fff;color:var(--green-strong);font:inherit;font-size:12px;cursor:pointer}.quote-actions .heart-button{border-color:#efa7ad;color:#e56d7a}.detail-side{display:grid;align-content:start;gap:20px}.note-panel,.privacy-panel{border:1.5px solid var(--green);border-radius:8px;padding:22px}.note-panel{background:#f4faf7}.note-panel h2,.privacy-panel h2{margin:0 0 16px;color:var(--green-strong);font-size:19px;font-weight:500}.note-panel textarea{width:100%;min-height:92px;border:0;background:transparent;color:var(--text);font:inherit;line-height:1.6;resize:vertical;outline:none}.note-panel button{float:right;border:0;background:transparent;color:var(--green);font:inherit;font-size:12px;cursor:pointer}.privacy-panel{display:grid;gap:13px}.privacy-panel h2{margin-bottom:4px;color:var(--text)}.privacy-panel label{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px;cursor:pointer}.privacy-panel input{accent-color:var(--green)}
.modal-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:rgba(54,50,47,.36);backdrop-filter:blur(1px)}.form-modal,.result-modal,.share-modal{position:relative;width:min(520px,100%);border-radius:9px;padding:30px;background:#fff;box-shadow:0 24px 68px rgba(54,50,47,.2)}.form-modal h2,.result-modal h2,.share-modal h2{margin:0 0 24px;color:var(--text);font-size:24px}.form-modal>label{margin-top:18px;display:grid;gap:8px;color:var(--green);font-size:14px}.form-modal textarea,.form-modal input{border:1px solid #d8c8aa;border-radius:7px;padding:12px;color:var(--text);font:inherit;outline:none}.form-modal textarea{min-height:110px;resize:vertical}.form-modal textarea:focus,.form-modal input:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(115,159,140,.13)}.form-modal fieldset{margin-top:18px;border:0;display:flex;gap:20px;color:var(--muted);font-size:13px}.form-modal legend{width:100%;margin-bottom:10px;color:var(--green)}.form-modal fieldset label{display:flex;gap:6px}.form-modal input[type=radio]{accent-color:var(--green)}.form-tip{margin:18px 0 0;padding:14px;border-radius:7px;background:#eef7f3;color:#70847a;font-size:12px;line-height:1.6}.form-error{min-height:20px;margin:10px 0 0;color:#cf6f72;font-size:12px}.modal-close{position:absolute;top:12px;right:14px;width:30px;height:30px;border:0;background:transparent;color:var(--text);font-size:20px;cursor:pointer}.modal-actions{margin-top:22px;display:flex;justify-content:flex-end;gap:12px}.primary,.secondary{min-width:104px;height:38px;border-radius:6px;font:inherit;cursor:pointer}.primary{border:1px solid var(--green);background:var(--green);color:#fff}.secondary{border:1px solid #968f8a;background:#fff;color:#625b56}.result-modal{text-align:center}.result-modal p{margin:0;padding:14px;border-radius:7px;background:#eef7f3;color:#75867e;font-size:13px;line-height:1.7}.result-modal .modal-actions{justify-content:center}.result-modal.compact{width:min(430px,100%)}.primary.single{margin-top:20px}.success-icon{width:50px;height:50px;margin:0 auto 20px;border:2px solid var(--green);border-radius:50%;position:relative}.success-icon:before{content:'';position:absolute;left:14px;top:8px;width:14px;height:23px;border:solid var(--green);border-width:0 2px 2px 0;transform:rotate(45deg)}.share-modal{width:min(460px,100%)}.share-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.share-grid button{border:0;display:grid;justify-items:center;gap:8px;background:transparent;color:var(--muted);font:inherit;font-size:12px;cursor:pointer}.share-grid span{width:48px;height:48px;border-radius:9px;display:grid;place-items:center;background:var(--green-soft);color:var(--green-strong);font-weight:600}
@media(max-width:1080px){.message-grid{grid-template-columns:repeat(2,minmax(220px,1fr))}.detail-layout{grid-template-columns:1fr}.detail-side{grid-template-columns:1fr 1fr}}@media(max-width:768px){.message-page{display:block}.message-main{min-height:auto;padding:28px 16px 36px}.page-header{align-items:stretch;flex-direction:column}.header-actions{align-items:stretch;flex-direction:column}.filters{display:grid;grid-template-columns:1fr 1fr}.unlock-button,.back-button{width:100%}.message-grid{grid-template-columns:1fr}.detail-layout{grid-template-columns:1fr}.detail-side{grid-template-columns:1fr}.quote-card{min-height:460px;padding:24px 18px}.quote-meta{grid-template-columns:1fr}.quote-actions{flex-wrap:wrap}.form-modal,.result-modal,.share-modal{padding:26px 20px}.share-grid{gap:14px}}
</style>
