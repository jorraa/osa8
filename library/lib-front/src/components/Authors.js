import React from 'react';
import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
const Authors = (props) => {

  // query uses cache, means all the same where/when queried
  const result = useQuery(ALL_AUTHORS)
  if (result.loading)  {
    return <div>loading...</div>
  }
  const authors =result.data.allAuthors

  if (!props.show) {
    return null
  }

    return (
    <div>
      <h2>Authors</h2>
      <table>
        <thead>
          <tr><th></th><th>born</th><th>books</th></tr>
        </thead>
        <tbody>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td><td>{a.born}</td><td>{a.bookCount}</td>
            </tr>  
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Authors