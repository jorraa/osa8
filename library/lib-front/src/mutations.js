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
      author
      published
    }
  }
`
