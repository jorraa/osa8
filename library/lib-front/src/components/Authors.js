import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import { EDIT_AUTHOR } from '../mutations.js'

const Authors = (props) => {
  const setError = props.setError

  // query uses cache, means almost all the same where/when queried
  const result = useQuery(ALL_AUTHORS)

  const [ editAuthor, editResult ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ {query: ALL_AUTHORS} ],
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {
    if (editResult.data && !editResult.data.editAuthor) {
      setError('Author not found')
    }
    //eslint-disable-next-line
  }, [editResult.data]) 

  if (result.loading)  {
    return <div>loading...</div>
  }
  const authors =result.data.allAuthors

  const EditAuthorForm = ( { setError } ) => {
    const [born, setBorn] = useState('')
    const [name, setName] = useState('')
    const submitAuthor = async (event) => {
      event.preventDefault()
      const setBornTo = Number(born)
      
      editAuthor({
        variables: { name, setBornTo }
      })
      setName('')
      setBorn('')
    }

    return (
      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={submitAuthor}>
          <div>
          <input id='authorName'
                value={name}
                onChange={({ target }) => setName(target.value)}
          />
          </div>
          <div>
          <input
                value={born}
                onChange={({ target }) => setBorn(target.value)}
          />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>
    )
}


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
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>  
          )}
        </tbody>
      </table>
      <EditAuthorForm setError = {setError}/>
    </div>
  )
}

export default Authors