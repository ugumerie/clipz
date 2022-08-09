import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isReady = false;
  isRunning = false;
  private ffmpeg;

  constructor() {
    // returns a factory function or creates a new instance
    // log helps in debugging during development
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return
    }

    //loads the webassembly file async
    await this.ffmpeg.load()
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    this.isRunning = true

    //convert the file object to binary data for wasm
    const data = await fetchFile(file);

    //write file to the mem file system
    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = [1, 3, 5] // first 3 seconds
    const commands: string[] = []

    // for efficiency - all in one command
    seconds.forEach(second => {
      commands.push(
        // Input
      '-i', file.name,

      //Output options
      //-ss means timestamp where we would capture the timestamp -hh:mm:ss
      //videos are series of frame merged together to form video. we are selecting 1 frame out of a series of frame in the first
      //second of the video. scale=510:300 => w: 510, h:300 h:-1 to preserve the aspect ratio
      '-ss', `00:00:0${second}`,
      '-frames:v', '1',
      '-filter:v', 'scale=510:-1',

      //Output
      `output_0${second}.png`
      )
    })

    //run ffmpeg commands
    await this.ffmpeg.run(
      ...commands
    )

    //retrieve screenshots
    const screenshots: string[] = []

    seconds.forEach(second => {
      // return binary array
      const screenshotFile = this.ffmpeg.FS('readFile',  `output_0${second}.png`)

      const screenshotBlob = new Blob(
        // actual (raw) file data
        [screenshotFile.buffer],
        
        // set the file type
        {
          type: 'image/png'
        }
      ) // binary large objects

      // create a url from the blob object to be rendered on the browser
      const screenshotURL = URL.createObjectURL(screenshotBlob)

      screenshots.push(screenshotURL)
    })

    this.isRunning = false

    return screenshots
  }

  async blobFromURL(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()

    return blob;
  }
}
