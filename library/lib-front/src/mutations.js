import { gql  } from '@apollo/client'

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $publishedNbr: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $publishedNbr,
      genres: $genres
    ) {
      title
      published
    }
  }
`
export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!,$setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ) {
      name, born
    }
  }
  `

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
      user {
        username
        favoriteGenre
      }
    }
  }
  `
  const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    published 
    author {
      name 
      born
    }
    genres
  }
`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
`