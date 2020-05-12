import { gql  } from '@apollo/client'

export const ALL_AUTHORS = gql`
    query {
      allAuthors  {
        name
        born
        bookCount
      }
    }
  `

export const ALL_BOOKS = gql`
  query { 
    allBooks {
      title
      author {name}
      published
      genres
  }
}
`
export const FIND_GENRE_BOOKS = gql`
  query findBooksByGenre($genreToSearch: String) {
    allBooks(genre: $genreToSearch) {
      title
      author {name}
      published
      genres
    }
  }
`

export const FIND_ME = gql`
  query meee {
    username
    favoriteGenre
  }
`
export const CURRENT_USER = gql`
    query {
      currentUser  {
        username
        favoriteGenre
      }
    }
  `

