import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
//import { ALL_BOOKS } from '../queries.js'
import { FIND_GENRE_BOOKS } from '../queries.js'

const Books = (props) => {
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const genreNow = props.type === 'recommend' && props.user
    ?props.user.favoriteGenre
    :genre
  
  const result = useQuery(FIND_GENRE_BOOKS, {
    variables: { genreToSearch: genreNow },
  })

  if (result.loading)  {
    return <div>loading...</div>
  }
  const books = result.data.allBooks
  if(!genres.length) { // first time there are all books
    let newGenres = []
    books.forEach(b => {
      b.genres.forEach(g => {
        if(!newGenres.includes(g)) {
          newGenres = newGenres.concat(g)
        }
      })
    })
    setGenres(newGenres)
  }
  if (!props.show) {
    return null
  }

  return (
    <div>
      {props.type === 'recommend' && props.user
      ?<>
        <h2>recommendations</h2>
        {props.user.favoriteGenre
          ?<div>books in your favourite genre <b>{props.user.favoriteGenre}</b></div> 
          :''
        }
      </>
      :<>
        <h2>Books</h2>
        {genre
          ?<div>in genre <b>{genre}</b></div> 
          :''
        }
      </>  
      }
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
              <td>{a.genres}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {props.type === 'normal'
          ? <> 
              {genres.map( genre => 
                <button key={genre} onClick = {() => setGenre( genre ) }> {genre}  </button>
              )}
              <button onClick={() => setGenre('')}>all genres</button>
            </>
          :''
        }
      </div>
    </div>
  )
}

export default Books