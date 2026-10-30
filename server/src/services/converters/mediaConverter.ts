import fsSync from 'fs';

let _ffmpegInstance: any = null;

async function getFfmpeg() {
  if (_ffmpegInstance) return _ffmpegInstance;

  const fluentModule = await import('fluent-ffmpeg');
  const ffmpeg = (fluentModule as any).default || fluentModule;

  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
  } else if (fsSync.existsSync('/usr/bin/ffmpeg')) {
    ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
  }

  if (process.env.FFPROBE_PATH) {
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
  } else if (fsSync.existsSync('/usr/bin/ffprobe')) {
    ffmpeg.setFfprobePath('/usr/bin/ffprobe');
  }

  _ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function convertMedia(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const ffmpeg = await getFfmpeg();

  return new Promise<void>((resolve, reject) => {
    let command = ffmpeg(inputPath);

    const isVideoSource = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(sourceFormat);
    const isAudioTarget = ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac'].includes(targetFormat);

    if (isVideoSource && isAudioTarget) {
      command = command.noVideo();
    }

    // Video / Frame snapshot extraction: Video -> JPG/PNG
    if (isVideoSource && (targetFormat === 'jpg' || targetFormat === 'jpeg' || targetFormat === 'png')) {
      command
        .seekInput('00:00:01')
        .frames(1)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`Frame extraction failed: ${err.message}`)))
        .run();
      return;
    }

    // Video to GIF: MP4 -> GIF
    if (sourceFormat === 'mp4' && targetFormat === 'gif') {
      command
        .fps(12)
        .complexFilter(['scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`GIF creation failed: ${err.message}`)))
        .run();
      return;
    }

    // GIF to Video: GIF -> MP4
    if (sourceFormat === 'gif' && targetFormat === 'mp4') {
      command
        .videoCodec('libx264')
        .outputOptions([
          '-movflags faststart',
          '-pix_fmt yuv420p',
          '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`MP4 from GIF failed: ${err.message}`)))
        .run();
      return;
    }

    // Audio target codecs
    if (targetFormat === 'mp3') {
      command = command.audioCodec('libmp3lame').audioBitrate('192k');
    } else if (targetFormat === 'wav') {
      command = command.audioCodec('pcm_s16le');
    } else if (targetFormat === 'flac') {
      command = command.audioCodec('flac');
    } else if (targetFormat === 'ogg' || targetFormat === 'opus') {
      command = command.audioCodec('libvorbis');
    } else if (targetFormat === 'm4a' || targetFormat === 'aac') {
      command = command.audioCodec('aac').audioBitrate('192k');
    }

    // Video target codecs
    if (targetFormat === 'mp4') {
      command = command.videoCodec('libx264').audioCodec('aac').outputOptions(['-pix_fmt yuv420p']);
    } else if (targetFormat === 'webm') {
      command = command.videoCodec('libvpx-vp9').audioCodec('libopus');
    } else if (targetFormat === 'mov') {
      command = command.videoCodec('libx264').audioCodec('aac');
    }

    command
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(new Error(`Media conversion failed: ${err.message}`)))
      .run();
  });
}

