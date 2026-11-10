import type { PacePlan, KmMarker, TimeMarker } from '@/core/types';

export class PaceCalculator {
  calculatePacePlan(paceStr: string, distanceKm: number): PacePlan {
    const pacePerKm = this.parsePace(paceStr);
    const totalTime = pacePerKm * distanceKm;

    const kmMarkers: KmMarker[] = [];
    for (let km = 1; km <= Math.floor(distanceKm); km++) {
      kmMarkers.push({
        km,
        time: pacePerKm * km,
        message: `${km}公里，用时${this.formatPace(pacePerKm * km / km)}`,
      });
    }

    const halfWayMarker: TimeMarker = {
      time: pacePerKm * (distanceKm / 2),
      message: `半程！${(distanceKm / 2).toFixed(1)}公里`,
    };

    const finishMarker: TimeMarker = {
      time: totalTime,
      message: '恭喜完赛！',
    };

    return { targetPace: pacePerKm, targetDistance: distanceKm, totalTime, kmMarkers, halfWayMarker, finishMarker };
  }

  parsePace(paceStr: string): number {
    const parts = paceStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]!) * 60 + parseInt(parts[1]!);
    }
    return parseInt(paceStr) || 341; // 默认5:41/km
  }

  formatPace(secondsPerKm: number): string {
    const min = Math.floor(secondsPerKm / 60);
    const sec = Math.floor(secondsPerKm % 60);
    return `${min}:${String(sec).padStart(2, '0')}/km`;
  }

  getDistancePreset(preset: string): number {
    const presets: Record<string, number> = {
      '5K': 5,
      '10K': 10,
      'halfMarathon': 21.0975,
      'fullMarathon': 42.195,
    };
    return presets[preset] ?? 42.195;
  }
}

export const paceCalculator = new PaceCalculator();
