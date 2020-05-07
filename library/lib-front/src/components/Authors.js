import React from 'react';

const Authors = ({ authors }) => {
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