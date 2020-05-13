import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_BOOK } from '../mutations.js'
import { ALL_AUTHORS, FIND_GENRE_BOOKS } from '../queries.js'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [ createBook ] = useMutation(CREATE_BOOK, {
    refetchQueries: [  
      {query: ALL_AUTHORS},
      //{query: ALL_BOOKS},
      {query: FIND_GENRE_BOOKS, 
        variables: { genreToSearch: '' },
      }
      ],
    onError: (error) => {
      props.setError(error.graphQLErrors[0].message)
    } //update ei vaan onnistunut, joten refetchin kautta
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    const publishedNbr = Number(published)
    createBook({
      variables: { title, author, publishedNbr, genres }
    })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook