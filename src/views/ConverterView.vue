<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { decoderFactory } from '@/core/audio/decoder/decoder-factory';
import { encoderFactory } from '@/core/audio/encoder/encoder-factory';

const { t } = useI18n();

interface FileTask {
  file: File;
  status: 'waiting' | 'converting' | 'done' | 'error';
  message?: string;
  downloadUrl?: string;
  downloadName?: string;
}

const isDragOver = ref(false);
const tasks = ref<FileTask[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const isConverting = ref(false);

function addFiles(fileList: FileList | File[]) {
  tasks.value = [...tasks.value, ...[...fileList].map((file) => ({ file, status: 'waiting' as const }))];
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = false;
  if (e.dataTransfer?.files.length) addFiles(e.dataTransfer.files);
}
function onDragOver(e: DragEvent) { e.preventDefault(); isDragOver.value = true; }
function onDragLeave() { isDragOver.value = false; }
function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) addFiles(input.files);
  input.value = '';
}
function removeTask(index: number) {
  const task = tasks.value[index];
  if (task?.downloadUrl) URL.revokeObjectURL(task.downloadUrl);
  tasks.value.splice(index, 1);
}

// 统一导出 MP3：源已是 MP3 时直接输出（避免二次有损编码），无损/其他格式重编码为 192kbps
async function startConvert() {
  if (isConverting.value) return;
  isConverting.value = true;
  try {
    for (const task of tasks.value) {
      if (task.status !== 'waiting') continue;
      task.status = 'converting';
      try {
        const result = await decoderFactory.decodeAny(task.file);
        const base = (result.metadata.title || task.file.name.replace(/\.[^.]+$/, '')).trim();
        const artist = result.metadata.artist.trim();
        task.downloadName = `${artist ? artist + ' - ' : ''}${base}.mp3`;

        let blob: Blob;
        if (result.format === 'mp3') {
          blob = new Blob([result.audioData], { type: 'audio/mpeg' });
          task.message = '源为 MP3，直接导出';
        } else {
          blob = await encoderFactory.encode(result.audioData, {
            format: 'mp3', bitrate: 192000, sampleRate: 44100, channels: 2,
          });
          task.message = `${result.format.toUpperCase()} 已重编码为 MP3 192kbps`;
        }

        task.downloadUrl = URL.createObjectURL(blob);
        task.status = 'done';
        task.message = `${(blob.size / 1024 / 1024).toFixed(1)} MB（${task.message}）`;
      } catch (e) {
        task.status = 'error';
        task.message = e instanceof Error ? e.message : String(e);
      }
    }
  } finally {
    isConverting.value = false;
  }
}

const statusText: Record<FileTask['status'], string> = {
  waiting: '等待转换',
  converting: '转换中…',
  done: '完成',
  error: '失败',
};
</script>

<template>
  <div class="runner-section animate-slide-up">
    <div class="mb-6">
      <h1 class="text-runner-xl font-bold mb-1">{{ t('converter.title') }}</h1>
      <p style="color: #8A8A8A;" class="text-runner-sm">加密歌曲一键解密，统一导出为 MP3（手机/手表/车载通用）</p>
    </div>

    <!-- Drop Zone -->
    <div
      class="rounded-runner-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200"
      :style="isDragOver ? { borderColor: '#E53935', background: 'rgba(229,57,53,0.05)' } : { borderColor: '#E8E8E8', background: '#F5F5F5' }"
      @click="fileInput?.click()" @drop="onDrop" @dragover="onDragOver" @dragleave="onDragLeave"
    >
      <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background: rgba(229,57,53,0.08);">
        <font-awesome-icon icon="fa-cloud-upload-alt" class="text-2xl" style="color: #E53935;" />
      </div>
      <p class="font-semibold text-runner-base mb-1" style="color: #1A1A1A;">{{ t('converter.dropHere') }}</p>
      <p class="text-runner-sm mb-4" style="color: #8A8A8A;">支持网易云 NCM / QQ音乐 QMC / 酷狗 KGM / 酷我 KWM 加密格式</p>
      <button class="runner-btn-primary">{{ t('converter.selectFiles') }}</button>
      <input
        ref="fileInput" type="file" multiple class="hidden"
        accept=".ncm,.qmc,.qmc0,.qmc2,.qmc3,.qmc4,.qmc6,.qmc8,.qmcflac,.qmcogg,.mflac,.mflac0,.mgg,.mgg0,.mgg1,.mggl,.mmp4,.tkm,.kgm,.kgma,.vpr,.kwm,.mp3,.flac,.wav,.m4a,.ogg,audio/*"
        @change="onFileSelect"
      >
    </div>

    <!-- File List -->
    <div v-if="tasks.length > 0" class="mt-4 space-y-2">
      <div v-for="(task, i) in tasks" :key="task.file.name + i" class="runner-card flex items-center gap-3 py-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: rgba(229,57,53,0.08);">
          <font-awesome-icon icon="fa-music" class="text-lg" style="color: #E53935;" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-runner-sm font-medium truncate" style="color: #1A1A1A;">{{ task.file.name }}</p>
          <p class="text-runner-xs truncate" :style="{ color: task.status === 'error' ? '#E53935' : '#8A8A8A' }">
            {{ statusText[task.status] }}{{ task.message ? ' · ' + task.message : '' }}
          </p>
        </div>
        <span class="runner-badge-primary">{{ task.file.name.split('.').pop()?.toUpperCase() }}</span>
        <a
          v-if="task.status === 'done' && task.downloadUrl" :href="task.downloadUrl" :download="task.downloadName"
          class="w-9 h-9 rounded-lg flex items-center justify-center no-underline transition-colors"
          style="background: rgba(0,200,83,0.1); color: #00C853;" title="下载"
        >
          <font-awesome-icon icon="fa-download" class="text-lg" />
        </a>
        <button
          class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          style="background: rgba(0,0,0,0.04); color: #8A8A8A;" title="移除"
          @click="removeTask(i)"
        >
          <font-awesome-icon icon="fa-xmark" class="text-lg" />
        </button>
      </div>
    </div>

    <!-- Convert Button -->
    <button
      v-if="tasks.length > 0" class="runner-btn-primary w-full mt-6 py-3 text-runner-lg"
      :disabled="isConverting" :style="isConverting ? 'opacity: 0.6' : ''"
      @click="startConvert"
    >
      <font-awesome-icon icon="fa-file-audio" class="text-xl mr-2" />
      {{ isConverting ? '转换中…' : `一键导出 MP3 (${tasks.length} 个文件)` }}
    </button>
  </div>
</template>
