<template>
  <div class="app-container unified-theme" :class="timeOfDay === 'night' ? 'bg-night' : 'bg-day'">
    <div class="header bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="exitParentMode" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="flex-1 text-center">
          <h1 class="title-text font-semibold" style="color:#1E40AF">{{ currentPageTitle }}</h1>
          <p class="text-sm" style="color:#7F8C8D">{{ currentPageDescription }}</p>
        </div>
        
      </div>
    </div>

    <main class="content-area">
      <div class="mx-auto page-col px-6 py-8">
        <div class="section text-center">
          <div class="quote-wrap" :class="timeOfDay === 'night' ? 'quote-night' : 'quote-day'">
            <div class="quote-text">每一颗星星都有自己的光芒</div>
            <span class="star-dot dot1"></span>
            <span class="star-dot dot2"></span>
            <span class="star-dot dot3"></span>
            <span class="star-dot dot4"></span>
          </div>
        </div>
        <!-- 社交解码页面 -->
        <section v-show="activeTab === 'social'" class="section grid grid-cols-1 gap-6">
          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2"><span class="text-3xl" style="color:#4A90E2">👥</span><h3 class="font-semibold" style="color:#2C3E50">社交解码·家长监测</h3></div>
              <div class="flex items-center gap-2">
                <button id="arrangeBtn" class="btn btn-primary h-9 px-3" @click="arrangeNewPractice">安排新练习</button>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="rounded-lg p-4" style="background:#FFFFFF;border:1px solid #E5E7EB">
                <div class="text-xs" style="color:#7F8C8D">本月完成练习</div>
                <div class="text-2xl font-semibold" style="color:#2C3E50">{{ monthlyCount }}<span class="text-sm ml-1" style="color:#7F8C8D">个</span></div>
              </div>
              <div class="rounded-lg p-4" style="background:#FFFFFF;border:1px solid #E5E7EB">
                <div class="text-xs" style="color:#7F8C8D">平均表现得分</div>
                <div class="text-2xl font-semibold" style="color:#2C3E50">{{ avgScore }}<span class="text-sm ml-1" style="color:#7F8C8D">%</span></div>
              </div>
              <div class="rounded-lg p-4" style="background:#FFFFFF;border:1px solid #E5E7EB">
                <div class="text-xs" style="color:#7F8C8D">社交理解能力</div>
                <div class="text-2xl font-semibold" style="color:#50C878">+{{ improvementPct }}<span class="text-sm ml-1" style="color:#7F8C8D">%</span></div>
              </div>
              <div class="rounded-lg p-4" style="background:#FFFFFF;border:1px solid #E5E7EB">
                <div class="text-xs" style="color:#7F8C8D">最新练习时间</div>
                <div class="text-lg font-medium" style="color:#2C3E50">{{ latestPracticeTime }}</div>
              </div>
            </div>
            <div class="mt-4 practice-record-heatmap">
              <div class="text-xs mb-2" style="color:#7F8C8D">近7天练习频次</div>
              <div class="frequency-grid">
                <div v-for="(d, i) in last7Detailed" :key="`left-freq-${i}`" class="frequency-day" :class="freqClass(d.count)" :title="weekdayTitle(i, d.count)">
                  <span class="day-label">{{ weekdayLabel(i) }}</span>
                  <span class="count">{{ d.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="text-xs mb-2" style="color:#7F8C8D">社交情境输入</div>
            <textarea id="situationInput" v-model="socialInput" class="w-full rounded border px-3 py-2 text-sm" rows="3" placeholder="例如：在操场上，两个小朋友邀请我一起玩，但我有点紧张"></textarea>
            <div class="mt-3 flex items-center gap-2">
              <button id="analyzeBtn" class="btn btn-primary h-9 px-3" @click="analyzeSocialSituation">分析社交情境</button>
            </div>
            <div id="analysisResult" style="display:none" class="mt-4">
            </div>
          </div>

          <div v-if="showPracticeModal" class="modal">
            <div class="modal-content">
              <h3 class="font-semibold mb-3">安排新练习</h3>
              <form id="practiceForm" @submit.prevent="onPracticeSubmit" class="space-y-3">
                <div class="form-group">
                  <label class="text-sm mb-1">情境类型</label>
                  <select id="situationType" v-model="practiceForm.situationType" class="w-full rounded border px-3 py-2 text-sm">
                    <option value="joinGame">加入游戏</option>
                    <option value="expressNeeds">表达需求</option>
                    <option value="handleConflict">处理冲突</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="text-sm mb-1">难度级别</label>
                  <select id="difficultyLevel" v-model="practiceForm.difficultyLevel" class="w-full rounded border px-3 py-2 text-sm">
                    <option value="beginner">初级</option>
                    <option value="intermediate">中级</option>
                    <option value="advanced">高级</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="text-sm inline-flex items-center gap-2">
                    <input id="startImmediately" type="checkbox" v-model="practiceForm.startImmediately" /> 立即开始
                  </label>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
                  <button type="submit" class="btn btn-primary">确认安排</button>
                </div>
              </form>
            </div>
          </div>

          <div v-if="showDetailsModal" class="modal">
            <div class="modal-content">
              <h3 class="font-semibold mb-3">练习详情</h3>
              <div class="space-y-2 text-sm" v-if="practiceDetails">
                <div><span class="font-medium">练习名称：</span>{{ practiceDetails.title }}</div>
                <div><span class="font-medium">表现评分：</span>{{ practiceDetails.score }}</div>
                <div><span class="font-medium">完成时间：</span>{{ practiceDetails.date }}</div>
                <div><span class="font-medium">练习时长：</span>{{ practiceDetails.duration }}</div>
                <div>
                  <span class="font-medium">应用策略：</span>
                  <ul class="list-disc pl-5 mt-1">
                    <li v-for="s in practiceDetails.strategies" :key="s">{{ s }}</li>
                  </ul>
                </div>
              </div>
              <div class="form-actions mt-4">
                <button class="btn btn-primary" @click="closeModal">关闭</button>
              </div>
            </div>
          </div>

          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p class="text-sm mt-2">分析中...</p>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#4A90E2">🗓️</span><h3 class="font-semibold" style="color:#2C3E50">近期练习记录</h3></div></div>
            <div class="space-y-2">
              <div v-for="ph in practiceHistory" :key="ph.ts" class="rounded-lg border p-3 flex items-center justify-between" style="border-color:#E5E7EB;background:#FFFFFF">
                <div>
                  <div class="text-sm font-medium" style="color:#2C3E50">{{ ph.scenario }}</div>
                  <div class="text-xs" style="color:#7F8C8D">{{ new Date(ph.ts).toLocaleString() }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold" :style="{ color: ph.score >= 75 ? '#50C878' : ph.score >= 60 ? '#4A90E2' : '#FF7E5A' }">{{ ph.score }}%</span>
                  <button class="btn btn-primary h-8 px-3 text-xs" @click="viewPracticeDetail(ph)">查看详情</button>
                </div>
              </div>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#4A90E2">📊</span><h3 class="font-semibold" style="color:#2C3E50">能力发展分析</h3></div></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div class="flex items-center gap-6">
                <svg :width="socialRadarSize" :height="socialRadarSize">
                  <g>
                    <circle :cx="socialRadarCenter" :cy="socialRadarCenter" :r="socialRadarRadius" fill="none" stroke="#E5E7EB" />
                    <line v-for="i in socialLabels.length" :key="i" :x1="socialRadarCenter" :y1="socialRadarCenter" :x2="socialAxis[i-1].x" :y2="socialAxis[i-1].y" stroke="#E5E7EB" />
                    <polygon :points="socialRadarPoints" fill="#4A90E233" stroke="#4A90E2" stroke-width="2" />
                  </g>
                </svg>
                <div class="flex-1 grid grid-cols-1 gap-2">
                  <div v-for="(lab,i) in socialLabels" :key="lab" class="text-sm" style="color:#2C3E50">{{ lab }}：{{ socialData[i] }}%</div>
                </div>
              </div>
              <div>
                <svg :width="socialTrendWidth" :height="socialTrendHeight">
                  <polyline :points="socialTrendPoints" fill="none" stroke="#50C878" stroke-width="2" />
                  <circle v-for="p in socialTrendDots" :key="p.x" :cx="p.x" :cy="p.y" r="2.5" :fill="'#50C878'" />
                </svg>
                <div class="text-xs mt-2" style="color:#7F8C8D">月度进步趋势</div>
              </div>
              <div class="flex items-center justify-center">
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="62" stroke="#E5E7EB" stroke-width="10" fill="none" />
                  <circle cx="75" cy="75" r="62" :stroke-dasharray="completionCircumference" :stroke-dashoffset="completionOffset" stroke="#50C878" stroke-width="10" fill="none" transform="rotate(-90 75 75)" />
                  <text x="75" y="82" text-anchor="middle" font-size="18" fill="#2C3E50">{{ completionPct }}%</text>
                </svg>
              </div>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#4A90E2">💡</span><h3 class="font-semibold" style="color:#2C3E50">个性化建议</h3></div></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="rounded-lg p-3" style="background:#F8F9FA">
                <div class="text-sm font-medium mb-1" style="color:#2C3E50">改进建议</div>
                <ul class="list-disc pl-5 text-sm" style="color:#7F8C8D">
                  <li v-for="s in improvementTips" :key="s">{{ s }}</li>
                </ul>
              </div>
              <div class="rounded-lg p-3" style="background:#F8F9FA">
                <div class="text-sm font-medium mb-1" style="color:#2C3E50">下一步练习重点</div>
                <ul class="list-disc pl-5 text-sm" style="color:#7F8C8D">
                  <li v-for="r in nextRecommendations" :key="r">{{ r }}</li>
                </ul>
              </div>
              <div class="rounded-lg p-3" style="background:#F8F9FA">
                <div class="text-sm font-medium mb-1" style="color:#2C3E50">家庭互动指导</div>
                <ul class="list-disc pl-5 text-sm" style="color:#7F8C8D">
                  <li v-for="g in familyGuidance" :key="g">{{ g }}</li>
                </ul>
              </div>
            </div>
            <div v-if="toastMsg" class="mt-3 text-xs" :style="{ color: toastColor }">{{ toastMsg }}</div>
          </div>
          <div v-if="false">
          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">👥</span><h3 class="font-semibold" style="color:#1E40AF">社交解码专家</h3></div>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <div class="text-sm mb-1">社交情境输入</div>
                <textarea v-model="socialInput" class="w-full rounded border px-3 py-2 text-sm" rows="3" placeholder="例如：在操场上，两个小朋友邀请我一起玩，但我有点紧张"></textarea>
              </div>
              <div class="flex gap-2">
                <button @click="analyzeSocial" class="rounded bg-[#1E40AF] text-white h-9 px-3">生成策略</button>
                <button @click="goPractice" class="rounded bg-[#10B981] text白 h-9 px-3">虚拟练习</button>
              </div>
              <div v-if="strategies.length" class="rounded-lg border p-4" style="border-color:#10B981;background:#F0FFF7">
                <div class="text-sm font-medium mb-2" style="color:#1E40AF">AI建议的社交策略</div>
                <ul class="list-disc pl-5 text-sm text-gray-700">
                  <li v-for="s in strategies" :key="s">{{ s }}</li>
                </ul>
              </div>
              <div class="rounded-lg border p-4" style="border-color:#1E40AF;background:#F0F7FF">
                <div class="text-sm font-medium mb-2" style="color:#1E40AF">学习进度</div>
                <div class="h-3 w-full rounded-full overflow-hidden bg-gray-200">
                  <div class="h-3 bg-[#10B981]" :style="{ width: socialProgress + '%' }"></div>
                </div>
                <div class="text-xs mt-2 text-gray-600">完成度：{{ socialProgress }}%</div>
              </div>
            </div>
          </div>
          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#1E40AF">🗂️</span><h3 class="font-semibold" style="color:#1E40AF">社交情境库</h3></div></div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button v-for="sc in socialScenarios" :key="sc.id" class="scenario-card rounded-2xl p-4 text-left shadow-sm" :style="{ border:'1.5px solid #1E40AF', background:'#F0F7FF' }" @click="applyScenario(sc)">
                <div class="text-sm font-medium" style="color:#1E40AF">{{ sc.title }}</div>
                <div class="text-xs text-gray-600 mt-1">{{ sc.desc }}</div>
                <div class="mt-3 flex items-center justify-between">
                  <button class="btn btn-success h-8 px-3 text-xs" @click.stop="goPracticeFor(sc)">练习</button>
                  <svg width="48" height="48" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" stroke="#E5E7EB" stroke-width="8" fill="none" />
                    <circle :stroke-dasharray="circumference" :stroke-dashoffset="ringOffset(sc.mastery)" cx="60" cy="60" r="52" stroke="#10B981" stroke-width="8" fill="none" transform="rotate(-90 60 60)" />
                    <text x="60" y="66" text-anchor="middle" font-size="16" fill="#1E40AF">{{ sc.mastery }}%</text>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#10B981">⭐</span><h3 class="font-semibold" style="color:#1E40AF">策略收藏夹</h3></div></div>
            <div class="space-y-3">
              <div class="flex gap-2">
                <input v-model="favoriteInput" class="flex-1 rounded border px-3 py-2 text-sm" placeholder="输入策略要点，如：先打招呼，再等轮到我" />
                <button class="btn btn-primary h-9 px-3" @click="addFavorite">收藏</button>
              </div>
              <div v-if="favorites.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="fav in favorites" :key="fav.id" class="rounded-lg border p-3 flex items-center justify-between" style="border-color:#10B981;background:#F0FFF7">
                  <div class="text-sm text-gray-700">{{ fav.title }}</div>
                  <div class="flex items-center gap-2">
                    <button class="btn btn-primary h-8 px-2 text-xs" @click="applyFavorite(fav)">应用</button>
                    <button class="btn btn-danger h-8 px-2 text-xs" @click="removeFavorite(fav.id)">移除</button>
                  </div>
                </div>
              </div>
              <div v-else class="text-xs text-gray-500">暂无收藏策略</div>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#1E40AF">📈</span><h3 class="font-semibold" style="color:#1E40AF">练习记录与热力图</h3></div></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div class="space-y-2">
                  <div v-for="ph in practiceHistory" :key="ph.ts" class="rounded-lg border p-3" style="border-color:#1E40AF;background:#F0F7FF">
                    <div class="text-sm font-medium" style="color:#1E40AF">{{ ph.scenario }}</div>
                    <div class="text-xs text-gray-600">得分：{{ ph.score }}，时间：{{ new Date(ph.ts).toLocaleString() }}</div>
                  </div>
                </div>
              </div>
              <div>
                <div class="practice-frequency">
                  <h4 class="text-sm font-medium" style="color:#1E40AF">近七天练习频次</h4>
                  <div class="frequency-grid">
                    <div v-for="(d, i) in last7Detailed" :key="`freq-${i}`" class="frequency-day" :class="freqClass(d.count)" :title="weekdayTitle(i, d.count)">
                      <span class="day-label">{{ weekdayLabel(i) }}</span>
                      <span class="count">{{ d.count }}</span>
                    </div>
                  </div>
                  <div class="frequency-legend">
                    <span class="legend-item">
                      <span class="legend-color frequency-0"></span>
                      <span>0次</span>
                    </span>
                    <span class="legend-item">
                      <span class="legend-color frequency-2"></span>
                      <span>1-2次</span>
                    </span>
                    <span class="legend-item">
                      <span class="legend-color frequency-4"></span>
                      <span>3-5次</span>
                    </span>
                  </div>
                  <div class="detailed-statistics">
                    <h5>详细统计</h5>
                    <div class="stats-grid">
                      <div class="stat-item">
                        <span class="stat-value">{{ totalPractices }}</span>
                        <span class="stat-label">总练习次数</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-value">{{ averagePerDay }}</span>
                        <span class="stat-label">日均次数</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-value">{{ bestDay }}</span>
                        <span class="stat-label">最佳练习日</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        <!-- 情绪识别页面 -->
        <section v-show="activeTab === 'emotion'" class="section grid grid-cols-1 gap-6">
          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2"><span class="text-3xl" style="color:#4A90E2">🙂</span><h3 class="font-semibold" style="color:#2C3E50">情绪识别系统</h3></div>
            </div>
            <div class="mb-4">
              <svg :width="chartWidth" :height="chartHeight">
                <polyline :points="chartPoints" fill="none" stroke="#4A90E2" stroke-width="2" />
                <polyline :points="chartPointsAvg" fill="none" stroke="#50C878" stroke-width="2" opacity="0.6" />
                <circle v-for="p in chartDots" :key="p.x" :cx="p.x" :cy="p.y" r="2.5" fill="#10B981" />
              </svg>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div class="rounded-lg p-3" style="background:#F0F7FF">
                <div class="text-sm font-medium mb-2" style="color:#1E40AF">多模态监测说明</div>
                <div class="text-sm text-gray-700">整合面部表情、眼动与肢体语言，实现更客观一致的评估。</div>
              </div>
              <div class="rounded-lg p-3" style="background:#F0FFF7">
                <div class="text-sm font-medium mb-2" style="color:#1E40AF">情绪调节建议</div>
                <ul class="list-disc pl-5 text-sm text-gray-700">
                  <li>深呼吸与数数，降低紧张</li>
                  <li>使用“情绪卡片”表达感受</li>
                  <li>在安静角落短暂休息</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#1E40AF">📅</span><h3 class="font-semibold" style="color:#1E40AF">情绪日历</h3></div></div>
            <div class="grid grid-cols-7 gap-1">
              <button v-for="d in emotionCalendarDays" :key="d.id" class="calendar-cell rounded text-xs h-8 flex items-center justify-center" :style="{ background: d.color }" @click="selectDay(d)">{{ d.day }}</button>
            </div>
            <div v-if="selectedDay" class="mt-3 rounded-lg border p-3" style="border-color:#10B981;background:#F0FFF7">
              <div class="text-sm font-medium" style="color:#1E40AF">{{ selectedDay.label }}</div>
              <div class="text-xs text-gray-600 mt-1">触发事件：{{ selectedDay.trigger }}</div>
              <div class="text-xs text-gray-600 mt-1">强度：{{ selectedDay.intensity }}%</div>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#10B981">⏱️</span><h3 class="font-semibold" style="color:#1E40AF">实时情绪仪表盘</h3></div></div>
            <div class="flex items-center gap-6">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="#F0F7FF" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="#E5E7EB" stroke-width="10" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="#4A90E2" stroke-width="10" :stroke-dasharray="gaugeCircumference" :stroke-dashoffset="gaugeOffset" transform="rotate(-90 70 70)" />
                <text x="70" y="76" text-anchor="middle" font-size="18" fill="#1E40AF">{{ currentEmotionIntensity }}%</text>
              </svg>
              <div class="flex-1">
                <div class="text-sm font-medium" style="color:#1E40AF">当前情绪强度</div>
                <div class="h-2 w-full rounded-full overflow-hidden bg-gray-200 mt-2"><div class="h-2" :style="{ width: currentEmotionIntensity + '%', background: '#10B981' }"></div></div>
              </div>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-2xl" style="color:#1E40AF">🧩</span><h3 class="font-semibold" style="color:#1E40AF">触发因素分析</h3></div></div>
            <div class="flex items-center gap-2 mb-3">
              <select v-model="timeRange" class="rounded border px-2 py-1 text-sm">
                <option value="7">过去7天</option>
                <option value="14">过去14天</option>
                <option value="30">过去30天</option>
              </select>
            </div>
            <div class="space-y-2">
              <div v-for="tg in filteredTriggers" :key="tg.label" class="rounded-lg border p-3 flex items-center justify-between" style="border-color:#1E40AF;background:#F0F7FF">
                <div class="text-sm text-gray-700">{{ tg.label }}</div>
                <div class="text-xs" style="color:#1E40AF">{{ tg.count }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 干预引擎页面 -->
        <section v-show="activeTab === 'intervention'" class="section grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">🧠</span><h3 class="font-semibold" style="color:#1E40AF">个性化训练方案</h3></div>
            </div>
            <div class="space-y-3">
              <div v-for="(item, idx) in plan" :key="idx" class="rounded-lg border p-3 flex items-center justify-between" style="border-color:#1E40AF;background:#F0F7FF">
                <div class="text-sm text-gray-700">{{ item.name }}</div>
                <div class="text-xs" :class="item.level==='高' ? 'text-red-500' : item.level==='中' ? 'text-[#1E40AF]' : 'text-[#10B981]'">难度：{{ item.level }}</div>
              </div>
            </div>
          </div>
          <div class="standard-card card-success">
            <div class="flex items-center justify之间 mb-4">
              <div class="flex items-center gap-2"><span class="text-3xl" style="color:#10B981">📚</span><h3 class="font-semibold" style="color:#1E40AF">方案调整记录</h3></div>
            </div>
            <div class="space-y-3">
              <div v-for="adj in adjustments" :key="adj.id" class="rounded-lg border p-3" style="border-color:#10B981;background:#F0FFF7">
                <div class="text-sm font-medium" style="color:#1E40AF">{{ adj.title }}</div>
                <div class="text-xs text-gray-700 mt-1">依据：{{ adj.reason }}</div>
                <div class="text-xs text-gray-600 mt-1">时间：{{ new Date(adj.ts).toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">🕸️</span><h3 class="font-semibold" style="color:#1E40AF">能力发展雷达图</h3></div></div>
            <div class="flex items-center gap-6">
              <svg :width="radarSize" :height="radarSize">
                <g>
                  <circle :cx="radarCenter" :cy="radarCenter" :r="radarRadius" fill="none" stroke="#E5E7EB" />
                  <line v-for="i in radarLabels.length" :key="i" :x1="radarCenter" :y1="radarCenter" :x2="axisPoints[i-1].x" :y2="axisPoints[i-1].y" stroke="#E5E7EB" />
                  <polygon :points="radarPoints" fill="#4A90E233" stroke="#4A90E2" stroke-width="2" />
                </g>
              </svg>
              <div class="flex-1 grid grid-cols-2 gap-3">
                <div v-for="(lab, i) in radarLabels" :key="lab" class="text-sm text-gray-700">{{ lab }}：{{ radarData[i] }}%</div>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-3xl" style="color:#10B981">🏷️</span><h3 class="font-semibold" style="color:#1E40AF">训练内容覆盖领域</h3></div></div>
            <div class="flex flex-wrap gap-2">
              <span v-for="d in coverageDomains" :key="d" class="rounded-full px-3 py-1 text-xs" style="background:#F8F9FA; color:#4A90E2; border:1px solid #4A90E2">{{ d }}</span>
            </div>
          </div>
        </section>

        <!-- 康复监测页面 -->
        <section v-show="activeTab === 'recovery'" class="section grid grid-cols-1 gap-6">
          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">📈</span><h3 class="font-semibold" style="color:#1E40AF">能力进展图表</h3></div></div>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="m in progressMetrics" :key="m.label" class="rounded-lg p-3" style="background:#FFFFFF;border:1px solid #E5E7EB">
                <div class="text-sm font-medium" style="color:#2C3E50">{{ m.label }}</div>
                <div class="h-3 w-full rounded-full overflow-hidden bg-gray-200 mt-2"><div class="h-3" :style="{ width: m.value + '%', background: 'linear-gradient(90deg, #4A90E2, #3A80D2)' }"></div></div>
                <div class="text-xs mt-1 text-gray-600">{{ m.value }}%</div>
              </div>
            </div>
          </div>

          <div class="standard-card card-success">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-3xl" style="color:#10B981">🕒</span><h3 class="font-semibold" style="color:#1E40AF">里程碑时间线</h3></div></div>
            <div class="space-y-3">
              <div v-for="ms in milestones" :key="ms.id" class="rounded-lg border p-3" style="border-color:#10B981;background:#F0FFF7">
                <div class="text-sm font-medium" style="color:#1E40AF">{{ ms.title }}</div>
                <div class="text-xs text-gray-600 mt-1">{{ new Date(ms.ts).toLocaleDateString() }}</div>
              </div>
            </div>
          </div>

          <div class="standard-card card-primary">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">📝</span><h3 class="font-semibold" style="color:#1E40AF">专业报告与预警</h3></div></div>
            <div class="flex items-center gap-3 mb-3">
              <button @click="generateRecoveryReport" class="btn btn-primary h-9 px-3">生成报告</button>
              <span class="text-xs text-gray-600" v-if="reportMsg">{{ reportMsg }}</span>
            </div>
            <div class="rounded-lg border p-3" style="border-color:#FF7E5A;background:#FFF3EE">
              <div class="text-sm font-medium mb-1" style="color:#FF7E5A">预警提示</div>
              <div class="text-xs text-gray-700">近期社交参与度下降，建议联系康复师调整训练频率并增加同伴互动环节。</div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <nav class="bottom-nav">
      <button @click="setTab('social')" class="nav-item" :class="activeTab === 'social' ? 'active' : ''"><div class="nav-icon">👥</div><div class="nav-text">社交解码</div></button>
      <button @click="setTab('emotion')" class="nav-item" :class="activeTab === 'emotion' ? 'active' : ''"><div class="nav-icon">🙂</div><div class="nav-text">情绪识别</div></button>
      <button @click="setTab('intervention')" class="nav-item" :class="activeTab === 'intervention' ? 'active' : ''"><div class="nav-icon">🧠</div><div class="nav-text">干预引擎</div></button>
      <button @click="setTab('recovery')" class="nav-item" :class="activeTab === 'recovery' ? 'active' : ''"><div class="nav-icon">📊</div><div class="nav-text">康复监测</div></button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { setMode } from '@/lib/mode'
import { useUserStore } from '@/stores/user'
import { getEmotionTrend } from '@/lib/mode'

const router = useRouter()
const userStore = useUserStore()
const timeOfDay = ref<'day' | 'night'>('day')
const theme = useThemeStore()


const activeTab = ref<'social'|'emotion'|'intervention'|'recovery'>('social')
const setTab = (t: 'social'|'emotion'|'intervention'|'recovery') => { activeTab.value = t }

const pageTitles: Record<string, { title: string; desc: string }> = {
  social: { title: '社交解码', desc: '家长监测' },
  emotion: { title: '情绪识别', desc: '多模态分析' },
  intervention: { title: '干预引擎', desc: '个性化训练' },
  recovery: { title: '康复监测', desc: '进展与预警' }
}
const currentPageTitle = computed(() => pageTitles[activeTab.value].title)
const currentPageDescription = computed(() => pageTitles[activeTab.value].desc)

const exitParentMode = () => {
  setMode('child')
  try { userStore.update({ mode: 'child' }) } catch {}
  try { window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: 'child' } })) } catch {}
  try { router.push('/dashboard/child') } catch {}
}

const socialInput = ref('')
const strategies = ref<string[]>([])
const socialProgress = ref<number>(20)
const socialScenarios = ref([
  { id: 'sc1', title: '加入游戏', desc: '观察规则，礼貌请求加入', mastery: 40 },
  { id: 'sc2', title: '表达需求', desc: '用简明短句表达', mastery: 55 },
  { id: 'sc3', title: '处理冲突', desc: '先冷静，再提出解决方案', mastery: 30 },
  { id: 'sc4', title: '等待轮次', desc: '遵守轮换顺序', mastery: 65 },
  { id: 'sc5', title: '求助老师', desc: '清楚描述问题与请求', mastery: 50 },
  { id: 'sc6', title: '认识新同伴', desc: '自我介绍与简单问候', mastery: 45 }
])
const ringR = 52
const circumference = 2 * Math.PI * ringR
const ringOffset = (m: number) => circumference * (1 - Math.max(0, Math.min(100, m)) / 100)
const favoriteInput = ref('')
const favorites = ref<{ id: string; title: string }[]>([])
const addFavorite = () => {
  const t = favoriteInput.value.trim()
  if (!t) return
  favorites.value = [{ id: String(Date.now()), title: t }, ...favorites.value]
  favoriteInput.value = ''
}
const removeFavorite = (id: string) => { favorites.value = favorites.value.filter(f => f.id !== id) }
const applyFavorite = (fav: { id: string; title: string }) => { strategies.value = [fav.title] }
const applyScenario = (sc: { title: string; desc: string; mastery: number }) => { socialInput.value = sc.desc; analyzeSocial() }
const goPracticeFor = (sc: { title: string }) => { try { router.push({ path: '/social-game/activities', query: { scenario: sc.title } }) } catch {} }
const practiceHistory = ref<{ ts: number; scenario: string; score: number }[]>([
  { ts: Date.now() - 0.2 * 86400000, scenario: '加入游戏', score: 85 },
  { ts: Date.now() - 1 * 86400000, scenario: '表达需求', score: 72 },
  { ts: Date.now() - 2 * 86400000, scenario: '处理冲突', score: 65 },
])
 
const getLast7Days = () => { return Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0); return d }) }
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
const storagePracticeHistory = computed<any[]>(() => { try { const raw = localStorage.getItem('practiceHistory'); return raw ? JSON.parse(raw) : [] } catch { return [] } })
const last7Detailed = computed(() => {
  const days = getLast7Days()
  const list = storagePracticeHistory.value.length ? storagePracticeHistory.value : practiceHistory.value
  return days.map(day => {
    const count = list.filter((p: any) => {
      const dt = p.date ? new Date(p.date) : new Date(p.ts)
      return isSameDay(dt, day)
    }).length
    return { date: day, count }
  })
})
const freqClass = (v: number) => { const n = Math.max(0, Math.min(5, v)); return `frequency-${n}` }
const weekdayLabel = (i: number) => { const d = last7Detailed.value[i]?.date?.getDay?.() ?? new Date().getDay(); return ['日','一','二','三','四','五','六'][d] }
const weekdayTitle = (i: number, v: number) => { const label = weekdayLabel(i); return `周${label}: ${v}次练习` }
const totalPractices = computed(() => last7Detailed.value.reduce((a, b) => a + (b.count || 0), 0))
const averagePerDay = computed(() => Math.round((totalPractices.value / 7) * 100) / 100)
const bestDay = computed(() => { if (!last7Detailed.value.length) return '-'; let idx = 0; for (let i = 1; i < last7Detailed.value.length; i++) { if (last7Detailed.value[i].count > last7Detailed.value[idx].count) idx = i } const d = last7Detailed.value[idx].date.getDay(); return `周${['日','一','二','三','四','五','六'][d]}` })
const monthlyCount = computed(() => {
  const cutoff = Date.now() - 30 * 86400000
  return practiceHistory.value.filter(h => h.ts >= cutoff).length
})
const avgScore = computed(() => {
  if (!practiceHistory.value.length) return 0
  const s = practiceHistory.value.reduce((a, b) => a + b.score, 0)
  return Math.round((s / practiceHistory.value.length) * 100) / 100
})
const latestPracticeTime = computed(() => {
  if (!practiceHistory.value.length) return '-'
  const latest = practiceHistory.value[0]
  return new Date(latest.ts).toLocaleString()
})
const socialLabels = ['表情识别','意图理解','情境应对','社交规则','沟通表达']
const socialData = ref<number[]>([72, 68, 65, 70, 66])
const socialRadarSize = 180
const socialRadarCenter = socialRadarSize / 2
const socialRadarRadius = 70
const socialAxis = computed(() => {
  const n = socialLabels.length
  return Array.from({ length: n }, (_, i) => {
    const ang = (Math.PI * 2 * i) / n
    return {
      x: socialRadarCenter + socialRadarRadius * Math.sin(ang),
      y: socialRadarCenter - socialRadarRadius * Math.cos(ang)
    }
  })
})
const socialRadarPoints = computed(() => {
  const n = socialLabels.length
  return socialData.value.map((v, i) => {
    const ang = (Math.PI * 2 * i) / n
    const r = socialRadarRadius * (v / 100)
    const x = socialRadarCenter + r * Math.sin(ang)
    const y = socialRadarCenter - r * Math.cos(ang)
    return `${x},${y}`
  }).join(' ')
})
const socialTrend = ref<number[]>([60, 62, 64, 68, 71, 74, 75, 78])
const socialTrendWidth = 300
const socialTrendHeight = 80
const socialTrendPadding = 10
const socialTrendPoints = computed(() => {
  const n = socialTrend.value.length
  const stepX = (socialTrendWidth - socialTrendPadding * 2) / (n - 1)
  const maxY = 100
  return socialTrend.value.map((v, i) => {
    const x = socialTrendPadding + i * stepX
    const y = socialTrendPadding + (socialTrendHeight - socialTrendPadding * 2) * (1 - v / maxY)
    return `${x},${y}`
  }).join(' ')
})
const socialTrendDots = computed(() => {
  const n = socialTrend.value.length
  const stepX = (socialTrendWidth - socialTrendPadding * 2) / (n - 1)
  return socialTrend.value.map((v, i) => {
    const x = socialTrendPadding + i * stepX
    const y = socialTrendPadding + (socialTrendHeight - socialTrendPadding * 2) * (1 - v / 100)
    return { x, y }
  })
})
const improvementPct = computed(() => {
  const first = socialTrend.value[0]
  const last = socialTrend.value[socialTrend.value.length - 1]
  return Math.max(0, last - first)
})
const completionPct = computed(() => Math.round(avgScore.value))
const completionR = 62
const completionCircumference = 2 * Math.PI * completionR
const completionOffset = computed(() => completionCircumference * (1 - completionPct.value / 100))
const plannedExercises = ref<{ id: string; title: string; ts: number }[]>([])
const toastMsg = ref('')
const toastColor = computed(() => '#4A90E2')
const showPracticeModal = ref(false)
const showDetailsModal = ref(false)
const loading = ref(false)
const practiceForm = ref<{ situationType: 'joinGame'|'expressNeeds'|'handleConflict'; difficultyLevel: 'beginner'|'intermediate'|'advanced'; startImmediately: boolean }>({ situationType: 'joinGame', difficultyLevel: 'beginner', startImmediately: false })
const practiceDetails = ref<{ title: string; score: string; date: string; duration: string; strategies: string[] } | null>(null)
const closeModal = () => { showPracticeModal.value = false; showDetailsModal.value = false }
const arrangeNewPractice = () => { showPracticeModal.value = true }
const onPracticeSubmit = () => {
  const id = String(Date.now())
  const titleMap: Record<string,string> = { joinGame: '加入游戏', expressNeeds: '表达需求', handleConflict: '处理冲突' }
  const title = `${titleMap[practiceForm.value.situationType]}·${practiceForm.value.difficultyLevel === 'beginner' ? '初级' : practiceForm.value.difficultyLevel === 'intermediate' ? '中级' : '高级'}`
  plannedExercises.value = [{ id, title, ts: Date.now() }, ...plannedExercises.value]
  closeModal(); toastMsg.value = '已创建练习计划'; setTimeout(() => toastMsg.value = '', 1500)
}
const viewPracticeDetail = (ph: { scenario: string }) => {
  practiceDetails.value = { title: ph.scenario, score: '85%', date: new Date().toLocaleString(), duration: '12分钟', strategies: ['观察游戏情况', '友好接近', '明确表达加入意愿'] }
  showDetailsModal.value = true
}
const improvementTips = computed(() => {
  const idx = socialData.value.indexOf(Math.min(...socialData.value))
  const focus = socialLabels[idx]
  return [`加强${focus}训练，增加情境讨论`, '使用镜像反馈提升识别准确度', '引导孩子用短句描述他人意图']
})
const nextRecommendations = ref(['同伴互动·加入游戏', '表达需求·轮次等待', '情境应对·情绪管理'])
const familyGuidance = ref(['每日复盘一次社交事件', '家长示范轮换与礼貌用语', '设置安静角落作为情绪缓冲区'])
const analyzeSocial = () => {
  const base = socialInput.value.trim() ? '针对你的情境' : '通用建议'
  loading.value = true
  setTimeout(() => {
    loading.value = false
    strategies.value = [
      `${base}：先观察他人的肢体语言与语气`,
      '用简短问候开启互动，例如“我可以一起玩吗？”',
      '遵循轮换与分享规则，表达赞赏',
      '遇到不确定时，使用“请你再说一遍可以吗？”',
    ]
    socialProgress.value = Math.min(100, socialProgress.value + 10)
  }, 1000)
}
const goPractice = () => { try { router.push('/social-game/activities') } catch {} }
 
 
const showMessage = (text: string, type: 'info'|'success') => {
  const msg = document.createElement('div')
  msg.className = `message ${type}`
  msg.textContent = text
  document.body.appendChild(msg)
  setTimeout(() => msg.remove(), 3000)
}
const displayAnalysisResult = (result: { strategies: string[]; difficulty: string; estimatedTime: string }) => {
  const el = document.getElementById('analysisResult')
  if (!el) return
  el.innerHTML = `
    <h3 class="font-semibold mb-2">分析结果</h3>
    <div class="result-meta"><span class="difficulty-badge">${result.difficulty}难度</span><span>${result.estimatedTime}</span></div>
    <div class="strategies"><h4 class="font-semibold mb-2">应对策略</h4><ul>${result.strategies.map(s => `<li>${s}</li>`).join('')}</ul></div>
    <div class="action-buttons"><button class="btn btn-primary" id="arrangeFromAnalysisBtn">安排练习</button></div>
  `
  ;(el as HTMLElement).style.display = 'block'
  el.scrollIntoView({ behavior: 'smooth' })
  const btn = document.getElementById('arrangeFromAnalysisBtn')
  btn?.addEventListener('click', arrangeFromAnalysis)
}
const arrangeFromAnalysis = () => { showPracticeModal.value = true; showMessage('请完善练习细节', 'info') }
const analyzeSocialSituation = () => {
  const input = document.getElementById('situationInput') as HTMLTextAreaElement | null
  const txt = input?.value || ''
  if (!txt.trim()) { showMessage('请输入社交情境描述', 'info'); return }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    const res = { strategies: ['观察当前情境，理解他人的情绪状态', '使用友好的语言表达自己的想法'], difficulty: '中级', estimatedTime: '10-15分钟' }
    displayAnalysisResult(res)
  }, 1000)
}

// 情绪识别：趋势图

const trend = ref<number[]>(getEmotionTrend())
const chartWidth = 600
const chartHeight = 80
const chartPadding = 10
const chartPoints = computed(() => {
  const n = trend.value.length
  const stepX = (chartWidth - chartPadding * 2) / (n - 1)
  const maxY = 100
  const minY = 0
  return trend.value.map((v, i) => {
    const x = chartPadding + i * stepX
    const y = chartPadding + (chartHeight - chartPadding * 2) * (1 - (v - minY) / (maxY - minY))
    return `${x},${y}`
  }).join(' ')
})
const chartPointsAvg = computed(() => {
  const n = trend.value.length
  const avg: number[] = []
  for (let i = 0; i < n; i++) {
    const a = trend.value[Math.max(0, i - 1)]
    const b = trend.value[i]
    const c = trend.value[Math.min(n - 1, i + 1)]
    avg.push(Math.round((a + b + c) / 3))
  }
  const stepX = (chartWidth - chartPadding * 2) / (n - 1)
  return avg.map((v, i) => {
    const x = chartPadding + i * stepX
    const y = chartPadding + (chartHeight - chartPadding * 2) * (1 - v / 100)
    return `${x},${y}`
  }).join(' ')
})
const chartDots = computed(() => {
  const n = trend.value.length
  const stepX = (chartWidth - chartPadding * 2) / (n - 1)
  return trend.value.map((v, i) => {
    const x = chartPadding + i * stepX
    const y = chartPadding + (chartHeight - chartPadding * 2) * (1 - v / 100)
    return { x, y }
  })
})
const emotionCalendarDays = computed(() => {
  const total = 30
  return Array.from({ length: total }, (_, i) => {
    const v = trend.value[i % trend.value.length]
    const label = v < 40 ? '平静' : v < 65 ? '愉悦' : v < 80 ? '紧张' : '激动'
    const color = v < 40 ? '#EAF3FF' : v < 65 ? '#E6FFF3' : v < 80 ? '#FFEFD9' : '#FFE3D6'
    return { id: i, day: i + 1, label, color, trigger: v < 65 ? '无明显触发' : v < 80 ? '环境噪音' : '同伴冲突', intensity: v }
  })
})
const selectedDay = ref<{ id: number; day: number; label: string; color: string; trigger: string; intensity: number } | null>(null)
const selectDay = (d: any) => { selectedDay.value = d }
const currentEmotionIntensity = ref(50)
const gaugeR = 54
const gaugeCircumference = 2 * Math.PI * gaugeR
const gaugeOffset = computed(() => gaugeCircumference * (1 - currentEmotionIntensity.value / 100))
const timeRange = ref(7)
const emotionTriggers = ref<{ label: string; count: number }[]>([
  { label: '环境噪音', count: 8 },
  { label: '社交冲突', count: 6 },
  { label: '任务难度过高', count: 5 },
  { label: '睡眠不足', count: 3 }
])
const filteredTriggers = computed(() => emotionTriggers.value.map(t => ({ ...t, count: Math.round(t.count * (timeRange.value / 30)) })) )
const plan = ref([{ name: '情绪调节·呼吸训练', level: '低' }, { name: '社交轮换·角色扮演', level: '中' }, { name: '沟通表达·短句复述', level: '中' }])
const adjustments = ref([{ id: 'a1', title: '降低情绪练习强度', reason: '近期疲劳评分上升', ts: Date.now() - 86400000 }, { id: 'a2', title: '增加同伴互动次数', reason: '社交参与度下降', ts: Date.now() - 43200000 }])
const radarLabels = ['社交', '情绪', '沟通', '认知', '自理']
const radarData = ref<number[]>([70, 65, 60, 55, 50])
const radarSize = 180
const radarCenter = radarSize / 2
const radarRadius = 70
const axisPoints = computed(() => {
  const n = radarLabels.length
  return Array.from({ length: n }, (_, i) => {
    const ang = (Math.PI * 2 * i) / n
    const x = radarCenter + radarRadius * Math.sin(ang)
    const y = radarCenter - radarRadius * Math.cos(ang)
    return { x, y }
  })
})
const radarPoints = computed(() => {
  const n = radarLabels.length
  return radarData.value.map((v, i) => {
    const ang = (Math.PI * 2 * i) / n
    const r = radarRadius * (v / 100)
    const x = radarCenter + r * Math.sin(ang)
    const y = radarCenter - r * Math.cos(ang)
    return `${x},${y}`
  }).join(' ')
})
const coverageDomains = ref(['社交参与','情绪调节','语言沟通','认知能力','自我照护'])

const progressMetrics = ref([{ label: '社交参与', value: 62 }, { label: '情绪稳定', value: 68 }, { label: '沟通表达', value: 57 }, { label: '认知任务', value: 54 }])
const milestones = ref([{ id: 'm1', title: '完成5次同伴互动练习', ts: Date.now() - 7*86400000 }, { id: 'm2', title: '情绪监测连续一周达标', ts: Date.now() - 3*86400000 }])
const reportMsg = ref('')
const generateRecoveryReport = () => {
  const payload = { plan: plan.value, adjustments: adjustments.value, metrics: progressMetrics.value, trend: trend.value }
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recovery-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  reportMsg.value = '已生成报告'
  setTimeout(() => reportMsg.value = '', 1500)
}

const initTheme = () => { theme.load(); timeOfDay.value = theme.darkMode ? 'night' : 'day' }
onMounted(() => {
  initTheme()
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal() })
  })
  document.getElementById('analyzeBtn')?.addEventListener('click', analyzeSocialSituation)
  document.getElementById('arrangeBtn')?.addEventListener('click', () => arrangeNewPractice())
  const id = setInterval(() => {
    const v = trend.value[Math.floor(Math.random() * trend.value.length)]
    currentEmotionIntensity.value = v
  }, 3000)
  try { (window as any).__emotionGaugeTimer = id } catch {}
})
</script>

<style scoped>
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.section { margin-bottom: 24px; }
.title-text { font-size: 18px; }
.body-text { font-size: 14px; }
@media (min-width: 1200px) { .title-text { font-size: 20px; } .body-text { font-size: 16px; } }

.bottom-nav { display: flex; width: 100%; background: white; box-shadow: 0 -2px 15px rgba(0,0,0,0.08); z-index: 1000; height: var(--nav-h, 70px); padding: 0; margin: 0; }
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px 5px;
  color: #7f8c8d;
  transition: all 0.2s ease;
  margin: 0;
  box-sizing: border-box;
}
.nav-item.active { color: #3498db; }
.nav-icon { font-size: 20px; margin-bottom: 5px; }
.nav-text { font-size: 12px; }
.scenario-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.scenario-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.calendar-cell { color:#1E40AF }
.heat-square { width: 100%; padding-top: 100%; border-radius: 6px }

/* 近七天练习频次样式 */
.practice-frequency { width: 100%; margin: 25px 0; }
.frequency-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 12px; width: 100%; max-width: 100%; margin: 0 auto; box-sizing: border-box; }
.frequency-day { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; font-size: 16px; font-weight: 500; transition: all 0.3s ease; min-height: 50px; padding: 6px; box-sizing: border-box; overflow: hidden; }
.practice-record-heatmap { max-width: 280px; margin: 10px 0; }
.practice-record-heatmap .frequency-grid { grid-template-columns: repeat(7, 1fr); gap: 4px; max-width: 100%; }
.practice-record-heatmap .frequency-day { aspect-ratio: 1; border-radius: 4px; font-size: 10px; display: flex; align-items: center; justify-content: center; }
@media (min-width: 768px) { .practice-record-heatmap { max-width: 240px; } .practice-record-heatmap .frequency-grid { gap: 3px; } .practice-record-heatmap .frequency-day { font-size: 9px; } }
.frequency-day { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px; }
.day-label { font-size: 0.8em; font-weight: 600; }
.count { font-size: 1.1em; font-weight: bold; margin-top: 3px; }
@media (min-width: 768px) { .day-label { font-size: 0.9em; } .count { font-size: 1.3em; margin-top: 4px; } }
@media (max-width: 767px) { .day-label { font-size: 0.7em; } .count { font-size: 1em; margin-top: 2px; } }
.frequency-0 .count { opacity: 0.6; }
.detailed-statistics { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
.detailed-statistics h5 { margin-bottom: 12px; color: #2C3E50; font-size: 14px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-item { text-align: center; padding: 8px; }
.stat-value { display: block; font-size: 18px; font-weight: bold; color: #4A90E2; margin-bottom: 4px; }
.stat-label { font-size: 11px; color: #7F8C8D; }
@media (min-width: 768px) { .stats-grid { gap: 8px; } .stat-value { font-size: 16px; } .stat-label { font-size: 10px; } }
/* 桌面端：近7天练习频次方框平均分布，容器居中并留白 */
@media (min-width: 768px) { .frequency-grid { max-width: none; width: 100%; grid-template-columns: repeat(7, 1fr); gap: 16px; margin: 0 auto; } }
/* 保持桌面端原样式，移动端单独适配 */
@media (max-width: 767px) { .frequency-grid { max-width: 100%; grid-template-columns: repeat(3, 1fr); gap: 10px; } .frequency-day { min-height: 45px; font-size: 14px; padding: 6px; } }
.frequency-legend { display: flex; justify-content: center; gap: 20px; margin-top: 15px; font-size: 14px; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-color { width: 16px; height: 16px; border-radius: 3px; display: inline-block; }
@media (min-width: 768px) { .frequency-legend { gap: 25px; font-size: 16px; } .legend-color { width: 18px; height: 18px; } }
@media (max-width: 767px) { .frequency-legend { gap: 15px; font-size: 12px; } .legend-color { width: 14px; height: 14px; } }
.frequency-0 { background: #f5f5f5; color: #888; }
.frequency-1 { background: #bbdefb; color: #1565c0; }
.frequency-2 { background: #90caf9; color: #0d47a1; }
.frequency-3 { background: #64b5f6; color: #0d47a1; }
.frequency-4 { background: #42a5f5; color: #0d47a1; }
.frequency-5 { background: #2196f3; color: #fff; }

/* 统一主题变量与样式 */
.unified-theme {
  --bg: #F8F9FA;
  --primary: #a8eeb9;
  --primary-dark: #eff2c2;
  --success: #50C878;
  --warning: #FF7E5A;
  --text: #2C3E50;
  --muted: #7F8C8D;
  --card-bg: #FFFFFF;
  --card-border: #E5E7EB;
  --radius: 12px;
  --shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.nav-item.active { color: var(--primary); }
.btn { border: none; padding: 10px 16px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
.btn-primary { background: linear-gradient(90deg, var(--primary), var(--primary-dark)); color:#fff }
.btn-secondary { background:#fff; color: var(--primary); border:1px solid var(--primary) }
.btn-success { background: var(--success); color:#fff }
.btn-danger { background: var(--warning); color:#fff }
.standard-card { background: var(--card-bg); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow); border: 1px solid var(--card-border); }
.card-primary { border-color: var(--primary); }
.card-success { border-color: var(--success); }
.card-warning { border-color: var(--warning); }
.modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; align-items: center; justify-content: center; }
.modal[style*="display: flex"], .modal:has(.modal-content) { display: flex; }
.modal-content { background: #fff; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; }
.form-group { margin-bottom: 16px; }
.form-actions { display: flex; gap: 12px; margin-top: 24px; }
.loading { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; z-index: 2100; background: rgba(255,255,255,0.6); }
.loading-spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: var(--primary); border-radius: 9999px; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
.practice-item { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #4A90E2; display: flex; justify-content: space-between; align-items: center; }
.practice-info strong { display: block; margin-bottom: 4px; }
.difficulty { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.difficulty.beginner { background: #E8F5E8; color: #2E7D32; }
.difficulty.intermediate { background: #E3F2FD; color: #1565C0; }
.difficulty.advanced { background: #FFEBEE; color: #C62828; }
.result-meta { display: flex; gap: 12px; margin: 10px 0; }
.difficulty-badge { padding: 4px 12px; border-radius: 16px; background: #E3F2FD; color: #1565C0; font-size: 14px; }
.strategies ul { list-style: none; padding-left: 0; }
.strategies li { padding: 8px 0; border-bottom: 1px solid #f5f5f5; position: relative; padding-left: 20px; }
.strategies li:before { content: "✓"; position: absolute; left: 0; color: #4A90E2; }
.action-buttons { margin-top: 20px; }
.message { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px; color: #fff; z-index: 3000; }
.message.info { background: #4A90E2; }
.message.success { background: #50C878; }
</style>
.quote-wrap { position: relative; display: inline-block; }
.quote-text { font-size: 20px; line-height: 1.6; font-weight: 700; letter-spacing: 0.5px; -webkit-background-clip: text; background-clip: text; color: transparent; }
.quote-night .quote-text { background-image: linear-gradient(90deg, #E6D9FF, #CAB6FF); -webkit-text-stroke: 1px #FFFFFF; text-shadow: 0 0 6px rgba(255,255,255,0.25); }
.quote-day .quote-text { background-image: linear-gradient(90deg, #6B489E, #4A2E78); -webkit-text-stroke: 1px #BFA3FF; text-shadow: 0 1px 1px rgba(105,72,158,0.15); }
.star-dot { position: absolute; width: 6px; height: 6px; border-radius: 50%; opacity: 0.6; }
.quote-night .star-dot { background: #D9C8FF; box-shadow: 0 0 8px rgba(255,255,255,0.5); }
.quote-day .star-dot { background: #BFA3FF; box-shadow: 0 0 6px rgba(191,163,255,0.4); }
.dot1 { top: -6px; left: -16px; }
.dot2 { top: -10px; right: -14px; }
.dot3 { bottom: -8px; left: 50%; transform: translateX(-50%); }
.dot4 { top: -14px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; }
@media (min-width: 1200px) { .quote-text { font-size: 22px; } }
.section > div.rounded-xl { margin-bottom: 20px; box-shadow: var(--shadow); border-radius: var(--radius); padding: 20px; }
@media (max-width: 768px) { .section > div.rounded-xl { margin-bottom: 15px; padding: 15px; } }
.practice-frequency h4 { font-size: 18px; margin-bottom: 15px; text-align: center; color: #2C3E50; }
@media (min-width: 768px) { .practice-frequency h4 { font-size: 20px; margin-bottom: 20px; } }
@media (max-width: 767px) { .practice-frequency h4 { font-size: 16px; margin-bottom: 12px; } }
