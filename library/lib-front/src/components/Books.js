import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries.js'
const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  if (result.loading)  {
    return <div>loading...</div>
  }
  console.log('result.data', result.data)
  const books = result.data.allBooks
  
  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Books</h2>
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
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books