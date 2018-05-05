import createApiSpec from '~/apiSpecs'
import { Song } from './song.model'
import { runQuery, dropDb } from '~/testhelpers'
import { expect } from 'chai'

createApiSpec(
  Song,
  'song',
  {title: 'downtown jamming', url: 'http://music.mp3'}
)

describe.only('Song', () => {
  let songs
  beforeEach(async () => {
    await dropDb()
    songs = await Song.insertMany([
      { title: 'Monkey Wrenches', url: 'http://mon.key' },
      { title: 'Monkey Hammers', url: 'http://mon.keys' }
    ])
  })

  afterEach(async () => {
    await dropDb()
  })

  it('should get a song', async () => {
    const song = songs[0]
    const query = `
      {
        Song(id:"${song.id}") {
          id
          title
          url
          album
          artist
          rating
          favorite
        }
      }
    `
    const res = await runQuery(query, {})
    const { id, title, url, album=null, artist=null, rating, favorite } = song;
    expect(res.errors).to.not.exist
    expect(res.data.Song).to.eql({ id, title, url, album, artist, rating, favorite })
  })

  it('should get all songs', async () => {
    const query = `
      {
        allSongs {
          id
          title
        }
      }
    `
    const res = await runQuery(query, {})
    expect(res.errors).to.not.exist
    expect(res.data.allSongs).to.have.deep.members([
      {id: songs[0].id, title: songs[0].title},
      {id: songs[1].id, title: songs[1].title},
    ])
  })

  it('should create a song', async () => {
    const query = `
      mutation NewSong($input: NewSong!) {
        newSong(input: $input) {
          id
          title
          url
        }
      }
    `
    const newSong = { title: "new song", url: "http://test" }
    const res = await runQuery(query, {"input": newSong})
    expect(res.errors).to.not.exist
    expect(res.data.newSong.id).to.exist
    expect(res.data.newSong).to.include(newSong)
  })

  it('should update a song', async () => {
    const query = `
      mutation UpdateSong($input: UpdatedSong!) {
        updateSong(input: $input) {
          id
          title
          url
        }
      }
    `
    const updatedSong = { id: songs[0].id, title: "Donkey Spanners", url: "http://don.key" }
    const res = await runQuery(query, { input: updatedSong })
    expect(res.errors).to.not.exist
    expect(res.data.updateSong).to.eql(updatedSong)
  })
})
