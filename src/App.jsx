import { useEffect, useRef, useState } from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { saveAs } from 'file-saver'
import './App.css'

const ffmpeg = createFFmpeg({ log: true })

function App() {
  const [video, setVideo] = useState('')
  const [videoName, setVideoName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isType, setIsType] = useState('GIF')

  const formRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      await ffmpeg.load()
    }
    init()
  }, [])

  const handleInput = (e) => {
    const file = e.target.files?.item(0)
    setVideo(URL.createObjectURL(file))
    setVideoName(file?.name)
  }


  const handleClose = () => {
    setVideo('')
    setVideoName('')
    formRef.current.reset()
  }

  const handleConvert = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name') || 'output'
    const start = formData.get('start') || '0'
    const time = formData.get('time') || '10'
    const outname = isType === 'GIF' ? `${name}.gif` : `${name}.mp3`
    const type = isType === 'GIF' ? 'image/gif' : 'audio/mp3'

    setLoading(true)

    ffmpeg.FS('writeFile', name, await fetchFile(video))
    await ffmpeg.run('-i', name, '-t', time, '-ss', start, '-f', isType, outname)
    // -i:  is the input file
    // -t: is the time or length of the video
    // -ss: is the starting second
    // -f: is for encoding, in our case, gif or mp3
    // ${name}.gif: is the name of the file we want to write to memory
    const data = ffmpeg.FS('readFile', outname)

    const url = URL.createObjectURL(
      new Blob([data.buffer], { type })
    )

    saveAs(url, outname)

    setLoading(false)
    handleClose()
  }

  return (
    <main>
      <div className='container'>
        {
          video ? (
            <div className='video_container'>
              <video controls src={video}></video>
              <button type="button" className='video_close' onClick={handleClose}>X</button>
            </div>
          ) : (
            <label className='video_input'>
              Upload a video to Convert to GIF or MP3
              <input type="file" name="" accept='video/*' onChange={handleInput} hidden />
            </label>
          )
        }
      </div>
      <h3>{videoName}</h3>
      <form onSubmit={handleConvert} ref={formRef}>
        <div className='group'>
          <label>
            <input type="checkbox" value="GIF" checked={isType === 'GIF'} onChange={e => setIsType(e.target.value)} />
            Convert to GIF
          </label>
          <label>
            <input type="checkbox" value="MP3" checked={isType === 'MP3'} onChange={e => setIsType(e.target.value)} />
            Convert to MP3
          </label>
        </div>
        <div className='group'>
          <label>
            <p>Name to Download</p>
            <input type="text" name='name' placeholder='Ex: output' />
          </label>
          <label>
            <p>Start</p>
            <input type="number" name='start' min={0} defaultValue={0} />
          </label>
          <label>
            <p>Time</p>
            <input type="number" name='time' min={0} defaultValue={10} />
          </label>
          <div>
            <p>&nbsp;</p>
            <button disabled={!video || loading}>
              {loading ? 'Downloading and conveting...' : `Download and convert to ${isType}`}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}

export default App
