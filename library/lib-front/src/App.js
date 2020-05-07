import React from 'react';
import { gql, useQuery } from '@apollo/client'
import Authors from './components/Authors'

const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name
      born
      bookCount
    }
  }
`

function App() {
  const result = useQuery(ALL_AUTHORS)

  if (result.loading)  {
    return <div>loading...</div>
  }
  return (
    <Authors authors = {result.data.allAuthors}/>
  )
}

export default App;
