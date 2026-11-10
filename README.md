# 🏃 跑马吗 - 马拉松跑者音乐工作站

> 用对的节奏，跑更远的距离  
> 专为马拉松跑者打造的智能音乐训练平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Runner Focused](https://img.shields.io/badge/🏃-Marathon%20Ready-red)](https://paomama.run)
[![BPM Sync](https://img.shields.io/badge/BPM-160--180%20Optimized-blue)](https://paomama.run)
[![Offline First](https://img.shields.io/badge/Offline-First-green)](https://paomama.run)

## 🎯 项目愿景

"跑马吗"是专为马拉松跑者设计的音乐训练工具。我们深知180步频的黄金法则，理解LSD长距离慢跑时音乐陪伴的重要性，也明白比赛日节奏把控的关键。通过智能BPM匹配、时间轴提醒与音频剪辑，让每一首歌都成为你破PB的助力。

### 跑者场景映射

| 训练阶段 | 音乐需求 | 解决方案 |
|---------|---------|---------|
| 🏃‍♂️ 日常有氧跑 | 稳定180BPM节拍 | 智能BPM转换 + 节拍器叠加 |
| 🏔️ LSD长距离 | 3小时+不无聊 | 自动歌单拼接 + 时间节点提醒 |
| ⚡ 间歇训练 | 快慢交替节奏 | 分段变速标记 + 语音提示 |
| 🏁 比赛日 | 精准配速控制 | 时间节点提醒 + 配速音乐 |
| 🧘 赛后恢复 | 放松低BPM | BPM减半模式 + 冥想音效 |

## 🚀 核心功能

### 1. 🎵 跑鞋级格式转换

**痛点**: 跑者从各平台下载的训练音乐格式不统一，车载/手表播放困难  
**解决**: 一键转换为跑步设备通用格式

#### 支持平台解密

| 音乐平台 | 格式 | 跑步场景优化 |
|---------|------|-------------|
| 网易云音乐 | .ncm | 保留跑步歌单封面与歌词 |
| QQ音乐 | .qmc/.mflac | 支持HQ高品质转换 |
| 酷狗音乐 | .kgm | 保留DJ版跑步混音 |
| 酷我音乐 | .kwm | 支持车载MP3格式 |
| 通用加密 | .mgg/.mmp4 | 智能批量转换 |

#### 输出规格（跑步优化）

```yaml
MP3 (推荐): 
  - 码率: 192kbps (平衡音质与存储)
  - 采样: 44.1kHz
  - 用途: 手机/手表/车载

AAC (Apple Watch):
  - 码率: 256kbps
  - 容器: .m4a
  - 用途: Apple Watch/Nike Run Club

OGG (Garmin):
  - 码率: 192kbps
  - 用途: Garmin手表/专业跑表

WAV (分析用):
  - 无损PCM
  - 用途: BPM精准分析/节拍提取
```

---

### 2. 🥁 步频节拍器 (Cadence Metronome)

**黄金180法则**: 顶级马拉松跑者的平均步频为180步/分钟  
**核心**: 让音乐节奏与步频完美同步

#### 智能BPM系统

```javascript
// 步频-配速-音乐匹配算法
const cadenceMap = {
  easyRun:    { cadence: 170, bpm: 85,  description: "轻松跑 - 半拍一步" },
  marathon:   { cadence: 180, bpm: 90,  description: "马拉松配速 - 标准节奏" },
  threshold:  { cadence: 185, bpm: 93,  description: "乳酸阈值 - 略快节奏" },
  interval:   { cadence: 190, bpm: 95,  description: "间歇跑 - 快节奏" },
  sprint:     { cadence: 200, bpm: 100, description: "冲刺 - 双倍速" }
};
```

#### 功能特性

- **🎯 步频目标**: 预设 160/170/180/190/200 SPM (Steps Per Minute)
- **🎼 音乐节拍**: 自动将歌曲BPM调整为步频的整数约数 (1:1, 1:2, 2:1)
- **🔊 节拍音效**: 
  - 木鱼声 (清脆穿透)
  - 鼓点声 (节奏感强)
  - 电子音 (现代感)
  - 语音计数 ("1-2-3-4" 或 "左-右-左-右")
- **👁️ 视觉反馈**: 
  - 屏幕闪烁 (夜间跑步安全)
  - 摆锤动画 (节奏可视化)
  - 波形脉冲 (与音乐融合)

#### 模式详解

| 模式 | 说明 | 适用场景 |
|-----|------|---------|
| **跟随模式** | 检测歌曲BPM，自动匹配最接近的步频 | 日常训练 |
| **强制模式** | 无视原曲BPM，强制按目标步频播放 | 步频训练 |
| **渐变模式** | 从当前BPM平滑过渡到目标BPM (5分钟过渡) | 热身/冷身 |
| **节拍叠加** | 保留原音乐，叠加节拍器声音 | 节奏感培养 |
| **节拍替换** | 提取歌曲结构，用纯节拍代替 | 专注步频 |

#### 技术实现

使用 AudioWorklet 实现毫秒级精度:

```javascript
// cadence-processor.js
class CadenceProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSPM = 180;  // 目标步频
    this.beatInterval = 60 / this.targetSPM;  // 每步间隔
    this.nextBeatTime = 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const currentTime = currentFrame / sampleRate;

    // 高精度节拍生成
    if (currentTime >= this.nextBeatTime) {
      this.generateBeat(output);
      this.nextBeatTime = currentTime + this.beatInterval;
    }

    return true;
  }
}
```

---

### 3. ✂️ 马拉松剪辑器 (Marathon Editor)

**痛点**: 42.195公里的比赛，需要音乐陪伴但不能手动切歌  
**解决**: 智能拼接与基于时间的提醒系统

#### 时间轴设计（跑步专用）

```
时间轴视图 (基于时间，非距离):
00:00    05:00    15:00    30:00    60:00    90:00    120:00   180:00
  |        |        |        |        |        |        |        |
  ▼        ▼        ▼        ▼        ▼        ▼        ▼        ▼
[热身]   [起步]   [稳定]   [检查]   [半程]   [撞墙]   [冲刺]   [终点]

音频片段: 
├─ 歌曲A (BPM 90) ──┬─ 歌曲B (BPM 90) ──┬─ 歌曲C (BPM 92)
│                   │                   │
│ 淡入2秒           │ 交叉淡化3秒        │ 淡出2秒
│                   │                   │
[音量: 80%]         [音量: 100%]         [音量: 80%]
```

#### 智能拼接模式

**🎯 目标时长模式**
- 输入目标距离 (如 21.0975km) 和配速 (如 5:00/km)
- 自动计算总时长: 1小时45分钟
- 智能选择歌曲拼接至精确时长
- 自动添加淡入淡出过渡

**⏱️ 时间节点模式 (核心功能)**
- 在特定时间点插入提醒 (如 15分钟补水、30分钟能量胶、60分钟半程检查)
- 可设置特定时间点特殊提醒 (如 90分钟撞墙期预警、最后10分钟冲刺)
- 支持自定义语音 ("您已跑步30分钟，当前配速5分12秒")

**🔄 循环训练模式**
- 间歇跑: 快跑90秒 + 慢跑60秒 × 8组
- 自动循环音频片段，每组不同提示音
- 组间倒计时语音提醒

#### 剪辑工具箱

| 工具 | 功能 | 跑者价值 |
|-----|------|---------|
| **智能分割** | 按BPM变化自动分割歌曲 | 提取歌曲高潮段 |
| **BPM统一** | 将多首歌调整为相同BPM | 全程节奏一致 |
| **音量均衡** | 统一多首歌的响度 | 避免忽大忽小 |
| **无缝拼接** | 节拍对齐+交叉淡化 | 切换无感知 |
| **章节标记** | 标记前奏/主歌/副歌/尾奏 | 提取高能量段落 |
| **能量曲线** | 可视化歌曲强度变化 | 按时间分配歌曲 |

---

### 4. 🔔 智能提醒系统 (Pacer Reminder)

**比赛日大脑缺氧，需要基于时间的外部提醒系统**

#### 提醒类型

**⏱️ 时间节点提醒 (基于时间，非距离)**
```javascript
// 默认马拉松提醒节点 (基于时间，适配不同配速)
// 以全马4小时完赛 (5:41/km) 为基准模板
const marathonTimeMarkers = [
  { time: '00:00',   type: 'start',    message: '起跑！保持节奏，不要冲' },
  { time: '05:00',   type: 'warmup',   message: '热身结束，进入巡航节奏' },
  { time: '15:00',   type: 'check',    message: '15分钟，检查呼吸和步频' },
  { time: '28:00',   type: 'water',    message: '5公里，准备补水' },      // 约5km @ 5:41/km
  { time: '30:00',   type: 'gel',      message: '30分钟，补充能量胶' },
  { time: '57:00',   type: 'water',    message: '10公里，补水站' },       // 约10km
  { time: '60:00',   type: 'half',     message: '1小时，状态检查' },
  { time: '85:00',   type: 'water',    message: '15公里，补水' },         // 约15km
  { time: '113:00',  type: 'critical', message: '半程！后半程开始' },      // 约20km
  { time: '120:00',  type: 'warning',  message: '2小时，注意体能分配' },
  { time: '142:00',  type: 'water',    message: '25公里，撞墙期预警' },    // 约25km
  { time: '150:00',  type: 'gel',      message: '2.5小时，最后补给' },
  { time: '170:00',  type: 'critical', message: '30公里，咬牙坚持！' },     // 约30km
  { time: '198:00',  type: 'sprint',   message: '35公里，最后7公里！' },   // 约35km
  { time: '210:00',  type: 'sprint',   message: '最后10分钟，准备冲刺' },
  { time: '226:00',  type: 'sprint',   message: '最后1公里，冲线！' },     // 约40km
  { time: '240:00',  type: 'finish',   message: '恭喜完赛！' }
];
```

**🎯 配速提醒 (基于时间计算)**
- 用户输入目标配速 (如 5:00/km) 和目标距离 (如 42.195km)
- 系统计算理论时间节点: 5km应在25分钟到达
- 实际时间对比: 若GPS显示27分钟才到5km
- 语音提醒: "注意，当前配速5分24秒，比目标慢24秒"
- 语音由Web Speech API合成，无需预录音

**🥤 补给提醒 (基于时间间隔)**
- 自定义补给计划 (如每30分钟能量胶，每45分钟盐丸)
- 提前30秒语音提醒: "30秒后继续能量胶"
- 震动提醒 (移动端)

**🎵 音乐动作 (基于时间)**
- 到达特定时间点自动调整音量 (如最后10分钟音量+20%)
- 自动切换歌曲 (如2小时后切换为高能量歌曲)
- BPM自动提升 (最后冲刺阶段)

#### 提醒配置示例

```javascript
// 用户自定义提醒 (基于时间)
const customReminders = [
  {
    id: 'gel-30min',
    trigger: { type: 'time', value: 1800 },  // 30分钟 = 1800秒
    action: { 
      type: 'audio', 
      sound: 'gel-reminder.mp3',
      message: '30分钟，补充能量胶',
      volume: 1.2  // 覆盖音乐音量
    },
    repeat: 'interval',  // 每隔30分钟重复
    interval: 1800       // 30分钟间隔
  },
  {
    id: 'water-hourly',
    trigger: { type: 'time', value: 3600 },  // 每小时
    action: {
      type: 'composite',
      actions: [
        { type: 'voice', message: '1小时，记得补水' },
        { type: 'volume', delta: -0.2, duration: 10 }  // 降低音量10秒
      ]
    },
    repeat: 'interval',
    interval: 3600
  },
  {
    id: 'final-push',
    trigger: { type: 'time', value: 8400 },  // 2小时20分钟 (假设全马目标)
    action: {
      type: 'composite',
      actions: [
        { type: 'voice', message: '最后10分钟，冲刺！' },
        { type: 'bpm', target: 195, transition: 60 },  // 60秒内提升到195BPM
        { type: 'volume', delta: 0.3 }
      ]
    }
  }
];
```

#### 时间-距离换算 (仅供参考显示)

```javascript
// 系统内部只认时间，距离仅作为参考显示
function timeToDistance(timeSeconds, pacePerKm) {
  // pacePerKm: 每公里配速 (秒)
  // 如 5:00/km = 300秒/km
  const distanceKm = timeSeconds / pacePerKm;
  return {
    km: distanceKm.toFixed(2),
    display: `${Math.floor(distanceKm)}公里${Math.round((distanceKm % 1) * 1000)}米`
  };
}

function distanceToTime(distanceKm, pacePerKm) {
  const timeSeconds = distanceKm * pacePerKm;
  return {
    seconds: timeSeconds,
    display: formatTime(timeSeconds)  // "02:30:00"
  };
}
```

---

## 🏗️ 技术架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      跑马吗 Web App                         │
│                    (PWA - 离线优先)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   转换器     │  │   节拍器     │  │   剪辑器     │     │
│  │  Converter   │  │  Metronome   │  │   Editor     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │             │
│         └─────────────────┼─────────────────┘             │
│                           │                               │
│              ┌────────────▼────────────┐                 │
│              │    音频引擎核心           │                 │
│              │    Audio Engine Core      │                 │
│              │                           │                 │
│              │  ┌─────────────────────┐  │                 │
│              │  │   AudioContext      │  │                 │
│              │  │   (主控/分析/输出)   │  │                 │
│              │  └─────────────────────┘  │                 │
│              │  ┌─────────────────────┐  │                 │
│              │  │   AudioWorklet      │  │                 │
│              │  │   (节拍器/效果器)    │  │                 │
│              │  └─────────────────────┘  │                 │
│              │  ┌─────────────────────┐  │                 │
│              │  │   Offline Context   │  │                 │
│              │  │   (后台渲染/导出)    │  │                 │
│              │  └─────────────────────┘  │                 │
│              └───────────────────────────┘                 │
│                           │                               │
│         ┌─────────────────┼─────────────────┐             │
│         │                 │                 │             │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐     │
│  │  解码器池   │   │  编码器池   │   │  分析器池   │     │
│  │  Decoders   │   │  Encoders   │   │  Analyzers  │     │
│  │             │   │             │   │             │     │
│  │ • NCM       │   │ • MP3       │   │ • BPM检测   │     │
│  │ • QMC       │   │ • AAC       │   │ •  onset    │     │
│  │ • KGM       │   │ • OGG       │   │ •  波形     │     │
│  │ • KWM       │   │ • WAV       │   │ •  频谱     │     │
│  └─────────────┘   └─────────────┘   └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    Web Workers 池                          │
│              (后台解码/编码/分析，不阻塞UI)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ decode-worker│  │ encode-worker│  │ analyze-worker│    │
│  │ (格式解密)   │  │ (音频导出)   │  │ (BPM/波形)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    WASM 加速模块                           │
│              (高性能音频处理/编解码)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ffmpeg.js    │  │ libsndfile   │  │ SoundTouch   │     │
│  │ (编解码)     │  │ (格式支持)   │  │ (变速不变调) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
paomama/
├── 📱 PWA配置
│   ├── index.html                 # 主入口
│   ├── manifest.json              # 应用清单 (name: "跑马吗")
│   ├── sw.js                      # Service Worker (离线缓存策略)
│   └── icons/
│       ├── icon-72.png            # 安卓
│       ├── icon-192.png           # 桌面/PWA
│       ├── icon-512.png           # 启动屏
│       ├── maskable-icon.png      # 自适应图标
│       └── apple-touch-icon.png   # iOS
│
├── 🎨 资源
│   ├── assets/
│   │   ├── sounds/
│   │   │   ├── metronome/         # 节拍器音效
│   │   │   │   ├── woodblock.mp3  # 木鱼
│   │   │   │   ├── drum.mp3       # 鼓点
│   │   │   │   ├── beep.mp3       # 电子
│   │   │   │   └── voice/         # 语音计数
│   │   │   ├── reminders/         # 提醒音效
│   │   │   │   ├── water.mp3
│   │   │   │   ├── gel.mp3
│   │   │   │   ├── cheer.mp3
│   │   │   │   └── finish.mp3
│   │   │   └── effects/           # 过渡音效
│   │   │       ├── fade-in.mp3
│   │   │       └── fade-out.mp3
│   │   ├── images/
│   │   │   ├── runner-hero.jpg    # 首页大图
│   │   │   ├── marathon-map.svg   # 马拉松路线图
│   │   │   └── bpm-chart.png      # BPM示意图
│   │   └── fonts/
│   │       └── din-condensed.woff2 # 运动风格字体
│
├── 💻 源代码
│   ├── src/
│   │   ├── 🎯 核心
│   │   │   ├── core/
│   │   │   │   ├── app.js         # 应用主控
│   │   │   │   ├── router.js      # 路由 (hash模式，兼容离线)
│   │   │   │   ├── state.js       # 状态管理 (跑步数据持久化)
│   │   │   │   └── events.js      # 事件总线
│   │   │   │
│   │   │   ├── 🎵 音频引擎
│   │   │   │   ├── audio/
│   │   │   │   │   ├── engine/
│   │   │   │   │   │   ├── context.js       # AudioContext管理
│   │   │   │   │   │   ├── scheduler.js     # 高精度调度器
│   │   │   │   │   │   └── nodes/
│   │   │   │   │   │       ├── cadence-node.js      # 步频节点
│   │   │   │   │   │       ├── reminder-node.js     # 提醒节点
│   │   │   │   │   │       ├── gain-envelope.js     # 音量包络
│   │   │   │   │   │       ├── crossfade.js         # 交叉淡化
│   │   │   │   │   │       └── filter.js            # EQ滤波
│   │   │   │   │   │
│   │   │   │   │   ├── worklets/              # AudioWorklet处理器
│   │   │   │   │   │   ├── cadence-processor.js       # 步频生成
│   │   │   │   │   │   ├── metronome-processor.js     # 节拍器
│   │   │   │   │   │   ├── waveform-processor.js      # 波形分析
│   │   │   │   │   │   ├── reminder-processor.js      # 提醒触发 (基于时间)
│   │   │   │   │   │   └── stretch-processor.js       # 时间拉伸
│   │   │   │   │   │
│   │   │   │   │   ├── decoder/               # 格式解码器
│   │   │   │   │   │   ├── base-decoder.js
│   │   │   │   │   │   ├── ncm-decoder.js           # 网易云
│   │   │   │   │   │   ├── qmc-decoder.js           # QQ音乐
│   │   │   │   │   │   ├── qmc-mflac-decoder.js     # QQ音乐FLAC
│   │   │   │   │   │   ├── kgm-decoder.js           # 酷狗
│   │   │   │   │   │   ├── kwm-decoder.js           # 酷我
│   │   │   │   │   │   └── mgg-decoder.js           # QQ音乐新格式
│   │   │   │   │   │
│   │   │   │   │   ├── encoder/               # 输出编码
│   │   │   │   │   │   ├── mp3-encoder.js           # lamejs
│   │   │   │   │   │   ├── aac-encoder.js           # 浏览器原生
│   │   │   │   │   │   ├── ogg-encoder.js           # libogg
│   │   │   │   │   │   └── wav-encoder.js           # PCM导出
│   │   │   │   │   │
│   │   │   │   │   └── utils/
│   │   │   │   │       ├── bpm-detector.js          # BPM检测算法
│   │   │   │   │       ├── bpm-converter.js         # BPM转换
│   │   │   │   │       ├── tempo-stretch.js         # 变速不变调
│   │   │   │   │       ├── loudness-analyzer.js     # 响度分析
│   │   │   │   │       └── audio-buffer.js          # Buffer工具
│   │   │   │   │
│   │   │   ├── ✂️ 剪辑编辑器
│   │   │   │   ├── editor/
│   │   │   │   │   ├── timeline/              # 时间轴组件
│   │   │   │   │   │   ├── timeline.js        # 主容器 (基于时间轴)
│   │   │   │   │   │   ├── track.js           # 音轨
│   │   │   │   │   │   ├── clip.js            # 音频片段
│   │   │   │   │   │   ├── marker.js          # 时间标记点 (非距离)
│   │   │   │   │   │   ├── ruler.js           # 时间标尺 (HH:MM:SS)
│   │   │   │   │   │   └── playhead.js        # 播放头
│   │   │   │   │   │
│   │   │   │   │   ├── tools/                 # 编辑工具
│   │   │   │   │   │   ├── selector.js        # 选择工具
│   │   │   │   │   │   ├── splitter.js        # 分割工具
│   │   │   │   │   │   ├── merger.js          # 合并工具
│   │   │   │   │   │   ├── volume-tool.js     # 音量调节
│   │   │   │   │   │   ├── fade-tool.js       # 淡入淡出
│   │   │   │   │   │   └── bpm-match-tool.js  # BPM匹配
│   │   │   │   │   │
│   │   │   │   │   ├── renderer/              # 渲染器
│   │   │   │   │   │   ├── waveform-canvas.js       # 波形绘制
│   │   │   │   │   │   ├── waveform-webgl.js        # WebGL加速
│   │   │   │   │   │   ├── energy-renderer.js       # 能量曲线
│   │   │   │   │   │   └── minimap.js               # 缩略图
│   │   │   │   │   │
│   │   │   │   │   └── marathon/              # 马拉松专用功能
│   │   │   │   │       ├── time-calculator.js       # 时间计算器
│   │   │   │   │       ├── pace-planner.js          # 配速规划
│   │   │   │   │       ├── auto-arrange.js          # 自动排歌
│   │   │   │   │       └── segment-exporter.js      # 分段导出
│   │   │   │   │
│   │   │   ├── 🔔 提醒系统 (基于时间)
│   │   │   │   ├── reminder/
│   │   │   │   │   ├── reminder-engine.js     # 提醒引擎 (时间驱动)
│   │   │   │   │   ├── trigger-types.js       # 触发器类型 (TIME-based)
│   │   │   │   │   ├── action-types.js        # 动作类型
│   │   │   │   │   ├── voice-synthesizer.js   # 语音合成
│   │   │   │   │   ├── time-tracker.js        # 时间追踪器 (核心)
│   │   │   │   │   └── presets/               # 预设方案 (基于时间)
│   │   │   │   │       ├── marathon-4h.js     # 全马4小时方案
│   │   │   │   │       ├── marathon-3h30m.js  # 全马3.5小时方案
│   │   │   │   │       ├── marathon-5h.js     # 全马5小时方案
│   │   │   │   │       ├── half-2h.js         # 半马2小时方案
│   │   │   │   │       ├── lsd-2h.js          # LSD 2小时
│   │   │   │   │       └── interval-45m.js    # 间歇45分钟
│   │   │   │   │
│   │   │   ├── 🖥️ 用户界面
│   │   │   │   ├── ui/
│   │   │   │   │   ├── components/            # 通用组件
│   │   │   │   │   │   ├── time-knob/         # 时间旋钮 (HH:MM:SS)
│   │   │   │   │   │   ├── pace-display/      # 配速显示
│   │   │   │   │   │   ├── bpm-meter/         # BPM表
│   │   │   │   │   │   ├── cadence-visualizer/ # 步频可视化
│   │   │   │   │   │   ├── time-ruler/        # 时间标尺
│   │   │   │   │   │   ├── energy-chart/      # 能量曲线
│   │   │   │   │   │   └── runner-button/     # 运动风格按钮
│   │   │   │   │   │
│   │   │   │   │   ├── views/                 # 页面视图
│   │   │   │   │   │   ├── home-view.js       # 首页
│   │   │   │   │   │   ├── converter-view.js  # 转换器
│   │   │   │   │   │   ├── cadence-view.js    # 步频器
│   │   │   │   │   │   ├── editor-view.js     # 编辑器
│   │   │   │   │   │   ├── reminder-view.js   # 提醒设置 (时间轴)
│   │   │   │   │   │   ├── player-view.js     # 播放器
│   │   │   │   │   │   └── settings-view.js   # 设置
│   │   │   │   │   │
│   │   │   │   │   └── styles/
│   │   │   │   │       ├── variables.css      # CSS变量
│   │   │   │   │       ├── global.css         # 全局样式
│   │   │   │   │       ├── components.css     # 组件样式
│   │   │   │   │       └── themes/
│   │   │   │   │           ├── dark-runner.css    # 深色-跑步模式
│   │   │   │   │           ├── light-runner.css   # 浅色-跑步模式
│   │   │   │   │           └── night-mode.css     # 夜间高对比
│   │   │   │   │
│   │   │   ├── ⚙️ 工具与配置
│   │   │   │   ├── utils/
│   │   │   │   │   ├── file-utils.js          # 文件处理
│   │   │   │   │   ├── time-utils.js          # 时间计算 (核心)
│   │   │   │   │   ├── pace-calculator.js     # 配速计算
│   │   │   │   │   ├── storage.js             # IndexedDB封装
│   │   │   │   │   ├── id-generator.js        # ID生成
│   │   │   │   │   └── event-emitter.js       # 事件发射器
│   │   │   │   │
│   │   │   │   ├── workers/                   # Web Workers
│   │   │   │   │   ├── decode-worker.js       # 后台解码
│   │   │   │   │   ├── encode-worker.js       # 后台编码
│   │   │   │   │   ├── analyze-worker.js      # 后台分析
│   │   │   │   │   └── export-worker.js       # 导出处理
│   │   │   │   │
│   │   │   │   └── config/
│   │   │   │       ├── app-config.js          # 应用配置
│   │   │   │       ├── decoder-keys.js        # 解密密钥(加密存储)
│   │   │   │       ├── cadence-presets.js     # 步频预设
│   │   │   │       └── time-presets.js        # 时间预设方案
│   │   │   │
│   │   │   └── 📊 数据与统计
│   │   │       ├── data/
│   │   │       │   ├── run-history.js         # 跑步历史 (时间记录)
│   │   │       │   ├── playlist-manager.js    # 歌单管理
│   │   │       │   ├── reminder-db.js         # 提醒数据库 (时间触发)
│   │   │       │   └── export-history.js      # 导出历史
│   │   │       │
│   │   │       └── stats/
│   │   │           ├── cadence-stats.js       # 步频统计
│   │   │           └── usage-analytics.js     # 使用分析(匿名)
│   │   │
│   │   └── main.js                    # 入口文件
│
├── 🔧 WASM模块
│   ├── wasm/
│   │   ├── ffmpeg/                    # FFmpeg编译
│   │   │   ├── ffmpeg-core.js
│   │   │   └── ffmpeg-core.wasm
│   │   ├── libsndfile/                # 音频格式
│   │   │   └── sndfile.wasm
│   │   ├── soundtouch/                # 变速不变调
│   │   │   └── soundtouch.wasm
│   │   └── aubio/                     # 音频分析
│   │       └── aubio.wasm
│
├── 🧪 测试
│   ├── tests/
│   │   ├── unit/                      # 单元测试
│   │   ├── integration/               # 集成测试
│   │   ├── audio-samples/             # 测试音频
│   │   └── e2e/                       # 端到端测试
│
└── 📖 文档
    ├── docs/
    │   ├── api.md                     # API文档
    │   ├── architecture.md            # 架构设计
    │   ├── decoder-specs.md           # 解码器规范
    │   └── user-guide.md              # 用户指南
    │
    ├── CHANGELOG.md
    ├── LICENSE
    └── README.md                      # 本文件
```

---

## 🏃 跑者专用功能详解

### 步频-配速-时间对应表

```javascript
// 基于时间的训练模型 (非距离)
const trainingTimeZones = {
  warmup: {
    name: "热身阶段",
    timeRange: "0-10分钟",
    cadence: 165,
    bpm: 82,
    description: "起步热身，逐渐加速"
  },
  easy: {
    name: "轻松跑",
    timeRange: "10-60分钟",
    cadence: 170,
    bpm: 85,
    description: "日常有氧基础"
  },
  marathon: {
    name: "马拉松配速",
    timeRange: "60-180分钟",
    cadence: 180,
    bpm: 90,
    description: "比赛日巡航节奏"
  },
  threshold: {
    name: "乳酸阈值",
    timeRange: "20-40分钟",
    cadence: 185,
    bpm: 93,
    description: "提升耐力"
  },
  interval: {
    name: "间歇跑",
    timeRange: "每组2-5分钟",
    cadence: 190,
    bpm: 95,
    description: "快慢交替"
  },
  cooldown: {
    name: "冷身",
    timeRange: "最后5-10分钟",
    cadence: 160,
    bpm: 80,
    description: "逐渐减速"
  }
};
```

### 马拉松时间模板 (基于时间)

```javascript
// 标准完赛时间模板 (提醒基于时间节点)
const raceTimeTemplates = {
  "全马3小时": {
    totalTime: 10800,  // 3小时 = 10800秒
    markers: [
      { time: 0,      message: "起跑！目标配速4:16/km" },
      { time: 600,    message: "10分钟，进入节奏" },
      { time: 1280,   message: "约5公里，检查配速" },   // ~5km @ 4:16/km
      { time: 1800,   message: "30分钟，补给能量胶" },
      { time: 2560,  message: "约10公里，稳定输出" },  // ~10km
      { time: 3600,  message: "1小时，过半程检查点" },
      { time: 5400,  message: "90分钟，撞墙期注意" },
      { time: 6400,  message: "约25公里，咬牙坚持" },  // ~25km
      { time: 7680,  message: "约30公里，最后12公里" }, // ~30km
      { time: 9000,  message: "2.5小时，最后10公里" },
      { time: 10200, message: "最后10分钟，准备冲刺" },
      { time: 10800, message: "恭喜破3！" }
    ]
  },
  "全马4小时": {
    totalTime: 14400,  // 4小时
    markers: [
      { time: 0,      message: "起跑！目标配速5:41/km" },
      { time: 600,    message: "10分钟，热身结束" },
      { time: 1700,   message: "约5公里，检查配速" },   // ~5km @ 5:41/km
      { time: 1800,   message: "30分钟，补给能量胶" },
      { time: 3410,  message: "约10公里，补水站" },    // ~10km
      { time: 3600,   message: "1小时，状态良好" },
      { time: 5110,  message: "约15公里，继续稳定" },  // ~15km
      { time: 7200,   message: "2小时，半程！后半程开始" },
      { time: 8530,  message: "约25公里，撞墙期预警" }, // ~25km
      { time: 10240, message: "约30公里，最后10公里" }, // ~30km
      { time: 12000,  message: "3.5小时，最后5公里" },
      { time: 13200,  message: "最后20分钟，冲刺！" },
      { time: 14400,  message: "恭喜完赛！" }
    ]
  },
  "全马5小时": {
    totalTime: 18000,  // 5小时
    markers: [
      { time: 0,      message: "起跑！目标配速7:07/km，享受比赛" },
      { time: 900,    message: "15分钟，找到舒适节奏" },
      { time: 2130,  message: "约5公里，轻松完成" },
      { time: 2700,   message: "45分钟，第一次补给" },
      { time: 4270,  message: "约10公里，继续享受" },
      { time: 5400,   message: "1.5小时，状态检查" },
      { time: 6400,  message: "约15公里，过半程检查点" },
      { time: 9000,   message: "2.5小时，半程！后半程开始" },
      { time: 10670, message: "约25公里，坚持就是胜利" },
      { time: 12800, message: "约30公里，最后10公里" },
      { time: 15000,  message: "4小时10分，最后5公里" },
      { time: 16800,  message: "最后20分钟，你做到了！" },
      { time: 18000,  message: "恭喜完赛！" }
    ]
  },
  "半马2小时": {
    totalTime: 7200,
    markers: [
      { time: 0,     message: "起跑！目标配速5:41/km" },
      { time: 600,   message: "10分钟，进入节奏" },
      { time: 1700,  message: "约5公里，检查配速" },
      { time: 1800,   message: "30分钟，补给" },
      { time: 3410,  message: "约10公里，过半程" },
      { time: 3600,   message: "1小时，稳定输出" },
      { time: 6000,   message: "最后20分钟，准备冲刺" },
      { time: 7200,   message: "恭喜完赛！" }
    ]
  }
};
```

### 智能歌曲推荐算法 (基于时间)

```javascript
// 根据训练时长推荐歌曲
function recommendSongsByTime(trainingPlan, musicLibrary) {
  const { targetTime, targetCadence } = trainingPlan;  // 目标时间(秒)，非距离

  // 1. 筛选符合BPM的歌曲 (±3%容差)
  const cadenceSongs = musicLibrary.filter(song => 
    Math.abs(song.bpm - targetCadence/2) / (targetCadence/2) < 0.03
  );

  // 2. 按时间能量曲线排序
  // 起步: 中能量 → 中段: 稳定高能量 → 后段: 超高能量
  const energyCurve = generateTimeEnergyCurve(targetTime);

  // 3. 自动拼接至目标时长 (精确到秒)
  return autoArrangeByTime(cadenceSongs, targetTime, energyCurve);
}

// 时间能量曲线生成
function generateTimeEnergyCurve(totalTime) {
  return {
    warmup: { start: 0, end: Math.min(600, totalTime * 0.1), intensity: 0.6 },      // 前10分钟或10%
    cruise: { start: 0, end: totalTime * 0.7, intensity: 0.8 },                      // 到70%
    challenge: { start: totalTime * 0.7, end: totalTime * 0.9, intensity: 0.9 },     // 70-90%
    finish: { start: totalTime * 0.9, end: totalTime, intensity: 1.0 }               // 最后10%
  };
}
```

---

## 📱 移动端优化

### 跑步模式界面

```
┌─────────────────────────────┐
│ ⏱️ 00:45:32  ♥️ 156         │  <- 大字体，防汗
│                             │
│      ┌─────────┐           │
│      │  ♪ ♪ ♪  │           │  <- 简化波形
│      │  ♪ ♪ ♪  │           │
│      └─────────┘           │
│                             │
│   🥁 180 SPM  ⚡ 5:20/km   │  <- 核心数据
│                             │
│   [⏸️]  [⏭️]  [📍]         │  <- 大按钮
│                             │
│  下一首: Stronger (BPM 90) │
│  提醒: 2分钟后补水          │  <- 基于时间的提醒
└─────────────────────────────┘
```

### 离线策略

- **预下载**: 比赛前下载完整歌单至本地
- **后台播放**: 锁屏/切换应用持续播放
- **省电模式**: 降低波形渲染帧率，延长续航
- **时间同步**: 基于设备时间，无需GPS也可使用提醒功能

---

## 🔒 隐私与安全

- **零上传**: 所有音频处理在本地完成
- **无账号**: 无需注册，数据存本地IndexedDB
- **可选同步**: 支持导出加密备份至用户网盘
- **开源可审计**: 代码透明，无恶意行为

---

## 🛠️ 开发计划

### 版本路线图

**v1.0 - 起跑线** (MVP)
- [x] 基础格式转换 (NCM, QMC)
- [x] 180BPM节拍器
- [x] 简单剪辑拼接
- [x] 基于时间的提醒功能

**v1.5 - 配速员**
- [ ] 全格式支持 (KGM, KWM, MGG)
- [ ] 智能BPM检测
- [ ] 步频-音乐同步
- [ ] 基于时间的马拉松模板

**v2.0 - 破风手**
- [ ] GPS配速对比提醒
- [ ] 语音合成提醒
- [ ] 时间能量曲线自动排歌
- [ ] 训练计划集成

**v2.5 - 兔子**
- [ ] 手表端支持 (Garmin Connect IQ)
- [ ] 社区歌单分享
- [ ] AI训练建议
- [ ] 比赛日模式

---

## 📮 跑者社区

- 官网: https://paomama.run
- 反馈: https://github.com/paomama/paomama/issues
- 讨论: https://github.com/paomama/paomama/discussions
- 微博: @跑马吗官方
- 微信: 跑马吗Runner

---

**Made with ♥ by Runners, for Runners**  
🏃‍♂️🏃‍♀️🏃‍♂️🏃‍♀️🏃‍♂️🏃‍♀️🏃‍♂️🏃‍♀️  
*用对的节奏，跑更远的距离*
