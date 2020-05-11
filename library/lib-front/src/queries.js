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
  query ($genre: String!) { 
    allBooks {
      title
      author {name}
      published
  }
}
`
export const FIND_GENRE_BOOKS = gql`
  query findBooksByGenre($genreToSearch: String!) {
    allBooks(genre: $genreToSearch) {
      title
      author {name}
      published
    }
  }
`
export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      name
      phone 
      id
      address {
        street
        city
      }
    }
  }
`